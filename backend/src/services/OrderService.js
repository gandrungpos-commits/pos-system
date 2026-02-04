/**
 * Order Service
 * Handles order creation, status management, retrieval
 */

import knex from '../config/database.js';
import logger from '../config/logger.js';
import { generateOrderNumber } from '../utils/helpers.js';

const ORDER_STATUS_FLOW = {
  pending: ['paid', 'cancelled'],
  paid: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

class OrderService {
  /**
   * Create new order with items
   * @param {number} tenantId - Tenant ID
   * @param {string} customerName - Customer name
   * @param {string} customerPhone - Customer phone
   * @param {Array} items - Order items [{item_name, quantity, unit_price, notes}]
   * @param {string} orderType - 'takeaway' or 'dine_in'
   * @param {number} tableNumber - Table number (for dine_in only)
   * @returns {Object} - Created order with ID and order number
   */
  async createOrder(tenantId, customerName, customerPhone, items, orderType = 'takeaway', tableNumber = null) {
    const trx = await knex.transaction();

    try {
      // Validate tenant exists
      const tenant = await trx('tenants').where({ id: tenantId }).first();
      if (!tenant) {
        const error = new Error('Tenant not found');
        error.statusCode = 404;
        throw error;
      }

      // Generate unique order number
      const orderNumber = await generateOrderNumber(tenantId);

      // Calculate total amount from items
      const totalAmount = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price);
      }, 0);

      // Create order
      const [order] = await trx('orders').insert({
        order_number: orderNumber,
        tenant_id: tenantId,
        customer_name: customerName,
        customer_phone: customerPhone,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'unpaid',
        order_type: orderType,
        table_number: orderType === 'dine_in' ? tableNumber : null,
        created_at: new Date()
      }).returning('*');

      // Add order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price,
        notes: item.notes || ''
      }));

      await trx('order_items').insert(orderItems);

      // Commit transaction
      await trx.commit();

      logger.info(`Order created: ${orderNumber} for tenant ${tenantId}`);

      return {
        id: order.id,
        order_number: order.order_number,
        tenant_id: order.tenant_id,
        customer_name: order.customer_name,
        total_amount: order.total_amount,
        status: order.status,
        payment_status: order.payment_status,
        created_at: order.created_at
      };
    } catch (error) {
      await trx.rollback();
      logger.error(`Failed to create order:`, error.message);
      throw error;
    }
  }

  /**
   * Get order details by ID
   * @param {number} orderId - Order ID
   * @returns {Object} - Order with items
   */
  async getOrder(orderId) {
    try {
      const order = await knex('orders')
        .where({ id: orderId })
        .first();

      if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
      }

      // Get order items
      const items = await knex('order_items')
        .where({ order_id: orderId });

      // Get QR code if exists
      const qrCode = await knex('qr_codes')
        .where({ order_id: orderId })
        .first();

      // Get payment if exists
      const payment = await knex('payments')
        .where({ order_id: orderId })
        .orderBy('created_at', 'desc')
        .first();

      return {
        ...order,
        items,
        qr_code: qrCode,
        payment: payment
      };
    } catch (error) {
      logger.error(`Failed to get order ${orderId}:`, error.message);
      throw error;
    }
  }

  /**
   * List orders with filters
   * @param {Object} filters - { status, tenant_id, payment_status, order_type, date_from, date_to, limit, offset }
   * @returns {Array} - Orders matching filters
   */
  async listOrders(filters = {}) {
    try {
      let query = knex('orders');

      // Apply filters
      if (filters.status) query = query.where('status', filters.status);
      if (filters.tenant_id) query = query.where('tenant_id', filters.tenant_id);
      if (filters.payment_status) query = query.where('payment_status', filters.payment_status);
      if (filters.order_type) query = query.where('order_type', filters.order_type);

      if (filters.date_from) {
        query = query.where('created_at', '>=', new Date(filters.date_from));
      }
      if (filters.date_to) {
        query = query.where('created_at', '<=', new Date(filters.date_to));
      }

      // Get total count
      const countResult = await query.clone().count('id as count').first();
      const total = countResult.count;

      // Apply pagination
      const limit = Math.min(filters.limit || 20, 100);
      const offset = filters.offset || 0;

      const orders = await query
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      return {
        orders,
        total,
        limit,
        offset
      };
    } catch (error) {
      logger.error('Failed to list orders:', error.message);
      throw error;
    }
  }

  /**
   * Update order status with validation
   * @param {number} orderId - Order ID
   * @param {string} newStatus - New status
   * @returns {Object} - Updated order
   */
  async updateOrderStatus(orderId, newStatus) {
    try {
      const order = await knex('orders').where({ id: orderId }).first();

      if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
      }

      // Validate status transition
      const allowedTransitions = ORDER_STATUS_FLOW[order.status] || [];
      if (!allowedTransitions.includes(newStatus)) {
        const error = new Error(`Cannot transition from '${order.status}' to '${newStatus}'`);
        error.statusCode = 400;
        throw error;
      }

      // Update status with appropriate timestamps
      const updateData = { status: newStatus };

      if (newStatus === 'ready') {
        updateData.ready_at = new Date();
      } else if (newStatus === 'completed') {
        updateData.completed_at = new Date();
      }

      const [updated] = await knex('orders')
        .where({ id: orderId })
        .update(updateData)
        .returning('*');

      logger.info(`Order ${orderId} status updated to '${newStatus}'`);

      return updated;
    } catch (error) {
      logger.error(`Failed to update order ${orderId}:`, error.message);
      throw error;
    }
  }

  /**
   * Cancel order
   * @param {number} orderId - Order ID
   * @param {string} reason - Cancellation reason
   * @returns {Object} - Cancelled order
   */
  async cancelOrder(orderId, reason = null) {
    const trx = await knex.transaction();

    try {
      const order = await trx('orders').where({ id: orderId }).first();

      if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
      }

      // Can only cancel if not already completed
      if (order.status === 'completed') {
        const error = new Error('Cannot cancel completed order');
        error.statusCode = 400;
        throw error;
      }

      // Update order status
      await trx('orders')
        .where({ id: orderId })
        .update({
          status: 'cancelled',
          payment_status: 'refunded'
        });

      // If paid, create refund record
      if (order.payment_status === 'paid') {
        const payment = await trx('payments')
          .where({ order_id: orderId, status: 'success' })
          .first();

        if (payment) {
          await trx('payments').insert({
            order_id: orderId,
            checkout_counter_id: payment.checkout_counter_id,
            kasir_id: payment.kasir_id,
            amount_paid: -order.total_amount, // Negative for refund
            payment_method: payment.payment_method,
            transaction_reference: `REFUND-${payment.transaction_reference}`,
            status: 'refunded',
            payment_details: {
              refund_reason: reason,
              original_transaction: payment.transaction_reference
            }
          });
        }
      }

      await trx.commit();

      logger.info(`Order ${orderId} cancelled. Reason: ${reason}`);

      return {
        success: true,
        order_id: orderId,
        refund_amount: order.payment_status === 'paid' ? order.total_amount : 0
      };
    } catch (error) {
      await trx.rollback();
      logger.error(`Failed to cancel order ${orderId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get orders by tenant with status
   * @param {number} tenantId - Tenant ID
   * @param {string} status - Filter by status (optional)
   * @returns {Array} - Tenant's orders
   */
  async getOrdersByTenant(tenantId, status = null) {
    try {
      let query = knex('orders')
        .where({ tenant_id: tenantId })
        .orderBy('created_at', 'desc');

      if (status) {
        query = query.where({ status });
      }

      return await query;
    } catch (error) {
      logger.error(`Failed to get orders for tenant ${tenantId}:`, error.message);
      throw error;
    }
  }
}

export default new OrderService();

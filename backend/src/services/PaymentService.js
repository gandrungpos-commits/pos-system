/**
 * Payment Service
 * Handles payment processing, refunds, settlement
 */

import knex from '../config/database.js';
import logger from '../config/logger.js';
import { generateTransactionId } from '../utils/helpers.js';

const PAYMENT_METHODS = ['cash', 'card', 'e_wallet', 'qris'];

class PaymentService {
  /**
   * Process payment for order
   * @param {number} orderId - Order ID
   * @param {number} amount - Payment amount
   * @param {string} paymentMethod - cash|card|e_wallet|qris
   * @param {number} checkoutCounterId - Counter ID
   * @param {number} kasirId - Kasir user ID
   * @param {Object} paymentDetails - Additional payment details
   * @returns {Object} - Payment record created
   */
  async processPayment(orderId, amount, paymentMethod, checkoutCounterId, kasirId, paymentDetails = {}) {
    const trx = await knex.transaction();

    try {
      // Validate order exists
      const order = await trx('orders').where({ id: orderId }).first();
      if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
      }

      // Validate payment method
      if (!PAYMENT_METHODS.includes(paymentMethod)) {
        const error = new Error(`Invalid payment method. Allowed: ${PAYMENT_METHODS.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }

      // Validate amount
      if (amount <= 0) {
        const error = new Error('Payment amount must be greater than 0');
        error.statusCode = 400;
        throw error;
      }

      if (amount < order.total_amount) {
        const error = new Error(`Insufficient payment. Required: ${order.total_amount}, Paid: ${amount}`);
        error.statusCode = 400;
        throw error;
      }

      // Generate transaction reference
      const transactionRef = generateTransactionId();

      // Create payment record
      const [payment] = await trx('payments').insert({
        order_id: orderId,
        checkout_counter_id: checkoutCounterId,
        kasir_id: kasirId,
        amount_paid: amount,
        payment_method: paymentMethod,
        transaction_reference: transactionRef,
        status: 'success',
        payment_details: JSON.stringify(paymentDetails),
        created_at: new Date()
      }).returning('*');

      // Update order payment status
      await trx('orders')
        .where({ id: orderId })
        .update({
          payment_status: 'paid',
          paid_at: new Date()
        });

      // Calculate change
      const change = amount - order.total_amount;

      await trx.commit();

      logger.info(`Payment processed for order ${orderId}: ${transactionRef}`);

      return {
        id: payment.id,
        order_id: payment.order_id,
        amount_paid: payment.amount_paid,
        change: change,
        payment_method: payment.payment_method,
        transaction_reference: payment.transaction_reference,
        status: payment.status,
        created_at: payment.created_at
      };
    } catch (error) {
      await trx.rollback();
      logger.error(`Payment processing failed for order ${orderId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get payment by ID
   * @param {number} paymentId - Payment ID
   * @returns {Object} - Payment record with details
   */
  async getPayment(paymentId) {
    try {
      const payment = await knex('payments')
        .where({ id: paymentId })
        .first();

      if (!payment) {
        const error = new Error('Payment not found');
        error.statusCode = 404;
        throw error;
      }

      return {
        ...payment,
        payment_details: payment.payment_details ? JSON.parse(payment.payment_details) : {}
      };
    } catch (error) {
      logger.error(`Failed to get payment ${paymentId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all payments for order
   * @param {number} orderId - Order ID
   * @returns {Array} - Payment records
   */
  async getPaymentsByOrder(orderId) {
    try {
      const payments = await knex('payments')
        .where({ order_id: orderId })
        .orderBy('created_at', 'desc');

      return payments.map(p => ({
        ...p,
        payment_details: p.payment_details ? JSON.parse(p.payment_details) : {}
      }));
    } catch (error) {
      logger.error(`Failed to get payments for order ${orderId}:`, error.message);
      throw error;
    }
  }

  /**
   * Refund payment
   * @param {number} paymentId - Payment ID to refund
   * @param {string} reason - Refund reason
   * @returns {Object} - Refund record created
   */
  async refundPayment(paymentId, reason = null) {
    const trx = await knex.transaction();

    try {
      const payment = await trx('payments').where({ id: paymentId }).first();

      if (!payment) {
        const error = new Error('Payment not found');
        error.statusCode = 404;
        throw error;
      }

      if (payment.status !== 'success') {
        const error = new Error(`Cannot refund payment with status: ${payment.status}`);
        error.statusCode = 400;
        throw error;
      }

      // Generate refund transaction ID
      const refundTransRef = `REFUND-${generateTransactionId()}`;

      // Create refund record (negative amount)
      const [refund] = await trx('payments').insert({
        order_id: payment.order_id,
        checkout_counter_id: payment.checkout_counter_id,
        kasir_id: payment.kasir_id,
        amount_paid: -payment.amount_paid, // Negative for refund
        payment_method: payment.payment_method,
        transaction_reference: refundTransRef,
        status: 'refunded',
        payment_details: JSON.stringify({
          refund_reason: reason,
          original_payment_id: paymentId,
          original_transaction: payment.transaction_reference
        }),
        created_at: new Date()
      }).returning('*');

      // Update original payment status
      await trx('payments')
        .where({ id: paymentId })
        .update({ status: 'refunded' });

      // Update order payment status
      await trx('orders')
        .where({ id: payment.order_id })
        .update({ payment_status: 'refunded' });

      await trx.commit();

      logger.info(`Payment ${paymentId} refunded: ${refundTransRef}`);

      return {
        id: refund.id,
        original_payment_id: paymentId,
        refund_amount: Math.abs(refund.amount_paid),
        transaction_reference: refund.transaction_reference,
        reason: reason
      };
    } catch (error) {
      await trx.rollback();
      logger.error(`Failed to refund payment ${paymentId}:`, error.message);
      throw error;
    }
  }

  /**
   * Validate payment amount against order total
   * @param {number} orderId - Order ID
   * @param {number} amount - Amount to validate
   * @returns {Object} - Validation result
   */
  async validatePaymentAmount(orderId, amount) {
    try {
      const order = await knex('orders').where({ id: orderId }).first();

      if (!order) {
        return {
          valid: false,
          error: 'Order not found'
        };
      }

      if (amount < order.total_amount) {
        return {
          valid: false,
          error: 'Insufficient amount',
          required: order.total_amount,
          paid: amount,
          shortfall: order.total_amount - amount
        };
      }

      return {
        valid: true,
        order_total: order.total_amount,
        paid: amount,
        change: amount - order.total_amount
      };
    } catch (error) {
      logger.error(`Payment validation failed:`, error.message);
      throw error;
    }
  }

  /**
   * Get payment statistics
   * @param {Object} filters - { date_from, date_to, payment_method, checkout_counter_id }
   * @returns {Object} - Payment statistics
   */
  async getPaymentStatistics(filters = {}) {
    try {
      let query = knex('payments').where('status', 'success');

      if (filters.date_from) {
        query = query.where('created_at', '>=', new Date(filters.date_from));
      }
      if (filters.date_to) {
        query = query.where('created_at', '<=', new Date(filters.date_to));
      }
      if (filters.payment_method) {
        query = query.where('payment_method', filters.payment_method);
      }
      if (filters.checkout_counter_id) {
        query = query.where('checkout_counter_id', filters.checkout_counter_id);
      }

      const total = await query.clone().count('id as count').first();
      const sumAmount = await query.clone().sum('amount_paid as total').first();

      // Get breakdown by payment method
      const byMethod = await query.clone()
        .groupBy('payment_method')
        .select('payment_method')
        .sum('amount_paid as total')
        .count('id as count');

      return {
        total_transactions: total.count,
        total_amount: sumAmount.total || 0,
        by_method: byMethod
      };
    } catch (error) {
      logger.error('Failed to get payment statistics:', error.message);
      throw error;
    }
  }

  /**
   * Update payment status
   * @param {number} paymentId - Payment ID
   * @param {string} status - New status (success, pending, failed, refunded)
   * @returns {Object} - Updated payment
   */
  async updatePaymentStatus(paymentId, status) {
    try {
      const validStatuses = ['success', 'pending', 'failed', 'refunded'];
      if (!validStatuses.includes(status)) {
        const error = new Error(`Invalid status. Allowed: ${validStatuses.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }

      const [updated] = await knex('payments')
        .where({ id: paymentId })
        .update({ status })
        .returning('*');

      if (!updated) {
        const error = new Error('Payment not found');
        error.statusCode = 404;
        throw error;
      }

      logger.info(`Payment ${paymentId} status updated to ${status}`);

      return updated;
    } catch (error) {
      logger.error(`Failed to update payment ${paymentId}:`, error.message);
      throw error;
    }
  }
}

export default new PaymentService();

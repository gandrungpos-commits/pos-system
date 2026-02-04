/**
 * Order Controller
 * Handles HTTP requests for order endpoints
 */

import { validationResult } from 'express-validator';
import OrderService from '../services/OrderService.js';
import logger from '../config/logger.js';

class OrderController {
  /**
   * POST /api/orders
   * Create new order
   */
  async createOrder(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: errors.array()
        });
      }

      const {
        tenant_id,
        customer_name,
        customer_phone,
        items,
        order_type = 'takeaway',
        table_number = null
      } = req.body;

      // Validate items array
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid items',
          message: 'Order must contain at least one item'
        });
      }

      const order = await OrderService.createOrder(
        tenant_id,
        customer_name,
        customer_phone,
        items,
        order_type,
        table_number
      );

      res.status(201).json({
        success: true,
        order
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      logger.error('Create order error:', error.message);

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/orders/:id
   * Get order details
   */
  async getOrder(req, res) {
    try {
      const { id } = req.params;

      const order = await OrderService.getOrder(id);

      res.status(200).json({
        success: true,
        order
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      logger.error(`Get order error:`, error.message);

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/orders
   * List orders with filters
   */
  async listOrders(req, res) {
    try {
      const {
        status,
        tenant_id,
        payment_status,
        order_type,
        date_from,
        date_to,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        status,
        tenant_id: tenant_id ? parseInt(tenant_id) : undefined,
        payment_status,
        order_type,
        date_from,
        date_to,
        limit: Math.min(parseInt(limit) || 20, 100),
        offset: parseInt(offset) || 0
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      const result = await OrderService.listOrders(filters);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('List orders error:', error.message);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * PATCH /api/orders/:id/status
   * Update order status
   */
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required'
        });
      }

      const order = await OrderService.updateOrderStatus(id, status);

      res.status(200).json({
        success: true,
        order
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      logger.error(`Update order status error:`, error.message);

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * DELETE /api/orders/:id
   * Cancel order
   */
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const result = await OrderService.cancelOrder(id, reason);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      logger.error(`Cancel order error:`, error.message);

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/tenants/:tenant_id/orders
   * Get orders for specific tenant
   */
  async getTenantOrders(req, res) {
    try {
      const { tenant_id } = req.params;
      const { status } = req.query;

      const orders = await OrderService.getOrdersByTenant(tenant_id, status);

      res.status(200).json({
        success: true,
        orders
      });
    } catch (error) {
      logger.error('Get tenant orders error:', error.message);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new OrderController();

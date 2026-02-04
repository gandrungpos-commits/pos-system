/**
 * Payment Controller
 * HTTP handlers for payment operations
 */

import { validationResult, body, param, query } from 'express-validator';
import PaymentService from '../services/PaymentService.js';
import logger from '../config/logger.js';

/**
 * POST /api/payments
 * Process payment for order
 */
export const processPayment = async (req, res) => {
  try {
    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { order_id, amount, payment_method, payment_details } = req.body;
    const kasirId = req.user.id;
    const checkoutCounterId = req.user.checkout_counter_id;

    // Process payment
    const payment = await PaymentService.processPayment(
      order_id,
      amount,
      payment_method,
      checkoutCounterId,
      kasirId,
      payment_details
    );

    return res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: payment
    });
  } catch (error) {
    logger.error('Payment processing error:', error);

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Payment processing failed'
    });
  }
};

/**
 * GET /api/payments/:id
 * Get payment by ID
 */
export const getPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const payment = await PaymentService.getPayment(id);

    return res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Get payment error:', error);

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to fetch payment'
    });
  }
};

/**
 * GET /api/payments/order/:order_id
 * Get all payments for order
 */
export const getPaymentsByOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { order_id } = req.params;
    const payments = await PaymentService.getPaymentsByOrder(order_id);

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    logger.error('Get payments by order error:', error);

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to fetch payments'
    });
  }
};

/**
 * POST /api/payments/:id/refund
 * Refund payment
 */
export const refundPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const refund = await PaymentService.refundPayment(id, reason);

    return res.status(201).json({
      success: true,
      message: 'Payment refunded successfully',
      data: refund
    });
  } catch (error) {
    logger.error('Refund payment error:', error);

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to refund payment'
    });
  }
};

/**
 * GET /api/payments/validate/:order_id
 * Validate payment amount
 */
export const validateAmount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { order_id } = req.params;
    const { amount } = req.query;

    const validation = await PaymentService.validatePaymentAmount(
      order_id,
      parseFloat(amount)
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        ...validation
      });
    }

    return res.status(200).json({
      success: true,
      ...validation
    });
  } catch (error) {
    logger.error('Payment validation error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Validation failed'
    });
  }
};

/**
 * GET /api/payments/statistics
 * Get payment statistics
 */
export const getStatistics = async (req, res) => {
  try {
    const { date_from, date_to, payment_method, checkout_counter_id } = req.query;

    const filters = {};
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;
    if (payment_method) filters.payment_method = payment_method;
    if (checkout_counter_id) filters.checkout_counter_id = parseInt(checkout_counter_id);

    const stats = await PaymentService.getPaymentStatistics(filters);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get statistics error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch statistics'
    });
  }
};

/**
 * PATCH /api/payments/:id/status
 * Update payment status
 */
export const updateStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const updated = await PaymentService.updatePaymentStatus(id, status);

    return res.status(200).json({
      success: true,
      message: 'Payment status updated',
      data: updated
    });
  } catch (error) {
    logger.error('Update status error:', error);

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to update status'
    });
  }
};

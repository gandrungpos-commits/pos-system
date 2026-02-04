/**
 * Payment Routes
 * Endpoints for payment management
 */

import express from 'express';
import { body, param, query } from 'express-validator';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  processPayment,
  getPayment,
  getPaymentsByOrder,
  refundPayment,
  validateAmount,
  getStatistics,
  updateStatus
} from '../controllers/paymentController.js';

const router = express.Router();

/**
 * POST /api/payments
 * Process payment (kasir, pengelola)
 */
router.post(
  '/',
  authMiddleware,
  body('order_id').isInt({ min: 1 }),
  body('amount').isFloat({ min: 0.01 }),
  body('payment_method').isIn(['cash', 'card', 'e_wallet', 'qris']),
  body('payment_details').optional().isObject(),
  processPayment
);

/**
 * GET /api/payments/:id
 * Get payment by ID
 */
router.get(
  '/:id',
  authMiddleware,
  param('id').isInt({ min: 1 }),
  getPayment
);

/**
 * GET /api/payments/order/:order_id
 * Get all payments for order
 */
router.get(
  '/order/:order_id',
  authMiddleware,
  param('order_id').isInt({ min: 1 }),
  getPaymentsByOrder
);

/**
 * POST /api/payments/:id/refund
 * Refund payment
 */
router.post(
  '/:id/refund',
  authMiddleware,
  param('id').isInt({ min: 1 }),
  body('reason').optional().isString(),
  refundPayment
);

/**
 * GET /api/payments/validate/:order_id
 * Validate payment amount
 */
router.get(
  '/validate/:order_id',
  authMiddleware,
  param('order_id').isInt({ min: 1 }),
  query('amount').isFloat({ min: 0.01 }),
  validateAmount
);

/**
 * GET /api/payments/statistics
 * Get payment statistics (pengelola)
 */
router.get(
  '/statistics',
  authMiddleware,
  query('date_from').optional().isISO8601(),
  query('date_to').optional().isISO8601(),
  query('payment_method').optional().isIn(['cash', 'card', 'e_wallet', 'qris']),
  getStatistics
);

/**
 * PATCH /api/payments/:id/status
 * Update payment status
 */
router.patch(
  '/:id/status',
  authMiddleware,
  param('id').isInt({ min: 1 }),
  body('status').isIn(['success', 'pending', 'failed', 'refunded']),
  updateStatus
);

export default router;

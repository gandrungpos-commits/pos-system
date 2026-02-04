/**
 * Reporting Routes
 * Endpoints for generating various reports
 */

import express from 'express';
import { query, param } from 'express-validator';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getTenantOrders,
  getTenantRevenue,
  getCheckoutTransactions,
  getRevenueShare,
  getAnalytics,
  getTopItems,
  getPeakHours,
  exportReport
} from '../controllers/reportController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/reports/tenant/:id/orders
 * Get tenant order analytics
 */
router.get(
  '/tenant/:id/orders',
  param('id').isInt().withMessage('Tenant ID must be an integer'),
  query('period').optional().isIn(['day', 'week', 'month']).withMessage('Period must be day, week, or month'),
  query('start_date').optional().isISO8601().withMessage('Start date must be valid date'),
  query('end_date').optional().isISO8601().withMessage('End date must be valid date'),
  getTenantOrders
);

/**
 * GET /api/reports/tenant/:id/revenue
 * Get tenant revenue report
 */
router.get(
  '/tenant/:id/revenue',
  param('id').isInt().withMessage('Tenant ID must be an integer'),
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Period must be day, week, month, or year'),
  query('start_date').optional().isISO8601().withMessage('Start date must be valid date'),
  query('end_date').optional().isISO8601().withMessage('End date must be valid date'),
  getTenantRevenue
);

/**
 * GET /api/reports/checkout/:id/transactions
 * Get checkout counter transaction report
 */
router.get(
  '/checkout/:id/transactions',
  param('id').isInt().withMessage('Checkout counter ID must be an integer'),
  query('period').optional().isIn(['day', 'week', 'month']).withMessage('Period must be day, week, or month'),
  query('start_date').optional().isISO8601().withMessage('Start date must be valid date'),
  query('end_date').optional().isISO8601().withMessage('End date must be valid date'),
  getCheckoutTransactions
);

/**
 * GET /api/reports/revenue-share
 * Get system-wide revenue share report
 */
router.get(
  '/revenue-share',
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Period must be day, week, month, or year'),
  query('start_date').optional().isISO8601().withMessage('Start date must be valid date'),
  query('end_date').optional().isISO8601().withMessage('End date must be valid date'),
  getRevenueShare
);

/**
 * GET /api/reports/analytics
 * Get system-wide analytics (dashboard metrics)
 */
router.get(
  '/analytics',
  query('period').optional().isIn(['day', 'week', 'month']).withMessage('Period must be day, week, or month'),
  getAnalytics
);

/**
 * GET /api/reports/top-items
 * Get top items by sales
 */
router.get(
  '/top-items',
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('period').optional().isIn(['day', 'week', 'month']).withMessage('Period must be day, week, or month'),
  getTopItems
);

/**
 * GET /api/reports/peak-hours
 * Get peak hours analysis
 */
router.get(
  '/peak-hours',
  query('period').optional().isIn(['day', 'week', 'month']).withMessage('Period must be day, week, or month'),
  getPeakHours
);

/**
 * GET /api/reports/export
 * Export report to CSV
 */
router.get(
  '/export',
  query('report_type').notEmpty().isIn(['tenant_orders', 'tenant_revenue', 'checkout_transactions', 'revenue_share', 'analytics']).withMessage('Invalid report type'),
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Period must be day, week, month, or year'),
  query('tenant_id').optional().isInt().withMessage('Tenant ID must be an integer'),
  exportReport
);

export default router;

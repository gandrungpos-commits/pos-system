/**
 * Revenue Routes
 * Endpoints for revenue management
 */

import express from 'express';
import { body, param, query } from 'express-validator';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getTenantRevenue,
  getSystemRevenue,
  getRevenueByMethod,
  initiateSettlement,
  processSettlement,
  getSettlementHistory,
  getRevenueStatistics,
  getMonthlyComparison,
  getTopTenants,
  calculateSplit
} from '../controllers/revenueController.js';

const router = express.Router();

/**
 * GET /api/revenue/calculate-split
 * Calculate revenue split for amount
 */
router.post(
  '/calculate-split',
  authMiddleware,
  body('amount').isFloat({ min: 0.01 }),
  calculateSplit
);

/**
 * GET /api/revenue/tenant/:tenant_id/revenue
 * Get tenant revenue for period
 */
router.get(
  '/tenant/:tenant_id/revenue',
  authMiddleware,
  param('tenant_id').isInt({ min: 1 }),
  query('month').optional().matches(/^\d{4}-\d{2}$/),
  query('year').optional().isInt({ min: 2020 }),
  getTenantRevenue
);

/**
 * GET /api/revenue/system/revenue
 * Get system revenue for period (pengelola only)
 */
router.get(
  '/system/revenue',
  authMiddleware,
  query('month').optional().matches(/^\d{4}-\d{2}$/),
  query('year').optional().isInt({ min: 2020 }),
  getSystemRevenue
);

/**
 * GET /api/revenue/by-method
 * Get revenue breakdown by payment method
 */
router.get(
  '/by-method',
  authMiddleware,
  query('month').optional().matches(/^\d{4}-\d{2}$/),
  getRevenueByMethod
);

/**
 * POST /api/revenue/settlement/initiate
 * Initiate settlement for tenant (pengelola only)
 */
router.post(
  '/settlement/initiate',
  authMiddleware,
  body('tenant_id').isInt({ min: 1 }),
  body('month').matches(/^\d{4}-\d{2}$/),
  body('bank_account').isString(),
  initiateSettlement
);

/**
 * PATCH /api/revenue/settlement/:settlement_id/process
 * Process settlement payment (pengelola only)
 */
router.patch(
  '/settlement/:settlement_id/process',
  authMiddleware,
  param('settlement_id').isInt({ min: 1 }),
  body('transfer_id').isString(),
  processSettlement
);

/**
 * GET /api/revenue/tenant/:tenant_id/settlement-history
 * Get settlement history for tenant
 */
router.get(
  '/tenant/:tenant_id/settlement-history',
  authMiddleware,
  param('tenant_id').isInt({ min: 1 }),
  query('year').optional().isInt({ min: 2020 }),
  query('status').optional().isIn(['pending', 'completed', 'failed']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  getSettlementHistory
);

/**
 * GET /api/revenue/statistics
 * Get revenue statistics dashboard (pengelola only)
 */
router.get(
  '/statistics',
  authMiddleware,
  query('month').optional().matches(/^\d{4}-\d{2}$/),
  getRevenueStatistics
);

/**
 * GET /api/revenue/comparison
 * Get monthly revenue comparison (pengelola only)
 */
router.get(
  '/comparison',
  authMiddleware,
  query('months').optional().isInt({ min: 1, max: 24 }),
  getMonthlyComparison
);

/**
 * GET /api/revenue/top-tenants
 * Get top tenants by revenue (pengelola only)
 */
router.get(
  '/top-tenants',
  authMiddleware,
  query('month').optional().matches(/^\d{4}-\d{2}$/),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  getTopTenants
);

export default router;

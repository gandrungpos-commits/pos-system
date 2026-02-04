/**
 * Revenue Share Controller
 * HTTP handlers for revenue operations
 */

import { validationResult, body, param, query } from 'express-validator';
import RevenueShareService from '../services/RevenueShareService.js';
import logger from '../config/logger.js';

/**
 * GET /api/revenue/tenant/:tenant_id/revenue
 * Get tenant revenue for period
 */
export const getTenantRevenue = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tenant_id } = req.params;
    const { month, year } = req.query;

    const revenue = await RevenueShareService.getTenantRevenue(
      tenant_id,
      month || null,
      year ? parseInt(year) : null
    );

    return res.status(200).json({
      success: true,
      data: revenue
    });
  } catch (error) {
    logger.error('Get tenant revenue error:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to fetch tenant revenue'
    });
  }
};

/**
 * GET /api/revenue/system/revenue
 * Get system revenue for period (pengelola only)
 */
export const getSystemRevenue = async (req, res) => {
  try {
    const { month, year } = req.query;

    const revenue = await RevenueShareService.getSystemRevenue(
      month || null,
      year ? parseInt(year) : null
    );

    return res.status(200).json({
      success: true,
      data: revenue
    });
  } catch (error) {
    logger.error('Get system revenue error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch system revenue'
    });
  }
};

/**
 * GET /api/revenue/by-method
 * Get revenue breakdown by payment method
 */
export const getRevenueByMethod = async (req, res) => {
  try {
    const { month } = req.query;

    const data = await RevenueShareService.getRevenueByMethod(month || null);

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    logger.error('Get revenue by method error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch revenue by method'
    });
  }
};

/**
 * POST /api/revenue/settlement/initiate
 * Initiate settlement for tenant (pengelola only)
 */
export const initiateSettlement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tenant_id, month, bank_account } = req.body;

    const settlement = await RevenueShareService.initiateSettlement(
      tenant_id,
      month,
      bank_account
    );

    return res.status(201).json({
      success: true,
      message: 'Settlement initiated successfully',
      data: settlement
    });
  } catch (error) {
    logger.error('Initiate settlement error:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to initiate settlement'
    });
  }
};

/**
 * PATCH /api/revenue/settlement/:settlement_id/process
 * Process settlement payment (pengelola only)
 */
export const processSettlement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { settlement_id } = req.params;
    const { transfer_id } = req.body;

    const settlement = await RevenueShareService.processSettlement(
      settlement_id,
      transfer_id
    );

    return res.status(200).json({
      success: true,
      message: 'Settlement processed successfully',
      data: settlement
    });
  } catch (error) {
    logger.error('Process settlement error:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to process settlement'
    });
  }
};

/**
 * GET /api/revenue/tenant/:tenant_id/settlement-history
 * Get settlement history for tenant
 */
export const getSettlementHistory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tenant_id } = req.params;
    const { year, status, limit = 50, offset = 0 } = req.query;

    const history = await RevenueShareService.getSettlementHistory(
      tenant_id,
      {
        year: year ? parseInt(year) : null,
        status: status || null,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    );

    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    logger.error('Get settlement history error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch settlement history'
    });
  }
};

/**
 * GET /api/revenue/statistics
 * Get revenue statistics dashboard (pengelola only)
 */
export const getRevenueStatistics = async (req, res) => {
  try {
    const { month } = req.query;

    const stats = await RevenueShareService.getRevenueStatistics(month || null);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get revenue statistics error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch revenue statistics'
    });
  }
};

/**
 * GET /api/revenue/comparison
 * Get monthly revenue comparison (pengelola only)
 */
export const getMonthlyComparison = async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const comparison = await RevenueShareService.getMonthlyComparison(
      parseInt(months)
    );

    return res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    logger.error('Get monthly comparison error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch monthly comparison'
    });
  }
};

/**
 * GET /api/revenue/top-tenants
 * Get top tenants by revenue (pengelola only)
 */
export const getTopTenants = async (req, res) => {
  try {
    const { month, limit = 10 } = req.query;

    const topTenants = await RevenueShareService.getTopTenantsByRevenue(
      month || null,
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      data: topTenants
    });
  } catch (error) {
    logger.error('Get top tenants error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch top tenants'
    });
  }
};

/**
 * POST /api/revenue/calculate-split
 * Calculate revenue split for amount
 */
export const calculateSplit = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount } = req.body;

    const split = RevenueShareService.calculateRevenueSplit(amount);

    return res.status(200).json({
      success: true,
      data: split
    });
  } catch (error) {
    logger.error('Calculate split error:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to calculate split'
    });
  }
};

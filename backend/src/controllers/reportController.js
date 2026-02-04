/**
 * Reporting Controller
 * Handles report requests and responses
 */

import { validationResult } from 'express-validator';
import ReportingService from '../services/ReportingService.js';

export const getTenantOrders = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { id } = req.params;
    const { period = 'month', start_date, end_date } = req.query;

    const report = await ReportingService.getTenantOrders(
      parseInt(id),
      period,
      start_date,
      end_date
    );

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in getTenantOrders:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error.message
      }
    });
  }
};

export const getTenantRevenue = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { id } = req.params;
    const { period = 'month', start_date, end_date } = req.query;

    const report = await ReportingService.getTenantRevenue(
      parseInt(id),
      period,
      start_date,
      end_date
    );

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in getTenantRevenue:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error.message
      }
    });
  }
};

export const getCheckoutTransactions = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { id } = req.params;
    const { period = 'month', start_date, end_date } = req.query;

    const report = await ReportingService.getCheckoutTransactions(
      parseInt(id),
      period,
      start_date,
      end_date
    );

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in getCheckoutTransactions:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error.message
      }
    });
  }
};

export const getRevenueShare = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { period = 'month', start_date, end_date } = req.query;

    const report = await ReportingService.getRevenueShare(
      period,
      start_date,
      end_date
    );

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in getRevenueShare:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error.message
      }
    });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { period = 'month' } = req.query;

    const report = await ReportingService.getAnalytics(period);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error.message
      }
    });
  }
};

export const getTopItems = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { limit = 10, period = 'month' } = req.query;

    const items = await ReportingService.getTopItems(
      parseInt(limit),
      period
    );

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Error in getTopItems:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error.message
      }
    });
  }
};

export const getPeakHours = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { period = 'month' } = req.query;

    const hours = await ReportingService.getPeakHours(period);

    res.json({
      success: true,
      data: hours
    });
  } catch (error) {
    console.error('Error in getPeakHours:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error.message
      }
    });
  }
};

export const exportReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { report_type, tenant_id, period = 'month' } = req.query;

    let reportData;

    if (report_type === 'tenant_orders' && tenant_id) {
      reportData = await ReportingService.getTenantOrders(parseInt(tenant_id), period);
    } else if (report_type === 'tenant_revenue' && tenant_id) {
      reportData = await ReportingService.getTenantRevenue(parseInt(tenant_id), period);
    } else if (report_type === 'revenue_share') {
      reportData = await ReportingService.getRevenueShare(period);
    } else if (report_type === 'analytics') {
      reportData = await ReportingService.getAnalytics(period);
    } else {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REPORT_TYPE', message: 'Invalid report type' }
      });
    }

    const csv = ReportingService.generateCSV(reportData, report_type.split('_')[0]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="report_${report_type}_${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error in exportReport:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPORT_ERROR',
        message: error.message
      }
    });
  }
};

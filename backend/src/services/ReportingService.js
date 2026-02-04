/**
 * Reporting Service
 * Generates reports for orders, revenue, transactions, and analytics
 */

import knex from '../config/database.js';

class ReportingService {
  /**
   * Get tenant order analytics (daily, weekly, monthly)
   * @param {number} tenantId - Tenant ID
   * @param {string} period - 'day', 'week', 'month'
   * @param {string} startDate - Optional start date (YYYY-MM-DD)
   * @param {string} endDate - Optional end date (YYYY-MM-DD)
   * @returns {object} Order analytics with totals and breakdown
   */
  async getTenantOrders(tenantId, period = 'month', startDate = null, endDate = null) {
    try {
      const query = knex('orders')
        .where('tenant_id', tenantId);

      // Apply date filters
      if (startDate && endDate) {
        query.whereBetween('created_at', [startDate, endDate]);
      } else if (period === 'day') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        query.whereBetween('created_at', [today, tomorrow]);
      } else if (period === 'week') {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query.whereBetween('created_at', [weekAgo, now]);
      } else {
        const now = new Date();
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
        query.whereBetween('created_at', [monthAgo, now]);
      }

      const orders = await query;

      // Calculate metrics
      const totalOrders = orders.length;
      const totalAmount = orders.reduce((sum, o) => sum + o.total_amount, 0);
      const completedOrders = orders.filter(o => o.order_status === 'completed').length;
      const cancelledOrders = orders.filter(o => o.order_status === 'cancelled').length;
      const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

      // Breakdown by status
      const byStatus = {};
      orders.forEach(o => {
        byStatus[o.order_status] = (byStatus[o.order_status] || 0) + 1;
      });

      // Breakdown by payment status
      const byPaymentStatus = {};
      orders.forEach(o => {
        byPaymentStatus[o.payment_status] = (byPaymentStatus[o.payment_status] || 0) + 1;
      });

      return {
        period,
        start_date: startDate,
        end_date: endDate,
        total_orders: totalOrders,
        completed_orders: completedOrders,
        cancelled_orders: cancelledOrders,
        total_amount: totalAmount,
        average_order_value: averageOrderValue,
        by_status: byStatus,
        by_payment_status: byPaymentStatus
      };
    } catch (error) {
      console.error('Error in getTenantOrders:', error);
      throw new Error(`Failed to get tenant orders: ${error.message}`);
    }
  }

  /**
   * Get tenant revenue report (with payment breakdown)
   * @param {number} tenantId - Tenant ID
   * @param {string} period - 'day', 'week', 'month', 'year'
   * @param {string} startDate - Optional start date
   * @param {string} endDate - Optional end date
   * @returns {object} Revenue report with breakdown by method
   */
  async getTenantRevenue(tenantId, period = 'month', startDate = null, endDate = null) {
    try {
      const query = knex('payments as p')
        .join('orders as o', 'p.order_id', 'o.id')
        .where('o.tenant_id', tenantId)
        .where('p.status', 'success')
        .select(
          'p.id',
          'p.amount_paid',
          'p.payment_method',
          'p.created_at'
        );

      // Apply date filters
      if (startDate && endDate) {
        query.whereBetween('p.created_at', [startDate, endDate]);
      } else if (period === 'day') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        query.whereBetween('p.created_at', [today, tomorrow]);
      } else if (period === 'week') {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query.whereBetween('p.created_at', [weekAgo, now]);
      } else {
        const now = new Date();
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
        query.whereBetween('p.created_at', [monthAgo, now]);
      }

      const payments = await query;

      // Calculate metrics
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount_paid, 0);
      const transactionCount = payments.length;
      const averageTransaction = transactionCount > 0 ? totalRevenue / transactionCount : 0;

      // Revenue split (97% tenant, 2% pengelola, 1% system)
      const tenantShare = totalRevenue * 0.97;
      const pengelolaShare = totalRevenue * 0.02;
      const systemShare = totalRevenue * 0.01;

      // Breakdown by payment method
      const byMethod = {};
      payments.forEach(p => {
        if (!byMethod[p.payment_method]) {
          byMethod[p.payment_method] = {
            payment_method: p.payment_method,
            total_amount: 0,
            transaction_count: 0,
            tenant_share: 0
          };
        }
        byMethod[p.payment_method].total_amount += p.amount_paid;
        byMethod[p.payment_method].transaction_count += 1;
        byMethod[p.payment_method].tenant_share += p.amount_paid * 0.97;
      });

      return {
        period,
        start_date: startDate,
        end_date: endDate,
        total_revenue: totalRevenue,
        transaction_count: transactionCount,
        average_transaction: averageTransaction,
        tenant_share: tenantShare,
        pengelola_share: pengelolaShare,
        system_share: systemShare,
        by_payment_method: Object.values(byMethod)
      };
    } catch (error) {
      console.error('Error in getTenantRevenue:', error);
      throw new Error(`Failed to get tenant revenue: ${error.message}`);
    }
  }

  /**
   * Get checkout counter transaction report
   * @param {number} counterId - Checkout counter ID
   * @param {string} period - 'day', 'week', 'month'
   * @param {string} startDate - Optional start date
   * @param {string} endDate - Optional end date
   * @returns {object} Checkout transactions with metrics
   */
  async getCheckoutTransactions(counterId, period = 'month', startDate = null, endDate = null) {
    try {
      const query = knex('payments as p')
        .where('p.checkout_counter_id', counterId)
        .select('p.*');

      // Apply date filters
      if (startDate && endDate) {
        query.whereBetween('p.created_at', [startDate, endDate]);
      } else if (period === 'day') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        query.whereBetween('p.created_at', [today, tomorrow]);
      } else if (period === 'week') {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query.whereBetween('p.created_at', [weekAgo, now]);
      } else {
        const now = new Date();
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
        query.whereBetween('p.created_at', [monthAgo, now]);
      }

      const transactions = await query;

      // Calculate metrics by status
      const totalTransactions = transactions.length;
      const successTransactions = transactions.filter(t => t.status === 'success').length;
      const failedTransactions = transactions.filter(t => t.status === 'failed').length;
      const refundedTransactions = transactions.filter(t => t.status === 'refunded').length;

      const totalAmount = transactions
        .filter(t => t.status === 'success')
        .reduce((sum, t) => sum + t.amount_paid, 0);

      // Breakdown by payment method
      const byMethod = {};
      transactions.forEach(t => {
        if (!byMethod[t.payment_method]) {
          byMethod[t.payment_method] = {
            payment_method: t.payment_method,
            total_amount: 0,
            success_count: 0,
            failed_count: 0
          };
        }
        if (t.status === 'success') {
          byMethod[t.payment_method].total_amount += t.amount_paid;
          byMethod[t.payment_method].success_count += 1;
        } else if (t.status === 'failed') {
          byMethod[t.payment_method].failed_count += 1;
        }
      });

      return {
        checkout_counter_id: counterId,
        period,
        start_date: startDate,
        end_date: endDate,
        total_transactions: totalTransactions,
        success_transactions: successTransactions,
        failed_transactions: failedTransactions,
        refunded_transactions: refundedTransactions,
        total_amount: totalAmount,
        success_rate: totalTransactions > 0 ? (successTransactions / totalTransactions) * 100 : 0,
        by_payment_method: Object.values(byMethod)
      };
    } catch (error) {
      console.error('Error in getCheckoutTransactions:', error);
      throw new Error(`Failed to get checkout transactions: ${error.message}`);
    }
  }

  /**
   * Get system-wide revenue share report
   * @param {string} period - 'day', 'week', 'month', 'year'
   * @param {string} startDate - Optional start date
   * @param {string} endDate - Optional end date
   * @returns {object} Revenue distribution across system
   */
  async getRevenueShare(period = 'month', startDate = null, endDate = null) {
    try {
      const query = knex('payments')
        .where('status', 'success')
        .select('amount_paid', 'created_at');

      // Apply date filters
      if (startDate && endDate) {
        query.whereBetween('created_at', [startDate, endDate]);
      } else if (period === 'day') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        query.whereBetween('created_at', [today, tomorrow]);
      } else if (period === 'week') {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query.whereBetween('created_at', [weekAgo, now]);
      } else {
        const now = new Date();
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
        query.whereBetween('created_at', [monthAgo, now]);
      }

      const payments = await query;

      const totalRevenue = payments.reduce((sum, p) => sum + p.amount_paid, 0);
      const tenantShare = totalRevenue * 0.97;
      const pengelolaShare = totalRevenue * 0.02;
      const systemShare = totalRevenue * 0.01;

      // Get tenant breakdown
      const tenantBreakdown = await knex('payments as p')
        .join('orders as o', 'p.order_id', 'o.id')
        .join('tenants as t', 'o.tenant_id', 't.id')
        .where('p.status', 'success')
        .select(
          't.id',
          't.name as tenant_name',
          knex.raw('SUM(p.amount_paid) as total_sales'),
          knex.raw('COUNT(p.id) as transaction_count')
        )
        .groupBy('t.id', 't.name');

      return {
        period,
        start_date: startDate,
        end_date: endDate,
        total_revenue: totalRevenue,
        tenant_total: tenantShare,
        pengelola_total: pengelolaShare,
        system_total: systemShare,
        transaction_count: payments.length,
        by_tenant: tenantBreakdown
      };
    } catch (error) {
      console.error('Error in getRevenueShare:', error);
      throw new Error(`Failed to get revenue share: ${error.message}`);
    }
  }

  /**
   * Get system-wide analytics (dashboard metrics)
   * @param {string} period - 'day', 'week', 'month'
   * @returns {object} Comprehensive system analytics
   */
  async getAnalytics(period = 'month') {
    try {
      // Date range calculation
      let startDate, endDate;
      const now = new Date();

      if (period === 'day') {
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
      } else if (period === 'week') {
        endDate = new Date(now);
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
      }

      // Total orders
      const totalOrders = await knex('orders')
        .whereBetween('created_at', [startDate, endDate])
        .count('id as count')
        .first();

      // Completed orders
      const completedOrders = await knex('orders')
        .where('order_status', 'completed')
        .whereBetween('created_at', [startDate, endDate])
        .count('id as count')
        .first();

      // Total revenue
      const totalRevenue = await knex('payments')
        .where('status', 'success')
        .whereBetween('created_at', [startDate, endDate])
        .sum('amount_paid as total')
        .first();

      // Total tenants with orders
      const activeTenants = await knex('orders')
        .distinct('tenant_id')
        .whereBetween('created_at', [startDate, endDate])
        .count('id as count');

      // Average order value
      const avgOrderValue = totalOrders.count > 0 
        ? (totalRevenue.total || 0) / totalOrders.count 
        : 0;

      // Peak hour (hour with most orders)
      const peakHour = await knex('orders')
        .whereBetween('created_at', [startDate, endDate])
        .select(knex.raw('EXTRACT(HOUR FROM created_at) as hour'))
        .count('id as order_count')
        .groupBy(knex.raw('EXTRACT(HOUR FROM created_at)'))
        .orderBy('order_count', 'desc')
        .first();

      // Top payment method
      const topMethod = await knex('payments')
        .where('status', 'success')
        .whereBetween('created_at', [startDate, endDate])
        .select('payment_method')
        .count('id as count')
        .groupBy('payment_method')
        .orderBy('count', 'desc')
        .first();

      // Payment success rate
      const totalPayments = await knex('payments')
        .whereBetween('created_at', [startDate, endDate])
        .count('id as count')
        .first();

      const successPayments = await knex('payments')
        .where('status', 'success')
        .whereBetween('created_at', [startDate, endDate])
        .count('id as count')
        .first();

      const successRate = totalPayments.count > 0 
        ? (successPayments.count / totalPayments.count) * 100 
        : 0;

      return {
        period,
        date_range: { start: startDate, end: endDate },
        summary: {
          total_orders: totalOrders.count || 0,
          completed_orders: completedOrders.count || 0,
          completion_rate: totalOrders.count > 0 
            ? ((completedOrders.count || 0) / totalOrders.count) * 100 
            : 0,
          total_revenue: totalRevenue.total || 0,
          average_order_value: avgOrderValue,
          active_tenants: activeTenants.length || 0
        },
        payment_metrics: {
          total_transactions: totalPayments.count || 0,
          successful_transactions: successPayments.count || 0,
          success_rate: successRate,
          top_method: topMethod?.payment_method || null
        },
        operational: {
          peak_hour: peakHour?.hour || null,
          peak_hour_orders: peakHour?.order_count || 0
        }
      };
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }

  /**
   * Get top items by sales
   * @param {number} limit - Number of top items to return
   * @param {string} period - 'day', 'week', 'month'
   * @returns {array} Top items with sales data
   */
  async getTopItems(limit = 10, period = 'month') {
    try {
      let startDate, endDate;
      const now = new Date();

      if (period === 'day') {
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
      } else if (period === 'week') {
        endDate = new Date(now);
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
      }

      const topItems = await knex('order_items as oi')
        .join('orders as o', 'oi.order_id', 'o.id')
        .whereBetween('o.created_at', [startDate, endDate])
        .select(
          'oi.item_name',
          knex.raw('SUM(oi.quantity) as total_quantity'),
          knex.raw('SUM(oi.subtotal) as total_sales'),
          knex.raw('COUNT(DISTINCT oi.order_id) as order_count')
        )
        .groupBy('oi.item_name')
        .orderBy('total_sales', 'desc')
        .limit(limit);

      return topItems;
    } catch (error) {
      console.error('Error in getTopItems:', error);
      throw new Error(`Failed to get top items: ${error.message}`);
    }
  }

  /**
   * Get peak hours analysis
   * @param {string} period - 'day', 'week', 'month'
   * @returns {array} Hours ranked by order volume
   */
  async getPeakHours(period = 'month') {
    try {
      let startDate, endDate;
      const now = new Date();

      if (period === 'day') {
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
      } else if (period === 'week') {
        endDate = new Date(now);
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
      }

      const peakHours = await knex('orders')
        .whereBetween('created_at', [startDate, endDate])
        .select(knex.raw('EXTRACT(HOUR FROM created_at) as hour'))
        .count('id as order_count')
        .sum('total_amount as revenue')
        .groupBy(knex.raw('EXTRACT(HOUR FROM created_at)'))
        .orderBy('order_count', 'desc');

      return peakHours.map((hour, index) => ({
        rank: index + 1,
        hour: `${String(hour.hour).padStart(2, '0')}:00`,
        order_count: hour.order_count,
        revenue: hour.revenue || 0
      }));
    } catch (error) {
      console.error('Error in getPeakHours:', error);
      throw new Error(`Failed to get peak hours: ${error.message}`);
    }
  }

  /**
   * Export report to CSV format
   * @param {object} reportData - Report data to export
   * @param {string} reportType - Type of report
   * @returns {string} CSV formatted data
   */
  generateCSV(reportData, reportType) {
    try {
      let csv = '';

      if (reportType === 'orders') {
        csv = 'Metric,Value\n';
        csv += `Total Orders,${reportData.total_orders}\n`;
        csv += `Completed Orders,${reportData.completed_orders}\n`;
        csv += `Cancelled Orders,${reportData.cancelled_orders}\n`;
        csv += `Total Amount,${reportData.total_amount}\n`;
        csv += `Average Order Value,${reportData.average_order_value}\n`;
      } else if (reportType === 'revenue') {
        csv = 'Metric,Value\n';
        csv += `Total Revenue,${reportData.total_revenue}\n`;
        csv += `Transaction Count,${reportData.transaction_count}\n`;
        csv += `Tenant Share (97%),${reportData.tenant_share}\n`;
        csv += `Pengelola Share (2%),${reportData.pengelola_share}\n`;
        csv += `System Share (1%),${reportData.system_share}\n`;
      } else if (reportType === 'analytics') {
        csv = 'Metric,Value\n';
        csv += `Total Orders,${reportData.summary.total_orders}\n`;
        csv += `Completed Orders,${reportData.summary.completed_orders}\n`;
        csv += `Total Revenue,${reportData.summary.total_revenue}\n`;
        csv += `Payment Success Rate,${reportData.payment_metrics.success_rate}%\n`;
      }

      return csv;
    } catch (error) {
      console.error('Error in generateCSV:', error);
      throw new Error(`Failed to generate CSV: ${error.message}`);
    }
  }
}

export default new ReportingService();

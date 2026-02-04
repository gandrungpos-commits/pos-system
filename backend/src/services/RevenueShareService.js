/**
 * Revenue Share Service
 * Handles revenue calculation, settlement, and payout processing
 */

import knex from '../config/database.js';
import logger from '../config/logger.js';

// Revenue split percentages
const REVENUE_SPLIT = {
  tenant: 0.97,      // 97%
  pengelola: 0.02,   // 2%
  system: 0.01       // 1%
};

class RevenueShareService {
  /**
   * Calculate revenue split for a payment amount
   * @param {number} totalAmount - Total payment amount
   * @returns {Object} - Split breakdown
   */
  calculateRevenueSplit(totalAmount) {
    if (totalAmount <= 0) {
      const error = new Error('Total amount must be greater than 0');
      error.statusCode = 400;
      throw error;
    }

    const tenantShare = Math.round(totalAmount * REVENUE_SPLIT.tenant);
    const pengelolaShare = Math.round(totalAmount * REVENUE_SPLIT.pengelola);
    const systemShare = Math.round(totalAmount * REVENUE_SPLIT.system);

    return {
      totalAmount,
      tenant: {
        percentage: REVENUE_SPLIT.tenant * 100,
        amount: tenantShare
      },
      pengelola: {
        percentage: REVENUE_SPLIT.pengelola * 100,
        amount: pengelolaShare
      },
      system: {
        percentage: REVENUE_SPLIT.system * 100,
        amount: systemShare
      }
    };
  }

  /**
   * Get tenant revenue for period
   * @param {number} tenantId - Tenant ID
   * @param {string} month - Month in YYYY-MM format (e.g., '2025-02')
   * @param {number} year - Year (optional, alternative to month)
   * @returns {Object} - Tenant revenue details
   */
  async getTenantRevenue(tenantId, month = null, year = null) {
    try {
      let query = knex('payments')
        .join('orders', 'payments.order_id', 'orders.id')
        .where({
          'orders.tenant_id': tenantId,
          'payments.status': 'success'
        })
        .select(
          knex.raw('SUM(payments.amount_paid) as total_amount'),
          knex.raw('COUNT(DISTINCT payments.id) as transaction_count'),
          knex.raw('COUNT(DISTINCT orders.id) as order_count')
        );

      // Filter by month if provided
      if (month) {
        const [y, m] = month.split('-');
        query = query
          .where(
            knex.raw(
              `DATE_TRUNC('month', payments.created_at) = DATE '${y}-${m}-01'`
            )
          );
      } else if (year) {
        query = query
          .where(knex.raw(`EXTRACT(YEAR FROM payments.created_at) = ${year}`));
      }

      const result = await query.first();
      const totalAmount = result.total_amount || 0;

      const split = this.calculateRevenueSplit(totalAmount);

      return {
        tenant_id: tenantId,
        period: month || year || 'all-time',
        total_sales: totalAmount,
        transaction_count: result.transaction_count || 0,
        order_count: result.order_count || 0,
        tenant_share: split.tenant.amount,
        pengelola_share: split.pengelola.amount,
        system_share: split.system.amount
      };
    } catch (error) {
      logger.error(`Failed to get tenant revenue ${tenantId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get system revenue for period
   * @param {string} month - Month in YYYY-MM format
   * @param {number} year - Year (optional)
   * @returns {Object} - System revenue details
   */
  async getSystemRevenue(month = null, year = null) {
    try {
      let query = knex('payments')
        .where({ status: 'success' })
        .select(
          knex.raw('SUM(payments.amount_paid) as total_amount'),
          knex.raw('COUNT(DISTINCT payments.id) as transaction_count'),
          knex.raw('COUNT(DISTINCT payments.order_id) as order_count')
        );

      if (month) {
        const [y, m] = month.split('-');
        query = query
          .where(
            knex.raw(
              `DATE_TRUNC('month', payments.created_at) = DATE '${y}-${m}-01'`
            )
          );
      } else if (year) {
        query = query
          .where(knex.raw(`EXTRACT(YEAR FROM payments.created_at) = ${year}`));
      }

      const result = await query.first();
      const totalAmount = result.total_amount || 0;

      const split = this.calculateRevenueSplit(totalAmount);

      return {
        period: month || year || 'all-time',
        total_sales: totalAmount,
        transaction_count: result.transaction_count || 0,
        order_count: result.order_count || 0,
        system_revenue: split.system.amount,
        all_tenants_share: split.tenant.amount + split.pengelola.amount
      };
    } catch (error) {
      logger.error(`Failed to get system revenue:`, error.message);
      throw error;
    }
  }

  /**
   * Get revenue by payment method
   * @param {string} month - Month in YYYY-MM format
   * @returns {Array} - Revenue breakdown by method
   */
  async getRevenueByMethod(month = null) {
    try {
      let query = knex('payments')
        .where({ status: 'success' })
        .groupBy('payment_method')
        .select(
          'payment_method',
          knex.raw('SUM(amount_paid) as total_amount'),
          knex.raw('COUNT(*) as transaction_count')
        );

      if (month) {
        const [y, m] = month.split('-');
        query = query
          .where(
            knex.raw(
              `DATE_TRUNC('month', payments.created_at) = DATE '${y}-${m}-01'`
            )
          );
      }

      const results = await query;

      return results.map(row => {
        const split = this.calculateRevenueSplit(row.total_amount);
        return {
          payment_method: row.payment_method,
          total_amount: row.total_amount,
          transaction_count: row.transaction_count,
          tenant_share: split.tenant.amount,
          pengelola_share: split.pengelola.amount,
          system_share: split.system.amount
        };
      });
    } catch (error) {
      logger.error(`Failed to get revenue by method:`, error.message);
      throw error;
    }
  }

  /**
   * Create settlement for tenant
   * @param {number} tenantId - Tenant ID
   * @param {string} month - Month in YYYY-MM format
   * @param {string} bankAccount - Tenant bank account
   * @returns {Object} - Settlement record
   */
  async initiateSettlement(tenantId, month, bankAccount) {
    const trx = await knex.transaction();

    try {
      // Get tenant revenue
      const revenue = await this.getTenantRevenue(tenantId, month);

      if (revenue.tenant_share <= 0) {
        const error = new Error('No revenue to settle for this period');
        error.statusCode = 400;
        throw error;
      }

      // Create settlement record
      const [settlement] = await trx('settlements').insert({
        tenant_id: tenantId,
        period_month: month,
        total_sales: revenue.total_sales,
        tenant_share: revenue.tenant_share,
        pengelola_share: revenue.pengelola_share,
        system_share: revenue.system_share,
        bank_account: bankAccount,
        status: 'pending',
        created_at: new Date()
      }).returning('*');

      await trx.commit();

      logger.info(`Settlement initiated: Tenant ${tenantId}, Month ${month}`);

      return {
        id: settlement.id,
        tenant_id: settlement.tenant_id,
        period_month: settlement.period_month,
        tenant_share: settlement.tenant_share,
        status: settlement.status,
        created_at: settlement.created_at
      };
    } catch (error) {
      await trx.rollback();
      logger.error(`Failed to initiate settlement:`, error.message);
      throw error;
    }
  }

  /**
   * Process settlement payment
   * @param {number} settlementId - Settlement ID
   * @param {string} transferId - Bank transfer ID
   * @returns {Object} - Updated settlement
   */
  async processSettlement(settlementId, transferId) {
    const trx = await knex.transaction();

    try {
      const settlement = await trx('settlements')
        .where({ id: settlementId })
        .first();

      if (!settlement) {
        const error = new Error('Settlement not found');
        error.statusCode = 404;
        throw error;
      }

      if (settlement.status !== 'pending') {
        const error = new Error(`Cannot process settlement with status: ${settlement.status}`);
        error.statusCode = 400;
        throw error;
      }

      // Update settlement status
      const [updated] = await trx('settlements')
        .where({ id: settlementId })
        .update({
          status: 'completed',
          transfer_id: transferId,
          processed_at: new Date()
        })
        .returning('*');

      await trx.commit();

      logger.info(`Settlement processed: ${settlementId}, Transfer ${transferId}`);

      return {
        id: updated.id,
        tenant_id: updated.tenant_id,
        period_month: updated.period_month,
        tenant_share: updated.tenant_share,
        transfer_id: updated.transfer_id,
        status: updated.status,
        processed_at: updated.processed_at
      };
    } catch (error) {
      await trx.rollback();
      logger.error(`Failed to process settlement:`, error.message);
      throw error;
    }
  }

  /**
   * Get settlement history for tenant
   * @param {number} tenantId - Tenant ID
   * @param {Object} filters - Filter options {year, status, limit, offset}
   * @returns {Object} - Paginated settlement records
   */
  async getSettlementHistory(tenantId, filters = {}) {
    try {
      const {
        year = null,
        status = null,
        limit = 50,
        offset = 0
      } = filters;

      let query = knex('settlements').where({ tenant_id: tenantId });

      if (year) {
        query = query.where(
          knex.raw(`EXTRACT(YEAR FROM period_month::date) = ${year}`)
        );
      }

      if (status) {
        query = query.where({ status });
      }

      const total = await query.clone().count('id as count').first();
      const records = await query
        .orderBy('period_month', 'desc')
        .limit(limit)
        .offset(offset);

      return {
        total: total.count,
        limit,
        offset,
        data: records
      };
    } catch (error) {
      logger.error(`Failed to get settlement history:`, error.message);
      throw error;
    }
  }

  /**
   * Get revenue statistics dashboard
   * @param {string} month - Month in YYYY-MM format (optional)
   * @returns {Object} - Comprehensive revenue stats
   */
  async getRevenueStatistics(month = null) {
    try {
      // Get system revenue
      const systemRevenue = await this.getSystemRevenue(month);

      // Get revenue by method
      const byMethod = await this.getRevenueByMethod(month);

      // Get all tenant revenues
      const tenants = await knex('tenants').where({ status: 'active' });
      const tenantRevenues = await Promise.all(
        tenants.map(t => this.getTenantRevenue(t.id, month))
      );

      // Get pending settlements
      let settlementQuery = knex('settlements').where({ status: 'pending' });
      if (month) {
        settlementQuery = settlementQuery.where({ period_month: month });
      }
      const pendingSettlements = await settlementQuery;

      return {
        period: month || 'current',
        system: systemRevenue,
        by_payment_method: byMethod,
        by_tenant: tenantRevenues,
        pending_settlements: pendingSettlements.length,
        settlement_details: pendingSettlements
      };
    } catch (error) {
      logger.error(`Failed to get revenue statistics:`, error.message);
      throw error;
    }
  }

  /**
   * Get monthly revenue comparison
   * @param {number} months - Number of months to compare
   * @returns {Array} - Monthly revenue data
   */
  async getMonthlyComparison(months = 6) {
    try {
      const monthlyData = [];

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toISOString().slice(0, 7); // YYYY-MM

        const revenue = await this.getSystemRevenue(monthStr);
        monthlyData.push(revenue);
      }

      return monthlyData;
    } catch (error) {
      logger.error(`Failed to get monthly comparison:`, error.message);
      throw error;
    }
  }

  /**
   * Get top tenants by revenue
   * @param {string} month - Month in YYYY-MM format
   * @param {number} limit - Number of top tenants
   * @returns {Array} - Top tenants
   */
  async getTopTenantsByRevenue(month = null, limit = 10) {
    try {
      let query = knex('payments')
        .join('orders', 'payments.order_id', 'orders.id')
        .join('tenants', 'orders.tenant_id', 'tenants.id')
        .where({ 'payments.status': 'success' })
        .groupBy('orders.tenant_id', 'tenants.name')
        .select(
          'orders.tenant_id',
          'tenants.name',
          knex.raw('SUM(payments.amount_paid) as total_revenue'),
          knex.raw('COUNT(DISTINCT payments.id) as transaction_count')
        )
        .orderBy('total_revenue', 'desc')
        .limit(limit);

      if (month) {
        const [y, m] = month.split('-');
        query = query
          .where(
            knex.raw(
              `DATE_TRUNC('month', payments.created_at) = DATE '${y}-${m}-01'`
            )
          );
      }

      const results = await query;

      return results.map((row, rank) => {
        const split = this.calculateRevenueSplit(row.total_revenue);
        return {
          rank: rank + 1,
          tenant_id: row.tenant_id,
          tenant_name: row.name,
          total_revenue: row.total_revenue,
          transaction_count: row.transaction_count,
          tenant_share: split.tenant.amount,
          pengelola_share: split.pengelola.amount,
          system_share: split.system.amount
        };
      });
    } catch (error) {
      logger.error(`Failed to get top tenants:`, error.message);
      throw error;
    }
  }

  /**
   * Get tenant earnings
   */
  async getTenantEarnings(tenantId, startDate, endDate) {
    // TODO: Implement
    throw new Error('Not implemented');
  }
}

  /**
   * Generate settlement report
   */
  async generateSettlementReport(period = 'daily') {
    // TODO: Implement
    throw new Error('Not implemented');
  }
}

export default new RevenueShareService();

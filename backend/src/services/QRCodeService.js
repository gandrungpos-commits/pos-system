/**
 * QR Code Service
 * Handles QR code generation, validation, storage
 */

import knex from '../config/database.js';
import logger from '../config/logger.js';
import crypto from 'crypto';

class QRCodeService {
  /**
   * Generate QR code for order
   * @param {number} orderId - Order ID
   * @param {Object} orderData - Order details
   * @returns {Object} - QR code data with token
   */
  async generateQRCode(orderId, orderData = null) {
    try {
      // Check if order exists
      const order = await knex('orders').where({ id: orderId }).first();
      if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
      }

      // Check if QR code already exists
      const existingQR = await knex('qr_codes').where({ order_id: orderId }).first();
      if (existingQR && existingQR.status === 'active') {
        return {
          id: existingQR.id,
          order_id: existingQR.order_id,
          qr_token: existingQR.qr_token,
          qr_data: JSON.parse(existingQR.qr_data),
          status: existingQR.status,
          created_at: existingQR.created_at,
          expires_at: existingQR.expires_at
        };
      }

      // Generate unique token
      const qrToken = this.generateToken();

      // Prepare QR data (encoded in token)
      const qrDataObj = orderData || {
        order_id: orderId,
        order_number: order.order_number,
        customer_name: order.customer_name,
        total_amount: order.total_amount,
        tenant_id: order.tenant_id
      };

      // Calculate expiry (24 hours from now by default)
      const expiryHours = parseInt(process.env.QR_EXPIRY_HOURS || '24');
      const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

      // Create QR code record
      const [qr] = await knex('qr_codes').insert({
        order_id: orderId,
        qr_token: qrToken,
        qr_data: JSON.stringify(qrDataObj),
        status: 'active',
        scan_count: 0,
        created_at: new Date(),
        expires_at: expiresAt
      }).returning('*');

      logger.info(`QR code generated for order ${orderId}: ${qrToken}`);

      return {
        id: qr.id,
        order_id: qr.order_id,
        qr_token: qr.qr_token,
        qr_data: qrDataObj,
        status: qr.status,
        created_at: qr.created_at,
        expires_at: qr.expires_at,
        qr_url: `${process.env.APP_URL || 'http://localhost:3000'}/qr/${qrToken}`
      };
    } catch (error) {
      logger.error(`Failed to generate QR code for order ${orderId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get QR code data by order ID or token
   * @param {string|number} identifier - Order ID or QR token
   * @returns {Object} - QR code with full data
   */
  async getQRCode(identifier) {
    try {
      let qr;

      // Check if identifier is a number (order ID) or string (token)
      if (typeof identifier === 'number' || /^\d+$/.test(identifier)) {
        qr = await knex('qr_codes')
          .where({ order_id: parseInt(identifier) })
          .first();
      } else {
        qr = await knex('qr_codes')
          .where({ qr_token: identifier })
          .first();
      }

      if (!qr) {
        const error = new Error('QR code not found');
        error.statusCode = 404;
        throw error;
      }

      // Check if expired
      if (new Date() > new Date(qr.expires_at)) {
        // Mark as expired
        await knex('qr_codes').where({ id: qr.id }).update({ status: 'expired' });

        const error = new Error('QR code has expired');
        error.statusCode = 410; // Gone
        throw error;
      }

      return {
        id: qr.id,
        order_id: qr.order_id,
        qr_token: qr.qr_token,
        qr_data: JSON.parse(qr.qr_data),
        status: qr.status,
        scan_count: qr.scan_count,
        created_at: qr.created_at,
        expires_at: qr.expires_at
      };
    } catch (error) {
      logger.error(`Failed to get QR code:`, error.message);
      throw error;
    }
  }

  /**
   * Validate QR code token (check if valid and active)
   * @param {string} qrToken - QR code token
   * @returns {Object} - Validation result with order details
   */
  async validateQRToken(qrToken) {
    try {
      const qr = await knex('qr_codes').where({ qr_token: qrToken }).first();

      if (!qr) {
        return {
          valid: false,
          error: 'QR code not found'
        };
      }

      // Check expiry
      if (new Date() > new Date(qr.expires_at)) {
        await knex('qr_codes').where({ id: qr.id }).update({ status: 'expired' });
        return {
          valid: false,
          error: 'QR code has expired'
        };
      }

      // Check if already scanned
      if (qr.status === 'scanned') {
        return {
          valid: false,
          error: 'QR code has already been scanned',
          scanned_at: qr.scanned_at
        };
      }

      // Get associated order
      const order = await knex('orders').where({ id: qr.order_id }).first();

      return {
        valid: true,
        qr_id: qr.id,
        qr_token: qr.qr_token,
        order_id: qr.order_id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        total_amount: order.total_amount,
        status: order.status,
        payment_status: order.payment_status,
        qr_data: JSON.parse(qr.qr_data)
      };
    } catch (error) {
      logger.error(`QR validation failed:`, error.message);
      throw error;
    }
  }

  /**
   * Mark QR code as scanned
   * @param {string} qrToken - QR code token
   * @param {number} scannedByUserId - User ID who scanned it
   * @param {number} checkoutCounterId - Checkout counter ID
   * @returns {Object} - Updated QR code with order details
   */
  async markQRAsScanned(qrToken, scannedByUserId, checkoutCounterId) {
    const trx = await knex.transaction();

    try {
      const qr = await trx('qr_codes').where({ qr_token: qrToken }).first();

      if (!qr) {
        const error = new Error('QR code not found');
        error.statusCode = 404;
        throw error;
      }

      // Check if already scanned
      if (qr.status === 'scanned') {
        const error = new Error('QR code has already been scanned');
        error.statusCode = 400;
        throw error;
      }

      // Check if expired
      if (new Date() > new Date(qr.expires_at)) {
        await trx('qr_codes').where({ id: qr.id }).update({ status: 'expired' });
        const error = new Error('QR code has expired');
        error.statusCode = 410;
        throw error;
      }

      // Update QR code
      const scannedAt = new Date();
      await trx('qr_codes').where({ id: qr.id }).update({
        status: 'scanned',
        scan_count: qr.scan_count + 1,
        scanned_at: scannedAt,
        scanned_by_user_id: scannedByUserId,
        checkout_counter_id: checkoutCounterId
      });

      // Get updated order
      const order = await trx('orders').where({ id: qr.order_id }).first();

      // Create scan event record (for analytics)
      await trx('qr_code_scans').insert({
        qr_id: qr.id,
        order_id: qr.order_id,
        scanned_by_user_id: scannedByUserId,
        checkout_counter_id: checkoutCounterId,
        scanned_at: scannedAt
      }).catch(() => {
        // Table might not exist yet, ignore
      });

      await trx.commit();

      logger.info(`QR code scanned: ${qrToken} by user ${scannedByUserId}`);

      return {
        success: true,
        qr_id: qr.id,
        order_id: qr.order_id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        total_amount: order.total_amount,
        scanned_at: scannedAt
      };
    } catch (error) {
      await trx.rollback();
      logger.error(`Failed to mark QR as scanned:`, error.message);
      throw error;
    }
  }

  /**
   * Generate unique QR token
   * Token format: Random 32 chars hex
   * @returns {string} - Unique token
   */
  generateToken() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Deactivate QR code
   * @param {string} qrToken - QR code token
   * @returns {Object} - Success response
   */
  async deactivateQR(qrToken) {
    try {
      const qr = await knex('qr_codes').where({ qr_token: qrToken }).first();

      if (!qr) {
        const error = new Error('QR code not found');
        error.statusCode = 404;
        throw error;
      }

      await knex('qr_codes').where({ id: qr.id }).update({ status: 'inactive' });

      logger.info(`QR code deactivated: ${qrToken}`);

      return {
        success: true,
        qr_token: qrToken
      };
    } catch (error) {
      logger.error(`Failed to deactivate QR:`, error.message);
      throw error;
    }
  }

  /**
   * Get QR statistics
   * @param {number} tenantId - Optional tenant filter
   * @returns {Object} - Statistics
   */
  async getQRStatistics(tenantId = null) {
    try {
      let query = knex('qr_codes');

      if (tenantId) {
        query = query
          .join('orders', 'qr_codes.order_id', 'orders.id')
          .where('orders.tenant_id', tenantId);
      }

      const total = await query.clone().count('id as count').first();
      const scanned = await query.clone().where('qr_codes.status', 'scanned').count('id as count').first();
      const expired = await query.clone().where('qr_codes.status', 'expired').count('id as count').first();
      const active = await query.clone().where('qr_codes.status', 'active').count('id as count').first();

      const totalScans = await query.clone().sum('qr_codes.scan_count as total').first();

      return {
        total: total.count,
        scanned: scanned.count,
        expired: expired.count,
        active: active.count,
        total_scans: totalScans.total || 0
      };
    } catch (error) {
      logger.error('Failed to get QR statistics:', error.message);
      throw error;
    }
  }
}

export default new QRCodeService();

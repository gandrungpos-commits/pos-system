/**
 * QR Code Controller
 * Handles HTTP requests for QR code endpoints
 */

import { validationResult } from 'express-validator';
import QRCodeService from '../services/QRCodeService.js';
import logger from '../config/logger.js';

class QRCodeController {
  /**
   * POST /api/qr/generate
   * Generate QR code for order
   */
  async generateQR(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { order_id } = req.body;

      const qrCode = await QRCodeService.generateQRCode(order_id);

      res.status(201).json({
        success: true,
        qr_code: qrCode
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      logger.error('Generate QR error:', error.message);

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/qr/:identifier
   * Get QR code data by order ID or QR token
   */
  async getQR(req, res) {
    try {
      const { identifier } = req.params;

      const qrCode = await QRCodeService.getQRCode(identifier);

      res.status(200).json({
        success: true,
        qr_code: qrCode
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      logger.error('Get QR error:', error.message);

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/qr/:qr_token/validate
   * Validate QR code without scanning
   */
  async validateQR(req, res) {
    try {
      const { qr_token } = req.params;

      const validation = await QRCodeService.validateQRToken(qr_token);

      res.status(200).json({
        success: validation.valid,
        validation
      });
    } catch (error) {
      logger.error('Validate QR error:', error.message);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/qr/scan
   * Mark QR code as scanned (Kasir scanning at checkout)
   */
  async scanQR(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { qr_token } = req.body;
      const userId = req.user.id;
      const checkoutCounterId = req.user.checkout_counter_id;

      if (!checkoutCounterId) {
        return res.status(403).json({
          success: false,
          error: 'User is not assigned to a checkout counter'
        });
      }

      const result = await QRCodeService.markQRAsScanned(qr_token, userId, checkoutCounterId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      logger.error('Scan QR error:', error.message);

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * DELETE /api/qr/:qr_token
   * Deactivate QR code
   */
  async deactivateQR(req, res) {
    try {
      const { qr_token } = req.params;

      const result = await QRCodeService.deactivateQR(qr_token);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      logger.error('Deactivate QR error:', error.message);

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/qr/statistics
   * Get QR code statistics
   */
  async getStatistics(req, res) {
    try {
      const { tenant_id } = req.query;

      const stats = await QRCodeService.getQRStatistics(
        tenant_id ? parseInt(tenant_id) : null
      );

      res.status(200).json({
        success: true,
        statistics: stats
      });
    } catch (error) {
      logger.error('Get QR statistics error:', error.message);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new QRCodeController();

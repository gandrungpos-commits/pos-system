/**
 * QR Code Routes
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import qrController from '../controllers/qrController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * POST /api/qr/generate
 * Generate QR code for order
 * Required: Authentication
 */
router.post('/generate',
  verifyToken,
  [
    body('order_id').isInt().toInt()
  ],
  qrController.generateQR
);

/**
 * GET /api/qr/:identifier
 * Get QR code by order ID or QR token
 * Required: Authentication
 */
router.get('/:identifier',
  verifyToken,
  qrController.getQR
);

/**
 * GET /api/qr/:qr_token/validate
 * Validate QR code
 * Required: Authentication
 */
router.get('/:qr_token/validate',
  verifyToken,
  qrController.validateQR
);

/**
 * POST /api/qr/scan
 * Mark QR code as scanned
 * Required: Authentication as Kasir
 */
router.post('/scan',
  verifyToken,
  requireRole('kasir'),
  [
    body('qr_token').trim().notEmpty()
  ],
  qrController.scanQR
);

/**
 * DELETE /api/qr/:qr_token
 * Deactivate QR code
 * Required: Authentication, Pengelola or Super_user role
 */
router.delete('/:qr_token',
  verifyToken,
  requireRole(['pengelola', 'super_user']),
  qrController.deactivateQR
);

/**
 * GET /api/qr/statistics
 * Get QR code statistics
 * Required: Authentication
 */
router.get('/statistics',
  verifyToken,
  [
    query('tenant_id').optional().isInt().toInt()
  ],
  qrController.getStatistics
);

export default router;

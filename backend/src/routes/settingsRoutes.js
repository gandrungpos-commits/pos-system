/**
 * Settings Routes
 * Endpoints for managing system settings
 */

import express from 'express';
import { param, body } from 'express-validator';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getAllSettings,
  getSetting,
  updateSetting,
  getRevenueSettings,
  updateRevenueSettings,
  getGeneralSettings,
  updateGeneralSettings,
  getNotificationSettings,
  updateNotificationSettings,
  initializeSettings
} from '../controllers/settingsController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/settings
 * Get all settings
 */
router.get(
  '/',
  getAllSettings
);

/**
 * GET /api/settings/:key
 * Get a specific setting
 */
router.get(
  '/:key',
  param('key').notEmpty().withMessage('Setting key is required'),
  getSetting
);

/**
 * PATCH /api/settings/:key
 * Update a specific setting
 */
router.patch(
  '/:key',
  param('key').notEmpty().withMessage('Setting key is required'),
  body('value').notEmpty().withMessage('Value is required'),
  updateSetting
);

/**
 * GET /api/settings/revenue
 * Get revenue settings
 */
router.get(
  '/revenue/config',
  getRevenueSettings
);

/**
 * PATCH /api/settings/revenue
 * Update revenue settings
 */
router.patch(
  '/revenue/config',
  body('tenant_percentage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tenant percentage must be between 0 and 100'),
  body('pengelola_percentage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Pengelola percentage must be between 0 and 100'),
  body('system_percentage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('System percentage must be between 0 and 100'),
  updateRevenueSettings
);

/**
 * GET /api/settings/general
 * Get general settings
 */
router.get(
  '/general/config',
  getGeneralSettings
);

/**
 * PATCH /api/settings/general
 * Update general settings
 */
router.patch(
  '/general/config',
  body('qr_expiry_hours').optional().isInt({ min: 1 }).withMessage('QR expiry must be positive'),
  body('tax_percentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax must be 0-100%'),
  body('business_name').optional().notEmpty().withMessage('Business name cannot be empty'),
  body('timezone').optional().notEmpty().withMessage('Timezone cannot be empty'),
  updateGeneralSettings
);

/**
 * GET /api/settings/notifications
 * Get notification settings
 */
router.get(
  '/notifications/config',
  getNotificationSettings
);

/**
 * PATCH /api/settings/notifications
 * Update notification settings
 */
router.patch(
  '/notifications/config',
  body('email_notifications').optional().isBoolean().withMessage('Must be boolean'),
  body('sms_notifications').optional().isBoolean().withMessage('Must be boolean'),
  body('push_notifications').optional().isBoolean().withMessage('Must be boolean'),
  body('notification_email').optional().isEmail().withMessage('Must be valid email'),
  body('notify_on_payment_failure').optional().isBoolean().withMessage('Must be boolean'),
  body('notify_on_refund').optional().isBoolean().withMessage('Must be boolean'),
  updateNotificationSettings
);

/**
 * POST /api/settings/initialize
 * Initialize default settings (admin only)
 */
router.post(
  '/initialize',
  initializeSettings
);

export default router;

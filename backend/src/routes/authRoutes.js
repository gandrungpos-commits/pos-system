/**
 * Authentication Routes
 */

import { Router } from 'express';
import {
  login,
  pinLogin,
  verifyToken,
  logout,
  resetPin,
  changePassword
} from '../controllers/authController.js';
import { verifyToken as authMiddleware, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * Public routes (no authentication required)
 */
router.post('/login', login);
router.post('/pin-login', pinLogin);
router.get('/verify-token', verifyToken);

/**
 * Protected routes (authentication required)
 */
router.post('/logout', authMiddleware, logout);
router.post('/reset-pin', authMiddleware, resetPin);
router.post('/change-password', authMiddleware, changePassword);

export default router;

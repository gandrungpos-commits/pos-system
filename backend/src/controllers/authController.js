/**
 * Authentication Controller
 * Handles HTTP requests for auth endpoints
 */

import AuthService from '../services/AuthService.js';
import logger from '../config/logger.js';

/**
 * POST /auth/login
 * Login with username and password
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Username and password are required'
      });
    }

    const result = await AuthService.login(username, password);

    res.status(200).json({
      success: true,
      token: result.token,
      user: result.user
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    logger.error('Login error:', error.message);

    res.status(statusCode).json({
      success: false,
      error: error.name || 'Error',
      message: error.message
    });
  }
};

/**
 * POST /auth/pin-login
 * Login with PIN (for Kasir, Tenant)
 */
export const pinLogin = async (req, res) => {
  try {
    const { username, pin } = req.body;

    // Validate input
    if (!username || !pin) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Username and PIN are required'
      });
    }

    const result = await AuthService.pinLogin(username, pin);

    res.status(200).json({
      success: true,
      token: result.token,
      user: result.user
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    logger.error('PIN login error:', error.message);

    res.status(statusCode).json({
      success: false,
      error: error.name || 'Error',
      message: error.message
    });
  }
};

/**
 * GET /auth/verify-token
 * Verify if token is valid
 */
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Token is required'
      });
    }

    const result = await AuthService.verifyToken(token);

    res.status(200).json({
      success: true,
      valid: result.valid,
      user: result.user
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    logger.error('Token verification error:', error.message);

    res.status(statusCode).json({
      success: false,
      error: error.name || 'Error',
      message: error.message
    });
  }
};

/**
 * POST /auth/logout
 * Logout user (clear session)
 */
export const logout = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const result = await AuthService.logout(userId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    logger.error('Logout error:', error.message);

    res.status(statusCode).json({
      success: false,
      error: error.name || 'Error',
      message: error.message
    });
  }
};

/**
 * POST /auth/reset-pin
 * Reset PIN for user (admin only or self)
 */
export const resetPin = async (req, res) => {
  try {
    const { username, new_pin } = req.body;
    const currentUser = req.user;

    // Validate input
    if (!username || !new_pin) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Username and new PIN are required'
      });
    }

    // Only super_user can reset other users' PINs
    if (currentUser?.role !== 'super_user' && currentUser?.username !== username) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only reset your own PIN'
      });
    }

    const result = await AuthService.resetPin(username, new_pin);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    logger.error('Reset PIN error:', error.message);

    res.status(statusCode).json({
      success: false,
      error: error.name || 'Error',
      message: error.message
    });
  }
};

/**
 * POST /auth/change-password
 * Change password for user
 */
export const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Validate input
    if (!old_password || !new_password) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Old password and new password are required'
      });
    }

    const result = await AuthService.changePassword(userId, old_password, new_password);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    logger.error('Change password error:', error.message);

    res.status(statusCode).json({
      success: false,
      error: error.name || 'Error',
      message: error.message
    });
  }
};

export default {
  login,
  pinLogin,
  verifyToken,
  logout,
  resetPin,
  changePassword
};

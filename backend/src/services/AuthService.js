/**
 * Authentication Service
 * Handles user authentication, token generation, PIN management
 */

import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import knex from '../config/database.js';
import logger from '../config/logger.js';
import { hashPassword, comparePassword, generateToken, verifyTokenUtil } from '../utils/helpers.js';

class AuthService {
  /**
   * Login with username and password
   * @param {string} username - Username
   * @param {string} password - Plain text password
   * @returns {Object} - { token, user }
   */
  async login(username, password) {
    try {
      // Find user by username
      const user = await knex('users')
        .where({ username })
        .first();

      if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      // Check if password exists and compare
      if (!user.password_hash) {
        const error = new Error('This account uses PIN authentication only');
        error.statusCode = 400;
        throw error;
      }

      const passwordMatch = await comparePassword(password, user.password_hash);
      if (!passwordMatch) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      // Check if user is active
      if (user.status !== 'active') {
        const error = new Error('User account is not active');
        error.statusCode = 403;
        throw error;
      }

      // Generate token
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        checkout_counter_id: user.checkout_counter_id
      });

      // Update last_login
      await knex('users')
        .where({ id: user.id })
        .update({ last_login: new Date() });

      logger.info(`User ${username} logged in successfully`);

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          phone: user.phone,
          tenant_id: user.tenant_id,
          checkout_counter_id: user.checkout_counter_id,
          status: user.status
        }
      };
    } catch (error) {
      logger.error(`Login failed for ${username}:`, error.message);
      throw error;
    }
  }

  /**
   * Login with PIN (for Kasir/Tenant users)
   * @param {string} username - Username
   * @param {string} pin - Plain text PIN (4 digits)
   * @returns {Object} - { token, user }
   */
  async pinLogin(username, pin) {
    try {
      // Validate PIN format
      if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        const error = new Error('PIN must be exactly 4 digits');
        error.statusCode = 400;
        throw error;
      }

      // Find user by username
      const user = await knex('users')
        .where({ username })
        .first();

      if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      // Check if PIN hash exists
      if (!user.pin_hash) {
        const error = new Error('This account does not support PIN authentication');
        error.statusCode = 400;
        throw error;
      }

      // Compare PIN
      const pinMatch = await comparePassword(pin, user.pin_hash);
      if (!pinMatch) {
        const error = new Error('Invalid PIN');
        error.statusCode = 401;
        throw error;
      }

      // Check if user is active
      if (user.status !== 'active') {
        const error = new Error('User account is not active');
        error.statusCode = 403;
        throw error;
      }

      // Generate token
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        checkout_counter_id: user.checkout_counter_id
      });

      // Update last_login
      await knex('users')
        .where({ id: user.id })
        .update({ last_login: new Date() });

      logger.info(`User ${username} logged in with PIN`);

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          phone: user.phone,
          tenant_id: user.tenant_id,
          checkout_counter_id: user.checkout_counter_id,
          status: user.status
        }
      };
    } catch (error) {
      logger.error(`PIN login failed for ${username}:`, error.message);
      throw error;
    }
  }

  /**
   * Verify JWT token validity
   * @param {string} token - JWT token
   * @returns {Object} - Decoded token data
   */
  async verifyToken(token) {
    try {
      if (!token) {
        const error = new Error('Token is required');
        error.statusCode = 400;
        throw error;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // Check if user still exists and is active
      const user = await knex('users')
        .where({ id: decoded.id })
        .first();

      if (!user || user.status !== 'active') {
        const error = new Error('User account is no longer active');
        error.statusCode = 401;
        throw error;
      }

      return {
        valid: true,
        user: decoded
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const expiredError = new Error('Token has expired');
        expiredError.statusCode = 401;
        throw expiredError;
      }

      logger.error('Token verification failed:', error.message);
      throw error;
    }
  }

  /**
   * Reset user PIN
   * @param {string} username - Username
   * @param {string} newPin - New PIN (4 digits)
   * @returns {Object} - { success: true }
   */
  async resetPin(username, newPin) {
    try {
      // Validate new PIN format
      if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        const error = new Error('PIN must be exactly 4 digits');
        error.statusCode = 400;
        throw error;
      }

      // Find user
      const user = await knex('users')
        .where({ username })
        .first();

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      // Hash new PIN
      const pinHash = await hashPassword(newPin);

      // Update PIN
      await knex('users')
        .where({ id: user.id })
        .update({ pin_hash: pinHash });

      logger.info(`PIN reset for user ${username}`);

      return {
        success: true,
        message: 'PIN updated successfully'
      };
    } catch (error) {
      logger.error(`PIN reset failed for ${username}:`, error.message);
      throw error;
    }
  }

  /**
   * Logout user (invalidate session if needed)
   * Note: With JWT, logout is typically handled on client-side by removing token
   * This method can be used for audit logging or token blacklisting if needed
   * @param {number} userId - User ID
   * @returns {Object} - { success: true }
   */
  async logout(userId) {
    try {
      // For audit purposes, log the logout
      logger.info(`User ${userId} logged out`);

      // In a stateless JWT system, logout is handled client-side
      // For token blacklisting, you'd insert token into blacklist table here
      // But for MVP, we'll keep it simple

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      logger.error(`Logout failed for user ${userId}:`, error.message);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} - { success: true }
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      // Validate password length
      if (!newPassword || newPassword.length < 6) {
        const error = new Error('Password must be at least 6 characters');
        error.statusCode = 400;
        throw error;
      }

      // Find user
      const user = await knex('users')
        .where({ id: userId })
        .first();

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      // Check if user has password (not PIN-only)
      if (!user.password_hash) {
        const error = new Error('This account uses PIN authentication only');
        error.statusCode = 400;
        throw error;
      }

      // Verify old password
      const passwordMatch = await comparePassword(oldPassword, user.password_hash);
      if (!passwordMatch) {
        const error = new Error('Current password is incorrect');
        error.statusCode = 401;
        throw error;
      }

      // Hash and save new password
      const passwordHash = await hashPassword(newPassword);
      await knex('users')
        .where({ id: userId })
        .update({ password_hash: passwordHash });

      logger.info(`Password changed for user ${user.username}`);

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      logger.error(`Change password failed for user ${userId}:`, error.message);
      throw error;
    }
  }
}

export default new AuthService();

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate JWT token
 */
export const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '30m') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Hash password/PIN
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password/PIN
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Generate unique UUID
 */
export const generateUUID = () => {
  return uuidv4();
};

/**
 * Generate unique order number
 */
export const generateOrderNumber = (tenantCode) => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${tenantCode}-${timestamp}${random}`;
};

/**
 * Generate unique transaction ID for payments
 */
export const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY-${timestamp}-${random}`;
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (Indonesia)
 */
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^(\+62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate PIN format (4-6 digits)
 */
export const isValidPin = (pin) => {
  return /^\d{4,6}$/.test(pin);
};

/**
 * Format currency to Indonesian Rupiah
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Calculate date range
 */
export const getDateRange = (period = 'today') => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate, endDate;

  switch (period) {
    case 'today':
      startDate = today;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      startDate = weekStart;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      startDate = today;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
};

export default {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateUUID,
  generateOrderNumber,
  generateTransactionId,
  isValidEmail,
  isValidPhoneNumber,
  isValidPin,
  formatCurrency,
  getDateRange
};

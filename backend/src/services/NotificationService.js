/**
 * Notification Service
 * Handles real-time event broadcasting via Socket.io
 */

import logger from '../config/logger.js';

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  /**
   * Initialize notification service with Socket.io instance
   */
  setIO(io) {
    this.io = io;
  }

  /**
   * Broadcast order creation event
   * @param {Object} order - Order object
   * @param {number} tenantId - Tenant ID
   */
  broadcastOrderCreated(order, tenantId) {
    if (!this.io) {
      logger.warn('Socket.io not initialized for order created notification');
      return;
    }

    try {
      // Broadcast to tenant room
      this.io.to(`tenant-${tenantId}`).emit('order:created', {
        type: 'order_created',
        timestamp: new Date(),
        data: {
          order_id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_name,
          total_amount: order.total_amount,
          items_count: order.items_count || 0,
          status: order.order_status
        }
      });

      // Also broadcast to kitchen display
      this.io.to('display').emit('order:created', {
        type: 'order_created',
        timestamp: new Date(),
        data: {
          order_id: order.id,
          order_number: order.order_number,
          tenant_id: tenantId
        }
      });

      logger.info(`Order created notification sent: Order ${order.id}`);
    } catch (error) {
      logger.error('Failed to broadcast order created event:', error.message);
    }
  }

  /**
   * Broadcast order status update
   * @param {Object} order - Order object
   * @param {string} previousStatus - Previous status
   * @param {number} tenantId - Tenant ID
   */
  broadcastOrderStatusChanged(order, previousStatus, tenantId) {
    if (!this.io) {
      logger.warn('Socket.io not initialized for order status notification');
      return;
    }

    try {
      const statusTransition = `${previousStatus} → ${order.order_status}`;

      // Broadcast to tenant room
      this.io.to(`tenant-${tenantId}`).emit('order:status_changed', {
        type: 'order_status_changed',
        timestamp: new Date(),
        data: {
          order_id: order.id,
          order_number: order.order_number,
          previous_status: previousStatus,
          new_status: order.order_status,
          transition: statusTransition,
          customer_name: order.customer_name
        }
      });

      // Broadcast to display
      this.io.to('display').emit('order:status_changed', {
        type: 'order_status_changed',
        timestamp: new Date(),
        data: {
          order_id: order.id,
          order_number: order.order_number,
          status: order.order_status,
          transition: statusTransition
        }
      });

      logger.info(`Order status changed: Order ${order.id} (${statusTransition})`);
    } catch (error) {
      logger.error('Failed to broadcast order status changed event:', error.message);
    }
  }

  /**
   * Broadcast payment processed event
   * @param {Object} payment - Payment object
   * @param {Object} order - Order object
   * @param {number} tenantId - Tenant ID
   * @param {number} counterId - Counter ID
   */
  broadcastPaymentProcessed(payment, order, tenantId, counterId) {
    if (!this.io) {
      logger.warn('Socket.io not initialized for payment notification');
      return;
    }

    try {
      // Broadcast to tenant room
      this.io.to(`tenant-${tenantId}`).emit('payment:processed', {
        type: 'payment_processed',
        timestamp: new Date(),
        data: {
          payment_id: payment.id,
          order_id: payment.order_id,
          order_number: order.order_number,
          amount_paid: payment.amount_paid,
          payment_method: payment.payment_method,
          transaction_reference: payment.transaction_reference,
          status: payment.status,
          change: payment.change || 0,
          customer_name: order.customer_name
        }
      });

      // Broadcast to counter room
      this.io.to(`kasir-${counterId}`).emit('payment:processed', {
        type: 'payment_processed',
        timestamp: new Date(),
        data: {
          payment_id: payment.id,
          order_number: order.order_number,
          amount_paid: payment.amount_paid,
          transaction_reference: payment.transaction_reference,
          change: payment.change || 0
        }
      });

      // Broadcast to display
      this.io.to('display').emit('payment:processed', {
        type: 'payment_processed',
        timestamp: new Date(),
        data: {
          order_id: payment.order_id,
          order_number: order.order_number,
          transaction_reference: payment.transaction_reference
        }
      });

      logger.info(`Payment processed notification sent: Payment ${payment.id}`);
    } catch (error) {
      logger.error('Failed to broadcast payment processed event:', error.message);
    }
  }

  /**
   * Broadcast QR code scanned event
   * @param {Object} qrCode - QR code object
   * @param {Object} order - Order object
   * @param {number} tenantId - Tenant ID
   */
  broadcastQRScanned(qrCode, order, tenantId) {
    if (!this.io) {
      logger.warn('Socket.io not initialized for QR scan notification');
      return;
    }

    try {
      // Broadcast to tenant room
      this.io.to(`tenant-${tenantId}`).emit('qr:scanned', {
        type: 'qr_scanned',
        timestamp: new Date(),
        data: {
          qr_id: qrCode.id,
          order_id: qrCode.order_id,
          order_number: order.order_number,
          token: qrCode.token,
          status: qrCode.status,
          scanned_count: qrCode.scan_count,
          customer_name: order.customer_name
        }
      });

      // Broadcast to display
      this.io.to('display').emit('qr:scanned', {
        type: 'qr_scanned',
        timestamp: new Date(),
        data: {
          order_id: order.id,
          order_number: order.order_number
        }
      });

      logger.info(`QR code scanned notification sent: QR ${qrCode.id}`);
    } catch (error) {
      logger.error('Failed to broadcast QR scanned event:', error.message);
    }
  }

  /**
   * Broadcast order cancelled event
   * @param {Object} order - Order object
   * @param {string} reason - Cancellation reason
   * @param {number} tenantId - Tenant ID
   */
  broadcastOrderCancelled(order, reason, tenantId) {
    if (!this.io) {
      logger.warn('Socket.io not initialized for order cancelled notification');
      return;
    }

    try {
      // Broadcast to tenant room
      this.io.to(`tenant-${tenantId}`).emit('order:cancelled', {
        type: 'order_cancelled',
        timestamp: new Date(),
        data: {
          order_id: order.id,
          order_number: order.order_number,
          reason: reason,
          customer_name: order.customer_name,
          refund_amount: order.total_amount
        }
      });

      // Broadcast to display
      this.io.to('display').emit('order:cancelled', {
        type: 'order_cancelled',
        timestamp: new Date(),
        data: {
          order_id: order.id,
          order_number: order.order_number
        }
      });

      logger.info(`Order cancelled notification sent: Order ${order.id}`);
    } catch (error) {
      logger.error('Failed to broadcast order cancelled event:', error.message);
    }
  }

  /**
   * Broadcast payment refunded event
   * @param {Object} refund - Refund payment object
   * @param {Object} order - Order object
   * @param {number} tenantId - Tenant ID
   */
  broadcastPaymentRefunded(refund, order, tenantId) {
    if (!this.io) {
      logger.warn('Socket.io not initialized for refund notification');
      return;
    }

    try {
      // Broadcast to tenant room
      this.io.to(`tenant-${tenantId}`).emit('payment:refunded', {
        type: 'payment_refunded',
        timestamp: new Date(),
        data: {
          refund_id: refund.id,
          order_id: refund.order_id,
          order_number: order.order_number,
          refund_amount: Math.abs(refund.amount_paid),
          transaction_reference: refund.transaction_reference,
          original_payment_id: refund.original_payment_id,
          reason: refund.reason,
          customer_name: order.customer_name
        }
      });

      // Broadcast to display
      this.io.to('display').emit('payment:refunded', {
        type: 'payment_refunded',
        timestamp: new Date(),
        data: {
          order_id: refund.order_id,
          order_number: order.order_number,
          refund_amount: Math.abs(refund.amount_paid)
        }
      });

      logger.info(`Payment refunded notification sent: Refund ${refund.id}`);
    } catch (error) {
      logger.error('Failed to broadcast payment refunded event:', error.message);
    }
  }

  /**
   * Send notification to specific user
   * @param {number} userId - User ID
   * @param {string} type - Notification type
   * @param {Object} data - Notification data
   */
  notifyUser(userId, type, data) {
    if (!this.io) {
      logger.warn('Socket.io not initialized for user notification');
      return;
    }

    try {
      this.io.to(`user-${userId}`).emit('notification', {
        type: type,
        timestamp: new Date(),
        data: data
      });

      logger.info(`User notification sent: User ${userId}, Type ${type}`);
    } catch (error) {
      logger.error('Failed to send user notification:', error.message);
    }
  }

  /**
   * Send error alert to all connected users
   * @param {string} message - Error message
   * @param {string} severity - error|warning|info
   */
  broadcastAlert(message, severity = 'error') {
    if (!this.io) {
      logger.warn('Socket.io not initialized for alert');
      return;
    }

    try {
      this.io.emit('alert', {
        type: 'system_alert',
        severity: severity,
        message: message,
        timestamp: new Date()
      });

      logger.info(`Alert broadcasted: ${severity} - ${message}`);
    } catch (error) {
      logger.error('Failed to broadcast alert:', error.message);
    }
  }

  /**
   * Get active connection count
   * @returns {number} - Number of connected clients
   */
  getActiveConnections() {
    if (!this.io) return 0;
    return this.io.engine.clientsCount || 0;
  }

  /**
   * Get clients in specific room
   * @param {string} room - Room name
   * @returns {Array} - Array of socket IDs
   */
  getRoomClients(room) {
    if (!this.io) return [];
    const sockets = this.io.sockets.adapter.rooms.get(room);
    return sockets ? Array.from(sockets) : [];
  }

  /**
   * Disconnect all clients in room
   * @param {string} room - Room name
   */
  disconnectRoom(room) {
    if (!this.io) return;

    try {
      this.io.to(room).disconnectSockets();
      logger.info(`Disconnected all clients in room: ${room}`);
    } catch (error) {
      logger.error(`Failed to disconnect room ${room}:`, error.message);
    }
  }
}

export default NotificationService;

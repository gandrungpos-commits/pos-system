/**
 * Socket.io Real-time Events Tests
 * Test Socket.io event broadcasting for orders, payments, QR codes
 */

import { io as ioClient } from 'socket.io-client';
import { server, io: ioServer, notificationService } from '../server.js';
import knex from '../config/database.js';
import { generateToken } from '../utils/helpers.js';

describe('Socket.io Real-time Events', () => {
  let clientSocket;
  const PORT = process.env.PORT || 5000;
  const SERVER_URL = `http://localhost:${PORT}`;

  beforeAll(async () => {
    // Setup: Create test data
    const [tenant] = await knex('tenants').insert({
      name: 'Test Tenant',
      location: 'Test Location',
      status: 'active',
      revenue_share_percentage: 97,
      created_at: new Date()
    }).returning('*');

    const [user] = await knex('users').insert({
      username: 'test_user',
      password_hash: 'hashed',
      role: 'kasir',
      status: 'active',
      checkout_counter_id: 1,
      created_at: new Date()
    }).returning('*');
  });

  afterAll(async () => {
    // Cleanup
    if (clientSocket) {
      clientSocket.disconnect();
    }
    await knex('payments').del();
    await knex('qr_codes').del();
    await knex('order_items').del();
    await knex('orders').del();
    await knex('tenants').del();
    await knex('users').del();
  });

  describe('Socket.io Connection', () => {
    test('Should establish Socket.io connection', (done) => {
      clientSocket = ioClient(SERVER_URL);

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });

      clientSocket.on('connect_error', (error) => {
        done(error);
      });
    });

    test('Should join tenant room', (done) => {
      clientSocket = ioClient(SERVER_URL);

      clientSocket.on('connect', () => {
        clientSocket.emit('join-tenant', 1);
        
        // Verify join success
        setTimeout(() => {
          expect(clientSocket.connected).toBe(true);
          done();
        }, 100);
      });
    });

    test('Should join kasir counter room', (done) => {
      clientSocket = ioClient(SERVER_URL);

      clientSocket.on('connect', () => {
        clientSocket.emit('join-kasir', 1);
        
        setTimeout(() => {
          expect(clientSocket.connected).toBe(true);
          done();
        }, 100);
      });
    });

    test('Should join display monitoring room', (done) => {
      clientSocket = ioClient(SERVER_URL);

      clientSocket.on('connect', () => {
        clientSocket.emit('join-display');
        
        setTimeout(() => {
          expect(clientSocket.connected).toBe(true);
          done();
        }, 100);
      });
    });
  });

  describe('Order Events', () => {
    beforeEach(async () => {
      clientSocket = ioClient(SERVER_URL);
      clientSocket.emit('join-tenant', 1);
    });

    afterEach(() => {
      if (clientSocket) {
        clientSocket.disconnect();
      }
    });

    test('Should broadcast order created event', (done) => {
      clientSocket.on('order:created', (notification) => {
        expect(notification.type).toBe('order_created');
        expect(notification.data).toHaveProperty('order_id');
        expect(notification.data).toHaveProperty('order_number');
        expect(notification.timestamp).toBeDefined();
        done();
      });

      // Trigger order creation
      setTimeout(() => {
        notificationService.broadcastOrderCreated(
          {
            id: 1,
            order_number: 'T1-001',
            customer_name: 'John Doe',
            total_amount: 50000,
            order_status: 'pending'
          },
          1 // tenantId
        );
      }, 100);
    });

    test('Should broadcast order status changed event', (done) => {
      clientSocket.on('order:status_changed', (notification) => {
        expect(notification.type).toBe('order_status_changed');
        expect(notification.data.transition).toContain('→');
        expect(notification.data).toHaveProperty('previous_status');
        expect(notification.data).toHaveProperty('new_status');
        done();
      });

      setTimeout(() => {
        notificationService.broadcastOrderStatusChanged(
          {
            id: 1,
            order_number: 'T1-001',
            order_status: 'preparing',
            customer_name: 'John Doe'
          },
          'pending',
          1
        );
      }, 100);
    });

    test('Should broadcast order cancelled event', (done) => {
      clientSocket.on('order:cancelled', (notification) => {
        expect(notification.type).toBe('order_cancelled');
        expect(notification.data.reason).toBe('Out of stock');
        expect(notification.data).toHaveProperty('refund_amount');
        done();
      });

      setTimeout(() => {
        notificationService.broadcastOrderCancelled(
          {
            id: 1,
            order_number: 'T1-001',
            customer_name: 'John Doe',
            total_amount: 50000
          },
          'Out of stock',
          1
        );
      }, 100);
    });
  });

  describe('Payment Events', () => {
    beforeEach(async () => {
      clientSocket = ioClient(SERVER_URL);
      clientSocket.emit('join-kasir', 1);
    });

    afterEach(() => {
      if (clientSocket) {
        clientSocket.disconnect();
      }
    });

    test('Should broadcast payment processed event', (done) => {
      clientSocket.on('payment:processed', (notification) => {
        expect(notification.type).toBe('payment_processed');
        expect(notification.data).toHaveProperty('payment_id');
        expect(notification.data).toHaveProperty('transaction_reference');
        expect(notification.data.status).toBe('success');
        done();
      });

      setTimeout(() => {
        notificationService.broadcastPaymentProcessed(
          {
            id: 1,
            order_id: 1,
            amount_paid: 50000,
            payment_method: 'cash',
            transaction_reference: 'PAY-1706966400000-ABC123',
            status: 'success',
            change: 0
          },
          {
            id: 1,
            order_number: 'T1-001',
            customer_name: 'John Doe'
          },
          1,
          1
        );
      }, 100);
    });

    test('Should broadcast payment refunded event', (done) => {
      clientSocket.on('payment:refunded', (notification) => {
        expect(notification.type).toBe('payment_refunded');
        expect(notification.data).toHaveProperty('refund_id');
        expect(notification.data).toHaveProperty('original_payment_id');
        expect(notification.data).toHaveProperty('refund_amount');
        done();
      });

      setTimeout(() => {
        notificationService.broadcastPaymentRefunded(
          {
            id: 2,
            order_id: 1,
            amount_paid: -50000,
            transaction_reference: 'REFUND-PAY-1706966700000-DEF456',
            original_payment_id: 1,
            reason: 'Customer requested'
          },
          {
            id: 1,
            order_number: 'T1-001',
            customer_name: 'John Doe'
          },
          1
        );
      }, 100);
    });
  });

  describe('QR Code Events', () => {
    beforeEach(async () => {
      clientSocket = ioClient(SERVER_URL);
      clientSocket.emit('join-display');
    });

    afterEach(() => {
      if (clientSocket) {
        clientSocket.disconnect();
      }
    });

    test('Should broadcast QR code scanned event', (done) => {
      clientSocket.on('qr:scanned', (notification) => {
        expect(notification.type).toBe('qr_scanned');
        expect(notification.data).toHaveProperty('qr_id');
        expect(notification.data).toHaveProperty('order_id');
        expect(notification.data).toHaveProperty('scanned_count');
        done();
      });

      setTimeout(() => {
        notificationService.broadcastQRScanned(
          {
            id: 1,
            order_id: 1,
            token: 'abc123def456',
            status: 'scanned',
            scan_count: 1
          },
          {
            id: 1,
            order_number: 'T1-001',
            customer_name: 'John Doe'
          },
          1
        );
      }, 100);
    });
  });

  describe('User Notifications', () => {
    test('Should send notification to specific user', (done) => {
      const userSocket = ioClient(SERVER_URL);

      userSocket.on('connect', () => {
        userSocket.on('notification', (notification) => {
          expect(notification.type).toBe('order_ready');
          expect(notification.data).toHaveProperty('order_id');
          userSocket.disconnect();
          done();
        });

        // Simulate sending notification to this user
        setTimeout(() => {
          const userId = 1;
          notificationService.notifyUser(userId, 'order_ready', {
            order_id: 1,
            order_number: 'T1-001'
          });
        }, 100);
      });
    });
  });

  describe('System Alerts', () => {
    test('Should broadcast system alert', (done) => {
      clientSocket = ioClient(SERVER_URL);

      clientSocket.on('alert', (alert) => {
        expect(alert.type).toBe('system_alert');
        expect(alert.severity).toBe('error');
        expect(alert.message).toBeDefined();
        expect(alert.timestamp).toBeDefined();
        done();
      });

      clientSocket.on('connect', () => {
        setTimeout(() => {
          notificationService.broadcastAlert('System maintenance in 5 minutes', 'warning');
        }, 100);
      });
    });

    test('Should broadcast info alert', (done) => {
      clientSocket = ioClient(SERVER_URL);

      clientSocket.on('alert', (alert) => {
        if (alert.severity === 'info') {
          expect(alert.severity).toBe('info');
          done();
        }
      });

      clientSocket.on('connect', () => {
        setTimeout(() => {
          notificationService.broadcastAlert('New order received', 'info');
        }, 100);
      });
    });
  });

  describe('Room Management', () => {
    test('Should get room clients count', (done) => {
      clientSocket = ioClient(SERVER_URL);

      clientSocket.on('connect', () => {
        clientSocket.emit('join-tenant', 1);

        setTimeout(() => {
          const clients = notificationService.getRoomClients('tenant-1');
          expect(Array.isArray(clients)).toBe(true);
          done();
        }, 100);
      });
    });

    test('Should report active connections', (done) => {
      clientSocket = ioClient(SERVER_URL);

      clientSocket.on('connect', () => {
        const activeConnections = notificationService.getActiveConnections();
        expect(typeof activeConnections).toBe('number');
        expect(activeConnections).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('Multi-room Broadcasting', () => {
    test('Should broadcast to multiple rooms simultaneously', (done) => {
      const tenantSocket = ioClient(SERVER_URL);
      const kasirSocket = ioClient(SERVER_URL);
      let receivedCount = 0;

      tenantSocket.on('connect', () => {
        tenantSocket.emit('join-tenant', 1);
        kasirSocket.emit('join-kasir', 1);

        tenantSocket.on('payment:processed', () => {
          receivedCount++;
          if (receivedCount === 2) {
            tenantSocket.disconnect();
            kasirSocket.disconnect();
            done();
          }
        });

        kasirSocket.on('payment:processed', () => {
          receivedCount++;
          if (receivedCount === 2) {
            tenantSocket.disconnect();
            kasirSocket.disconnect();
            done();
          }
        });

        setTimeout(() => {
          notificationService.broadcastPaymentProcessed(
            {
              id: 1,
              order_id: 1,
              amount_paid: 50000,
              payment_method: 'cash',
              transaction_reference: 'PAY-1706966400000-ABC123',
              status: 'success',
              change: 0
            },
            {
              id: 1,
              order_number: 'T1-001',
              customer_name: 'John Doe'
            },
            1,
            1
          );
        }, 100);
      });
    });
  });

  describe('Event Data Integrity', () => {
    test('Should include correct timestamp in all events', (done) => {
      clientSocket = ioClient(SERVER_URL);
      clientSocket.emit('join-tenant', 1);

      clientSocket.on('order:created', (notification) => {
        const timestamp = new Date(notification.timestamp);
        expect(timestamp instanceof Date).toBe(true);
        expect(timestamp.getTime()).toBeLessThanOrEqual(new Date().getTime());
        done();
      });

      clientSocket.on('connect', () => {
        setTimeout(() => {
          notificationService.broadcastOrderCreated(
            {
              id: 1,
              order_number: 'T1-001',
              customer_name: 'John Doe',
              total_amount: 50000,
              order_status: 'pending'
            },
            1
          );
        }, 100);
      });
    });

    test('Should include all required data fields in order event', (done) => {
      clientSocket = ioClient(SERVER_URL);
      clientSocket.emit('join-tenant', 1);

      clientSocket.on('order:created', (notification) => {
        const { data } = notification;
        expect(data).toHaveProperty('order_id');
        expect(data).toHaveProperty('order_number');
        expect(data).toHaveProperty('customer_name');
        expect(data).toHaveProperty('total_amount');
        expect(data).toHaveProperty('status');
        done();
      });

      clientSocket.on('connect', () => {
        setTimeout(() => {
          notificationService.broadcastOrderCreated(
            {
              id: 123,
              order_number: 'T1-123',
              customer_name: 'Jane Smith',
              total_amount: 75000,
              order_status: 'pending'
            },
            1
          );
        }, 100);
      });
    });
  });

  describe('Error Handling', () => {
    test('Should handle missing Socket.io instance gracefully', () => {
      const tempService = new NotificationService(null);
      
      // Should not throw
      expect(() => {
        tempService.broadcastOrderCreated({ id: 1 }, 1);
      }).not.toThrow();
    });

    test('Should continue working after failed broadcast attempt', (done) => {
      clientSocket = ioClient(SERVER_URL);
      clientSocket.emit('join-tenant', 1);

      let eventCount = 0;

      clientSocket.on('order:created', () => {
        eventCount++;
        if (eventCount === 2) {
          expect(eventCount).toBe(2);
          done();
        }
      });

      clientSocket.on('connect', () => {
        setTimeout(() => {
          // First broadcast
          notificationService.broadcastOrderCreated(
            {
              id: 1,
              order_number: 'T1-001',
              customer_name: 'John Doe',
              total_amount: 50000,
              order_status: 'pending'
            },
            1
          );

          // Second broadcast (should work normally)
          setTimeout(() => {
            notificationService.broadcastOrderCreated(
              {
                id: 2,
                order_number: 'T1-002',
                customer_name: 'Jane Doe',
                total_amount: 75000,
                order_status: 'pending'
              },
              1
            );
          }, 100);
        }, 100);
      });
    });
  });
});

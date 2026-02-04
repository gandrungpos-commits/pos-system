/**
 * Order Management Tests
 */

import request from 'supertest';
import app from '../src/index.js';
import OrderService from '../src/services/OrderService.js';
import knex from '../src/config/database.js';

describe('Order Management Tests', () => {
  let token = null;
  let tenantId = null;
  let orderId = null;

  beforeAll(async () => {
    // Get token from kasir login
    const loginRes = await request(app)
      .post('/api/auth/pin-login')
      .send({
        username: 'kasir1',
        pin: '1234'
      });

    token = loginRes.body.token;

    // Get first tenant for testing
    const tenant = await knex('tenants').first();
    if (tenant) {
      tenantId = tenant.id;
    }
  });

  describe('POST /api/orders', () => {
    test('should create order with valid data', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tenant_id: tenantId,
          customer_name: 'John Doe',
          customer_phone: '081234567890',
          items: [
            {
              item_name: 'Nasi Kuning',
              quantity: 2,
              unit_price: 25000,
              notes: ''
            },
            {
              item_name: 'Ayam Bakar',
              quantity: 1,
              unit_price: 35000,
              notes: 'Jangan terlalu pedas'
            }
          ],
          order_type: 'takeaway'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.order).toBeDefined();
      expect(response.body.order.order_number).toBeDefined();
      expect(response.body.order.total_amount).toBe(85000);
      expect(response.body.order.status).toBe('pending');

      orderId = response.body.order.id;
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          tenant_id: tenantId,
          customer_name: 'Jane Doe',
          customer_phone: '081234567891',
          items: [
            {
              item_name: 'Bakso',
              quantity: 1,
              unit_price: 30000
            }
          ]
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should fail with empty items', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tenant_id: tenantId,
          customer_name: 'Jane Doe',
          customer_phone: '081234567891',
          items: [],
          order_type: 'takeaway'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should create dine_in order with table number', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tenant_id: tenantId,
          customer_name: 'Alice Smith',
          customer_phone: '081234567892',
          items: [
            {
              item_name: 'Soto Ayam',
              quantity: 1,
              unit_price: 25000
            }
          ],
          order_type: 'dine_in',
          table_number: 5
        });

      expect(response.status).toBe(201);
      expect(response.body.order.order_type).toBe('dine_in');
      expect(response.body.order.table_number).toBe(5);
    });
  });

  describe('GET /api/orders/:id', () => {
    test('should get order details', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.order.id).toBe(orderId);
      expect(response.body.order.items).toBeDefined();
      expect(Array.isArray(response.body.order.items)).toBe(true);
    });

    test('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/orders', () => {
    test('should list all orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body.total).toBeDefined();
    });

    test('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/orders?status=pending')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.orders.every(order => order.status === 'pending')).toBe(true);
    });

    test('should filter orders by tenant', async () => {
      const response = await request(app)
        .get(`/api/orders?tenant_id=${tenantId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.orders.every(order => order.tenant_id === tenantId)).toBe(true);
    });

    test('should support pagination', async () => {
      const response = await request(app)
        .get('/api/orders?limit=5&offset=0')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.limit).toBe(5);
      expect(response.body.offset).toBe(0);
      expect(response.body.orders.length).toBeLessThanOrEqual(5);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    test('should update order status from pending to paid', async () => {
      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'paid'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.order.status).toBe('paid');
    });

    test('should fail with invalid status transition', async () => {
      // Try to go from paid to pending (not allowed)
      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'pending'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should update to preparing status', async () => {
      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'preparing'
        });

      expect(response.status).toBe(200);
      expect(response.body.order.status).toBe('preparing');
    });

    test('should update to ready status with timestamp', async () => {
      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'ready'
        });

      expect(response.status).toBe(200);
      expect(response.body.order.status).toBe('ready');
      expect(response.body.order.ready_at).toBeDefined();
    });
  });

  describe('DELETE /api/orders/:id', () => {
    test('should cancel order', async () => {
      // Create a new order to cancel
      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tenant_id: tenantId,
          customer_name: 'Cancel Test',
          customer_phone: '081234567893',
          items: [
            {
              item_name: 'Test Item',
              quantity: 1,
              unit_price: 10000
            }
          ]
        });

      const newOrderId = createRes.body.order.id;

      const response = await request(app)
        .delete(`/api/orders/${newOrderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          reason: 'Customer requested cancellation'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.order_id).toBe(newOrderId);
    });

    test('should fail cancelling non-existent order', async () => {
      const response = await request(app)
        .delete('/api/orders/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          reason: 'Test'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tenants/:tenant_id/orders', () => {
    test('should get tenant orders', async () => {
      const response = await request(app)
        .get(`/api/tenants/${tenantId}/orders`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.orders)).toBe(true);
    });

    test('should filter tenant orders by status', async () => {
      const response = await request(app)
        .get(`/api/tenants/${tenantId}/orders?status=ready`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.orders.every(order => order.status === 'ready' && order.tenant_id === tenantId)).toBe(true);
    });
  });
});

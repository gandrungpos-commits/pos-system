/**
 * QR Code Tests
 */

import request from 'supertest';
import app from '../src/index.js';
import QRCodeService from '../src/services/QRCodeService.js';
import knex from '../src/config/database.js';

describe('QR Code Tests', () => {
  let kasirToken = null;
  let adminToken = null;
  let orderId = null;
  let qrToken = null;
  let tenantId = null;

  beforeAll(async () => {
    // Get kasir token
    const kasirRes = await request(app)
      .post('/api/auth/pin-login')
      .send({
        username: 'kasir1',
        pin: '1234'
      });

    kasirToken = kasirRes.body.token;

    // Get admin token
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    adminToken = adminRes.body.token;

    // Get first tenant
    const tenant = await knex('tenants').first();
    if (tenant) {
      tenantId = tenant.id;
    }

    // Create a test order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${kasirToken}`)
      .send({
        tenant_id: tenantId,
        customer_name: 'QR Test Customer',
        customer_phone: '081234567890',
        items: [
          {
            item_name: 'Test Item',
            quantity: 1,
            unit_price: 50000
          }
        ]
      });

    orderId = orderRes.body.order.id;
  });

  describe('POST /api/qr/generate', () => {
    test('should generate QR code for order', async () => {
      const response = await request(app)
        .post('/api/qr/generate')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          order_id: orderId
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.qr_code).toBeDefined();
      expect(response.body.qr_code.qr_token).toBeDefined();
      expect(response.body.qr_code.qr_data).toBeDefined();
      expect(response.body.qr_code.status).toBe('active');
      expect(response.body.qr_code.qr_url).toBeDefined();

      qrToken = response.body.qr_code.qr_token;
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/qr/generate')
        .send({
          order_id: orderId
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should fail with non-existent order', async () => {
      const response = await request(app)
        .post('/api/qr/generate')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          order_id: 99999
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should return existing QR code if already generated', async () => {
      const response = await request(app)
        .post('/api/qr/generate')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          order_id: orderId
        });

      expect(response.status).toBe(201);
      expect(response.body.qr_code.qr_token).toBe(qrToken);
    });
  });

  describe('GET /api/qr/:identifier', () => {
    test('should get QR code by order ID', async () => {
      const response = await request(app)
        .get(`/api/qr/${orderId}`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.qr_code.order_id).toBe(orderId);
      expect(response.body.qr_code.qr_token).toBeDefined();
    });

    test('should get QR code by token', async () => {
      const response = await request(app)
        .get(`/api/qr/${qrToken}`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.qr_code.qr_token).toBe(qrToken);
    });

    test('should return 404 for non-existent QR', async () => {
      const response = await request(app)
        .get('/api/qr/nonexistent')
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/qr/:qr_token/validate', () => {
    test('should validate active QR code', async () => {
      const response = await request(app)
        .get(`/api/qr/${qrToken}/validate`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.validation.valid).toBe(true);
      expect(response.body.validation.order_number).toBeDefined();
    });

    test('should fail for invalid QR token', async () => {
      const response = await request(app)
        .get('/api/qr/invalidtoken/validate')
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(response.status).toBe(200);
      expect(response.body.validation.valid).toBe(false);
      expect(response.body.validation.error).toBeDefined();
    });
  });

  describe('POST /api/qr/scan', () => {
    test('should scan QR code successfully', async () => {
      const response = await request(app)
        .post('/api/qr/scan')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          qr_token: qrToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.order_id).toBe(orderId);
      expect(response.body.scanned_at).toBeDefined();
    });

    test('should fail scanning same QR code twice', async () => {
      const response = await request(app)
        .post('/api/qr/scan')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          qr_token: qrToken
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already been scanned');
    });

    test('should fail without kasir role', async () => {
      // Create QR for another order
      const order2 = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          tenant_id: tenantId,
          customer_name: 'Test 2',
          customer_phone: '081234567891',
          items: [
            {
              item_name: 'Test Item 2',
              quantity: 1,
              unit_price: 30000
            }
          ]
        });

      const qr2 = await request(app)
        .post('/api/qr/generate')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          order_id: order2.body.order.id
        });

      const response = await request(app)
        .post('/api/qr/scan')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          qr_token: qr2.body.qr_code.qr_token
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/qr/scan')
        .send({
          qr_token: qrToken
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/qr/:qr_token', () => {
    test('should deactivate QR code with admin role', async () => {
      // Create a new QR code to deactivate
      const order3 = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          tenant_id: tenantId,
          customer_name: 'Test 3',
          customer_phone: '081234567892',
          items: [
            {
              item_name: 'Test Item 3',
              quantity: 1,
              unit_price: 20000
            }
          ]
        });

      const qr3 = await request(app)
        .post('/api/qr/generate')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          order_id: order3.body.order.id
        });

      const response = await request(app)
        .delete(`/api/qr/${qr3.body.qr_code.qr_token}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should fail without admin role', async () => {
      const response = await request(app)
        .delete(`/api/qr/${qrToken}`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/qr/statistics', () => {
    test('should get QR statistics', async () => {
      const response = await request(app)
        .get('/api/qr/statistics')
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.statistics).toBeDefined();
      expect(response.body.statistics.total).toBeDefined();
      expect(response.body.statistics.scanned).toBeDefined();
      expect(response.body.statistics.expired).toBeDefined();
      expect(response.body.statistics.active).toBeDefined();
    });

    test('should filter statistics by tenant', async () => {
      const response = await request(app)
        .get(`/api/qr/statistics?tenant_id=${tenantId}`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(response.status).toBe(200);
      expect(response.body.statistics).toBeDefined();
    });
  });
});

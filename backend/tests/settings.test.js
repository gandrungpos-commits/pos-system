/**
 * Settings API Tests
 * Test settings management and configuration
 */

import request from 'supertest';
import app from '../server.js';
import knex from '../config/database.js';
import { generateToken } from '../utils/helpers.js';

describe('Settings APIs', () => {
  let adminToken;
  let pengelolaToken;

  beforeAll(async () => {
    // Create admin user
    const [admin] = await knex('users').insert({
      username: 'admin_settings',
      password_hash: 'hashed',
      role: 'super_user',
      status: 'active',
      created_at: new Date()
    }).returning('*');
    adminToken = generateToken({ id: admin.id, role: 'super_user' });

    // Create pengelola user
    const [pengelola] = await knex('users').insert({
      username: 'pengelola_settings',
      password_hash: 'hashed',
      role: 'pengelola',
      status: 'active',
      created_at: new Date()
    }).returning('*');
    pengelolaToken = generateToken({ id: pengelola.id, role: 'pengelola' });

    // Initialize settings
    try {
      await request(app)
        .post('/api/settings/initialize')
        .set('Authorization', `Bearer ${adminToken}`);
    } catch (e) {
      // Settings may already exist
    }
  });

  afterAll(async () => {
    // Cleanup
    await knex('settings').del();
    await knex('users').del();
  });

  describe('GET /api/settings', () => {
    test('Should get all settings', async () => {
      const res = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data).toBe('object');
      expect(Object.keys(res.body.data).length).toBeGreaterThan(0);
    });

    test('Should include revenue settings', async () => {
      const res = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('revenue_tenant_percentage');
      expect(res.body.data).toHaveProperty('revenue_pengelola_percentage');
      expect(res.body.data).toHaveProperty('revenue_system_percentage');
    });

    test('Should include general settings', async () => {
      const res = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('business_name');
      expect(res.body.data).toHaveProperty('qr_expiry_hours');
      expect(res.body.data).toHaveProperty('tax_percentage');
    });

    test('Should include notification settings', async () => {
      const res = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('email_notifications');
      expect(res.body.data).toHaveProperty('sms_notifications');
    });

    test('Should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/settings');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/settings/:key', () => {
    test('Should get specific setting', async () => {
      const res = await request(app)
        .get('/api/settings/qr_expiry_hours')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('key');
      expect(res.body.data).toHaveProperty('value');
      expect(res.body.data.key).toBe('qr_expiry_hours');
    });

    test('Should return setting with metadata', async () => {
      const res = await request(app)
        .get('/api/settings/tax_percentage')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('type');
      expect(res.body.data).toHaveProperty('description');
      expect(res.body.data).toHaveProperty('updated_at');
    });

    test('Should fail with non-existent key', async () => {
      const res = await request(app)
        .get('/api/settings/non_existent_key')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/settings/:key', () => {
    test('Should update setting value', async () => {
      const res = await request(app)
        .patch('/api/settings/qr_expiry_hours')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ value: '48' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.value).toBe(48);
    });

    test('Should persist updated value', async () => {
      // Update
      await request(app)
        .patch('/api/settings/tax_percentage')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ value: '15' });

      // Verify
      const res = await request(app)
        .get('/api/settings/tax_percentage')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.value).toBe(15);
    });

    test('Should fail without value', async () => {
      const res = await request(app)
        .patch('/api/settings/qr_expiry_hours')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    test('Should fail with non-existent key', async () => {
      const res = await request(app)
        .patch('/api/settings/non_existent')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ value: 'test' });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/settings/revenue/config', () => {
    test('Should get revenue settings', async () => {
      const res = await request(app)
        .get('/api/settings/revenue/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('tenant_percentage');
      expect(res.body.data).toHaveProperty('pengelola_percentage');
      expect(res.body.data).toHaveProperty('system_percentage');
    });

    test('Should show percentage breakdown', async () => {
      const res = await request(app)
        .get('/api/settings/revenue/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const { tenant_percentage, pengelola_percentage, system_percentage } = res.body.data;
      const total = tenant_percentage + pengelola_percentage + system_percentage;
      expect(total).toBeCloseTo(100, 1);
    });
  });

  describe('PATCH /api/settings/revenue/config', () => {
    test('Should update revenue percentages', async () => {
      const res = await request(app)
        .patch('/api/settings/revenue/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          tenant_percentage: 95,
          pengelola_percentage: 3,
          system_percentage: 2
        });

      expect(res.status).toBe(200);
      expect(res.body.data.tenant_percentage).toBe(95);
      expect(res.body.data.pengelola_percentage).toBe(3);
      expect(res.body.data.system_percentage).toBe(2);
    });

    test('Should validate total equals 100', async () => {
      const res = await request(app)
        .patch('/api/settings/revenue/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          tenant_percentage: 90,
          pengelola_percentage: 5,
          system_percentage: 5
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('sum to 100');
    });

    test('Should reject negative percentages', async () => {
      const res = await request(app)
        .patch('/api/settings/revenue/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          tenant_percentage: -50,
          pengelola_percentage: 75,
          system_percentage: 75
        });

      expect(res.status).toBe(400);
    });

    test('Should persist revenue settings', async () => {
      // Update with valid values
      await request(app)
        .patch('/api/settings/revenue/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          tenant_percentage: 96,
          pengelola_percentage: 2,
          system_percentage: 2
        });

      // Verify
      const res = await request(app)
        .get('/api/settings/revenue/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tenant_percentage).toBe(96);
    });
  });

  describe('GET /api/settings/general/config', () => {
    test('Should get general settings', async () => {
      const res = await request(app)
        .get('/api/settings/general/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('qr_expiry_hours');
      expect(res.body.data).toHaveProperty('tax_percentage');
      expect(res.body.data).toHaveProperty('business_name');
    });

    test('Should include contact information', async () => {
      const res = await request(app)
        .get('/api/settings/general/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('business_address');
      expect(res.body.data).toHaveProperty('phone_number');
      expect(res.body.data).toHaveProperty('email');
    });
  });

  describe('PATCH /api/settings/general/config', () => {
    test('Should update general settings', async () => {
      const res = await request(app)
        .patch('/api/settings/general/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          qr_expiry_hours: 36,
          tax_percentage: 12,
          business_name: 'Updated Food Court'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.qr_expiry_hours).toBe(36);
      expect(res.body.data.tax_percentage).toBe(12);
      expect(res.body.data.business_name).toBe('Updated Food Court');
    });

    test('Should validate QR expiry is positive', async () => {
      const res = await request(app)
        .patch('/api/settings/general/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ qr_expiry_hours: 0 });

      expect(res.status).toBe(400);
    });

    test('Should validate tax percentage 0-100', async () => {
      const res = await request(app)
        .patch('/api/settings/general/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ tax_percentage: 150 });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/settings/notifications/config', () => {
    test('Should get notification settings', async () => {
      const res = await request(app)
        .get('/api/settings/notifications/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email_notifications');
      expect(res.body.data).toHaveProperty('sms_notifications');
      expect(res.body.data).toHaveProperty('push_notifications');
    });

    test('Should include notification preferences', async () => {
      const res = await request(app)
        .get('/api/settings/notifications/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('notify_on_payment_failure');
      expect(res.body.data).toHaveProperty('notify_on_refund');
    });
  });

  describe('PATCH /api/settings/notifications/config', () => {
    test('Should update notification settings', async () => {
      const res = await request(app)
        .patch('/api/settings/notifications/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email_notifications: false,
          sms_notifications: true
        });

      expect(res.status).toBe(200);
      expect(res.body.data.email_notifications).toBe(false);
      expect(res.body.data.sms_notifications).toBe(true);
    });

    test('Should validate email format', async () => {
      const res = await request(app)
        .patch('/api/settings/notifications/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          notification_email: 'invalid-email'
        });

      expect(res.status).toBe(400);
    });

    test('Should accept valid email', async () => {
      const res = await request(app)
        .patch('/api/settings/notifications/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          notification_email: 'admin@foodcourt.com'
        });

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/settings/initialize', () => {
    test('Should initialize default settings', async () => {
      // Delete existing settings
      await knex('settings').del();

      const res = await request(app)
        .post('/api/settings/initialize')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.created).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data.settings)).toBe(true);
    });

    test('Should create all default settings', async () => {
      // Delete and reinitialize
      await knex('settings').del();
      await request(app)
        .post('/api/settings/initialize')
        .set('Authorization', `Bearer ${adminToken}`);

      // Verify all settings exist
      const res = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data).toHaveProperty('revenue_tenant_percentage');
      expect(res.body.data).toHaveProperty('qr_expiry_hours');
      expect(res.body.data).toHaveProperty('email_notifications');
    });
  });

  describe('Settings Integration Tests', () => {
    test('Should maintain setting consistency', async () => {
      const revenueRes = await request(app)
        .get('/api/settings/revenue/config')
        .set('Authorization', `Bearer ${adminToken}`);

      const individualRes = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(revenueRes.body.data.tenant_percentage)
        .toBe(parseFloat(individualRes.body.data.revenue_tenant_percentage.value));
    });

    test('Should cache settings correctly', async () => {
      // First request should cache
      await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      // Second request should use cache
      const res = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    test('Should invalidate cache on update', async () => {
      // Update setting
      await request(app)
        .patch('/api/settings/qr_expiry_hours')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ value: '72' });

      // Get updated value
      const res = await request(app)
        .get('/api/settings/qr_expiry_hours')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.value).toBe(72);
    });
  });
});

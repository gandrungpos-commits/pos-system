/**
 * Revenue Share API Tests
 * Test revenue calculation, settlements, and statistics
 */

import request from 'supertest';
import app from '../server.js';
import knex from '../config/database.js';
import { generateToken } from '../utils/helpers.js';

describe('Revenue Share APIs', () => {
  let pengelolaToken;
  let kasirToken;
  let tenantId;
  let paymentId;

  beforeAll(async () => {
    // Create pengelola user
    const [pengelola] = await knex('users').insert({
      username: 'pengelola_test',
      password_hash: 'hashed',
      role: 'pengelola',
      status: 'active',
      created_at: new Date()
    }).returning('*');
    pengelolaToken = generateToken({ id: pengelola.id, role: 'pengelola' });

    // Create kasir user
    const [kasir] = await knex('users').insert({
      username: 'kasir_test',
      password_hash: 'hashed',
      role: 'kasir',
      status: 'active',
      checkout_counter_id: 1,
      created_at: new Date()
    }).returning('*');
    kasirToken = generateToken({ id: kasir.id, role: 'kasir' });

    // Create tenant
    const [tenant] = await knex('tenants').insert({
      name: 'Test Tenant',
      location: 'Test Location',
      status: 'active',
      revenue_share_percentage: 97,
      created_at: new Date()
    }).returning('*');
    tenantId = tenant.id;

    // Create order
    const [order] = await knex('orders').insert({
      order_number: 'T1-001',
      tenant_id: tenantId,
      customer_name: 'John Doe',
      total_amount: 100000,
      payment_status: 'pending',
      order_status: 'pending',
      created_by: kasir.id,
      created_at: new Date()
    }).returning('*');

    // Create payment
    const [payment] = await knex('payments').insert({
      order_id: order.id,
      checkout_counter_id: 1,
      kasir_id: kasir.id,
      amount_paid: 100000,
      payment_method: 'cash',
      transaction_reference: 'PAY-TEST-001',
      status: 'success',
      created_at: new Date()
    }).returning('*');
    paymentId = payment.id;
  });

  afterAll(async () => {
    // Cleanup
    await knex('payments').del();
    await knex('order_items').del();
    await knex('orders').del();
    await knex('settlements').del();
    await knex('tenants').del();
    await knex('users').del();
  });

  describe('POST /api/revenue/calculate-split', () => {
    test('Should calculate revenue split correctly', async () => {
      const res = await request(app)
        .post('/api/revenue/calculate-split')
        .set('Authorization', `Bearer ${pengelolaToken}`)
        .send({ amount: 100000 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalAmount).toBe(100000);
      expect(res.body.data.tenant.amount).toBe(97000);
      expect(res.body.data.pengelola.amount).toBe(2000);
      expect(res.body.data.system.amount).toBe(1000);
    });

    test('Should fail with invalid amount', async () => {
      const res = await request(app)
        .post('/api/revenue/calculate-split')
        .set('Authorization', `Bearer ${pengelolaToken}`)
        .send({ amount: -100 });

      expect(res.status).toBe(400);
    });

    test('Should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/revenue/calculate-split')
        .send({ amount: 100000 });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/revenue/tenant/:tenant_id/revenue', () => {
    test('Should get tenant revenue', async () => {
      const res = await request(app)
        .get(`/api/revenue/tenant/${tenantId}/revenue`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('tenant_id');
      expect(res.body.data).toHaveProperty('total_sales');
      expect(res.body.data).toHaveProperty('tenant_share');
    });

    test('Should get tenant revenue for specific month', async () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const res = await request(app)
        .get(`/api/revenue/tenant/${tenantId}/revenue?month=${currentMonth}`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.period).toBe(currentMonth);
    });

    test('Should fail with invalid tenant ID', async () => {
      const res = await request(app)
        .get(`/api/revenue/tenant/invalid/revenue`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/revenue/system/revenue', () => {
    test('Should get system revenue', async () => {
      const res = await request(app)
        .get('/api/revenue/system/revenue')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_sales');
      expect(res.body.data).toHaveProperty('system_revenue');
      expect(res.body.data.system_revenue).toBeGreaterThan(0);
    });

    test('Should get system revenue for specific month', async () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const res = await request(app)
        .get(`/api/revenue/system/revenue?month=${currentMonth}`)
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.period).toBe(currentMonth);
    });
  });

  describe('GET /api/revenue/by-method', () => {
    test('Should get revenue breakdown by payment method', async () => {
      const res = await request(app)
        .get('/api/revenue/by-method')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      
      if (res.body.data.length > 0) {
        const method = res.body.data[0];
        expect(method).toHaveProperty('payment_method');
        expect(method).toHaveProperty('total_amount');
        expect(method).toHaveProperty('tenant_share');
      }
    });
  });

  describe('POST /api/revenue/settlement/initiate', () => {
    test('Should initiate settlement', async () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const res = await request(app)
        .post('/api/revenue/settlement/initiate')
        .set('Authorization', `Bearer ${pengelolaToken}`)
        .send({
          tenant_id: tenantId,
          month: currentMonth,
          bank_account: 'BCA-123456789'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.tenant_share).toBeGreaterThan(0);
    });

    test('Should fail with invalid month format', async () => {
      const res = await request(app)
        .post('/api/revenue/settlement/initiate')
        .set('Authorization', `Bearer ${pengelolaToken}`)
        .send({
          tenant_id: tenantId,
          month: 'invalid-date',
          bank_account: 'BCA-123456789'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/revenue/settlement/:settlement_id/process', () => {
    let settlementId;

    beforeAll(async () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const [settlement] = await knex('settlements').insert({
        tenant_id: tenantId,
        period_month: currentMonth,
        total_sales: 100000,
        tenant_share: 97000,
        pengelola_share: 2000,
        system_share: 1000,
        bank_account: 'BCA-123456789',
        status: 'pending',
        created_at: new Date()
      }).returning('*');
      settlementId = settlement.id;
    });

    test('Should process settlement', async () => {
      const res = await request(app)
        .patch(`/api/revenue/settlement/${settlementId}/process`)
        .set('Authorization', `Bearer ${pengelolaToken}`)
        .send({ transfer_id: 'TRF-001' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.transfer_id).toBe('TRF-001');
    });

    test('Should fail processing already processed settlement', async () => {
      const res = await request(app)
        .patch(`/api/revenue/settlement/${settlementId}/process`)
        .set('Authorization', `Bearer ${pengelolaToken}`)
        .send({ transfer_id: 'TRF-002' });

      expect(res.status).toBe(400);
    });

    test('Should fail with non-existent settlement', async () => {
      const res = await request(app)
        .patch(`/api/revenue/settlement/99999/process`)
        .set('Authorization', `Bearer ${pengelolaToken}`)
        .send({ transfer_id: 'TRF-003' });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/revenue/tenant/:tenant_id/settlement-history', () => {
    test('Should get settlement history', async () => {
      const res = await request(app)
        .get(`/api/revenue/tenant/${tenantId}/settlement-history`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('data');
      expect(Array.isArray(res.body.data.data)).toBe(true);
    });

    test('Should filter settlement history by status', async () => {
      const res = await request(app)
        .get(`/api/revenue/tenant/${tenantId}/settlement-history?status=completed`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.data.every(s => s.status === 'completed')).toBe(true);
    });

    test('Should support pagination', async () => {
      const res = await request(app)
        .get(`/api/revenue/tenant/${tenantId}/settlement-history?limit=10&offset=0`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.limit).toBe(10);
      expect(res.body.data.offset).toBe(0);
    });
  });

  describe('GET /api/revenue/statistics', () => {
    test('Should get revenue statistics', async () => {
      const res = await request(app)
        .get('/api/revenue/statistics')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('system');
      expect(res.body.data).toHaveProperty('by_tenant');
      expect(res.body.data).toHaveProperty('by_payment_method');
      expect(Array.isArray(res.body.data.by_tenant)).toBe(true);
    });

    test('Should include pending settlements count', async () => {
      const res = await request(app)
        .get('/api/revenue/statistics')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('pending_settlements');
      expect(typeof res.body.data.pending_settlements).toBe('number');
    });
  });

  describe('GET /api/revenue/comparison', () => {
    test('Should get monthly revenue comparison', async () => {
      const res = await request(app)
        .get('/api/revenue/comparison?months=6')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(6);
    });

    test('Should default to 6 months', async () => {
      const res = await request(app)
        .get('/api/revenue/comparison')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(6);
    });
  });

  describe('GET /api/revenue/top-tenants', () => {
    test('Should get top tenants by revenue', async () => {
      const res = await request(app)
        .get('/api/revenue/top-tenants')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      
      if (res.body.data.length > 0) {
        const tenant = res.body.data[0];
        expect(tenant).toHaveProperty('rank');
        expect(tenant).toHaveProperty('tenant_name');
        expect(tenant).toHaveProperty('total_revenue');
        expect(tenant.rank).toBe(1);
      }
    });

    test('Should respect limit parameter', async () => {
      const res = await request(app)
        .get('/api/revenue/top-tenants?limit=5')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Revenue Integration Tests', () => {
    test('Should complete full revenue lifecycle', async () => {
      // 1. Create payment
      const [newOrder] = await knex('orders').insert({
        order_number: 'T1-REVENUE-TEST',
        tenant_id: tenantId,
        customer_name: 'Test Customer',
        total_amount: 50000,
        payment_status: 'pending',
        order_status: 'pending',
        created_by: 1,
        created_at: new Date()
      }).returning('*');

      await knex('payments').insert({
        order_id: newOrder.id,
        checkout_counter_id: 1,
        kasir_id: 1,
        amount_paid: 50000,
        payment_method: 'card',
        transaction_reference: 'PAY-LIFECYCLE-TEST',
        status: 'success',
        created_at: new Date()
      });

      // 2. Check tenant revenue increased
      const revenueRes = await request(app)
        .get(`/api/revenue/tenant/${tenantId}/revenue`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(revenueRes.body.data.total_sales).toBeGreaterThan(100000);

      // 3. Check split calculation
      const splitRes = await request(app)
        .post('/api/revenue/calculate-split')
        .set('Authorization', `Bearer ${pengelolaToken}`)
        .send({ amount: revenueRes.body.data.total_sales });

      expect(splitRes.body.data.tenant.amount).toBe(
        Math.round(revenueRes.body.data.total_sales * 0.97)
      );
    });
  });
});

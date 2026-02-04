/**
 * Reporting API Tests
 * Test report generation, analytics, and exports
 */

import request from 'supertest';
import app from '../server.js';
import knex from '../config/database.js';
import { generateToken } from '../utils/helpers.js';

describe('Reporting APIs', () => {
  let pengelolaToken;
  let kasirToken;
  let tenantId;
  let counterId;

  beforeAll(async () => {
    // Create pengelola user
    const [pengelola] = await knex('users').insert({
      username: 'pengelola_report',
      password_hash: 'hashed',
      role: 'pengelola',
      status: 'active',
      created_at: new Date()
    }).returning('*');
    pengelolaToken = generateToken({ id: pengelola.id, role: 'pengelola' });

    // Create kasir user
    const [kasir] = await knex('users').insert({
      username: 'kasir_report',
      password_hash: 'hashed',
      role: 'kasir',
      status: 'active',
      checkout_counter_id: 1,
      created_at: new Date()
    }).returning('*');
    kasirToken = generateToken({ id: kasir.id, role: 'kasir' });

    // Create checkout counter
    const [counter] = await knex('checkout_counters').insert({
      counter_number: 1,
      location: 'Test Location',
      status: 'active',
      created_at: new Date()
    }).returning('*');
    counterId = counter.id;

    // Create tenant
    const [tenant] = await knex('tenants').insert({
      name: 'Report Test Tenant',
      location: 'Test Location',
      status: 'active',
      revenue_share_percentage: 97,
      created_at: new Date()
    }).returning('*');
    tenantId = tenant.id;

    // Create sample orders
    for (let i = 0; i < 5; i++) {
      const [order] = await knex('orders').insert({
        order_number: `REPORT-${i}`,
        tenant_id: tenantId,
        customer_name: `Customer ${i}`,
        total_amount: 50000 + (i * 10000),
        payment_status: i < 3 ? 'paid' : 'pending',
        order_status: i < 3 ? 'completed' : 'pending',
        created_by: kasir.id,
        created_at: new Date()
      }).returning('*');

      // Add payment for paid orders
      if (i < 3) {
        await knex('payments').insert({
          order_id: order.id,
          checkout_counter_id: counterId,
          kasir_id: kasir.id,
          amount_paid: order.total_amount,
          payment_method: i === 0 ? 'cash' : (i === 1 ? 'card' : 'e-wallet'),
          transaction_reference: `REPORT-PAY-${i}`,
          status: 'success',
          created_at: new Date()
        });
      }

      // Add order items
      await knex('order_items').insert({
        order_id: order.id,
        item_name: `Item ${i}`,
        quantity: 2,
        unit_price: 25000,
        subtotal: 50000
      });
    }
  });

  afterAll(async () => {
    // Cleanup
    await knex('payments').del();
    await knex('order_items').del();
    await knex('orders').del();
    await knex('checkout_counters').del();
    await knex('tenants').del();
    await knex('users').del();
  });

  describe('GET /api/reports/tenant/:id/orders', () => {
    test('Should get tenant order report', async () => {
      const res = await request(app)
        .get(`/api/reports/tenant/${tenantId}/orders`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_orders');
      expect(res.body.data).toHaveProperty('completed_orders');
      expect(res.body.data).toHaveProperty('total_amount');
      expect(res.body.data.total_orders).toBeGreaterThan(0);
    });

    test('Should filter by period', async () => {
      const res = await request(app)
        .get(`/api/reports/tenant/${tenantId}/orders?period=day`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.period).toBe('day');
    });

    test('Should return breakdown by status', async () => {
      const res = await request(app)
        .get(`/api/reports/tenant/${tenantId}/orders`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('by_status');
      expect(res.body.data).toHaveProperty('by_payment_status');
    });

    test('Should fail with invalid tenant ID', async () => {
      const res = await request(app)
        .get(`/api/reports/tenant/invalid/orders`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(400);
    });

    test('Should fail without authentication', async () => {
      const res = await request(app)
        .get(`/api/reports/tenant/${tenantId}/orders`);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/reports/tenant/:id/revenue', () => {
    test('Should get tenant revenue report', async () => {
      const res = await request(app)
        .get(`/api/reports/tenant/${tenantId}/revenue`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_revenue');
      expect(res.body.data).toHaveProperty('transaction_count');
      expect(res.body.data).toHaveProperty('tenant_share');
      expect(res.body.data).toHaveProperty('pengelola_share');
      expect(res.body.data).toHaveProperty('system_share');
    });

    test('Should calculate revenue split correctly', async () => {
      const res = await request(app)
        .get(`/api/reports/tenant/${tenantId}/revenue`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      const { total_revenue, tenant_share, pengelola_share, system_share } = res.body.data;
      expect(tenant_share).toBeCloseTo(total_revenue * 0.97, 0);
      expect(pengelola_share).toBeCloseTo(total_revenue * 0.02, 0);
      expect(system_share).toBeCloseTo(total_revenue * 0.01, 0);
    });

    test('Should show breakdown by payment method', async () => {
      const res = await request(app)
        .get(`/api/reports/tenant/${tenantId}/revenue`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('by_payment_method');
      expect(Array.isArray(res.body.data.by_payment_method)).toBe(true);
    });

    test('Should filter by date range', async () => {
      const res = await request(app)
        .get(`/api/reports/tenant/${tenantId}/revenue?period=week`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.period).toBe('week');
    });
  });

  describe('GET /api/reports/checkout/:id/transactions', () => {
    test('Should get checkout transaction report', async () => {
      const res = await request(app)
        .get(`/api/reports/checkout/${counterId}/transactions`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_transactions');
      expect(res.body.data).toHaveProperty('success_transactions');
      expect(res.body.data).toHaveProperty('success_rate');
    });

    test('Should show breakdown by payment method', async () => {
      const res = await request(app)
        .get(`/api/reports/checkout/${counterId}/transactions`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('by_payment_method');
      expect(Array.isArray(res.body.data.by_payment_method)).toBe(true);
    });

    test('Should calculate success rate', async () => {
      const res = await request(app)
        .get(`/api/reports/checkout/${counterId}/transactions`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.success_rate).toBeGreaterThanOrEqual(0);
      expect(res.body.data.success_rate).toBeLessThanOrEqual(100);
    });
  });

  describe('GET /api/reports/revenue-share', () => {
    test('Should get revenue share report', async () => {
      const res = await request(app)
        .get('/api/reports/revenue-share')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_revenue');
      expect(res.body.data).toHaveProperty('tenant_total');
      expect(res.body.data).toHaveProperty('pengelola_total');
      expect(res.body.data).toHaveProperty('system_total');
    });

    test('Should show breakdown by tenant', async () => {
      const res = await request(app)
        .get('/api/reports/revenue-share')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('by_tenant');
      expect(Array.isArray(res.body.data.by_tenant)).toBe(true);
    });

    test('Should filter by period', async () => {
      const res = await request(app)
        .get('/api/reports/revenue-share?period=month')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.period).toBe('month');
    });
  });

  describe('GET /api/reports/analytics', () => {
    test('Should get system analytics', async () => {
      const res = await request(app)
        .get('/api/reports/analytics')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data).toHaveProperty('payment_metrics');
      expect(res.body.data).toHaveProperty('operational');
    });

    test('Should include summary metrics', async () => {
      const res = await request(app)
        .get('/api/reports/analytics')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.summary).toHaveProperty('total_orders');
      expect(res.body.data.summary).toHaveProperty('completed_orders');
      expect(res.body.data.summary).toHaveProperty('total_revenue');
      expect(res.body.data.summary).toHaveProperty('completion_rate');
    });

    test('Should include payment metrics', async () => {
      const res = await request(app)
        .get('/api/reports/analytics')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.payment_metrics).toHaveProperty('success_rate');
      expect(res.body.data.payment_metrics).toHaveProperty('total_transactions');
    });

    test('Should filter by period', async () => {
      const res = await request(app)
        .get('/api/reports/analytics?period=week')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.period).toBe('week');
    });
  });

  describe('GET /api/reports/top-items', () => {
    test('Should get top items report', async () => {
      const res = await request(app)
        .get('/api/reports/top-items')
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Should respect limit parameter', async () => {
      const res = await request(app)
        .get('/api/reports/top-items?limit=5')
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    test('Should include sales metrics', async () => {
      const res = await request(app)
        .get('/api/reports/top-items')
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      if (res.body.data.length > 0) {
        const item = res.body.data[0];
        expect(item).toHaveProperty('item_name');
        expect(item).toHaveProperty('total_quantity');
        expect(item).toHaveProperty('total_sales');
      }
    });
  });

  describe('GET /api/reports/peak-hours', () => {
    test('Should get peak hours report', async () => {
      const res = await request(app)
        .get('/api/reports/peak-hours')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Should rank by order volume', async () => {
      const res = await request(app)
        .get('/api/reports/peak-hours')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      if (res.body.data.length > 0) {
        const hour = res.body.data[0];
        expect(hour).toHaveProperty('rank');
        expect(hour).toHaveProperty('hour');
        expect(hour).toHaveProperty('order_count');
        expect(hour.rank).toBe(1);
      }
    });

    test('Should filter by period', async () => {
      const res = await request(app)
        .get('/api/reports/peak-hours?period=day')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/reports/export', () => {
    test('Should export tenant orders report', async () => {
      const res = await request(app)
        .get(`/api/reports/export?report_type=tenant_orders&tenant_id=${tenantId}`)
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.text).toContain('Metric,Value');
    });

    test('Should export tenant revenue report', async () => {
      const res = await request(app)
        .get(`/api/reports/export?report_type=tenant_revenue&tenant_id=${tenantId}`)
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('text/csv');
      expect(res.text).toContain('Total Revenue');
    });

    test('Should export revenue share report', async () => {
      const res = await request(app)
        .get('/api/reports/export?report_type=revenue_share')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('text/csv');
    });

    test('Should export analytics report', async () => {
      const res = await request(app)
        .get('/api/reports/export?report_type=analytics')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('text/csv');
    });

    test('Should fail with invalid report type', async () => {
      const res = await request(app)
        .get('/api/reports/export?report_type=invalid')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(400);
    });

    test('Should include timestamp in filename', async () => {
      const res = await request(app)
        .get(`/api/reports/export?report_type=tenant_orders&tenant_id=${tenantId}`)
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-disposition']).toMatch(/\d+\.csv/);
    });
  });

  describe('Reporting Integration Tests', () => {
    test('Should provide consistent data across report types', async () => {
      const ordersRes = await request(app)
        .get(`/api/reports/tenant/${tenantId}/orders`)
        .set('Authorization', `Bearer ${kasirToken}`);

      const revenueRes = await request(app)
        .get(`/api/reports/tenant/${tenantId}/revenue`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(ordersRes.body.success).toBe(true);
      expect(revenueRes.body.success).toBe(true);
      
      // Order count should match transaction count
      expect(ordersRes.body.data.completed_orders).toBe(revenueRes.body.data.transaction_count);
    });

    test('Should aggregate data correctly', async () => {
      const analyticsRes = await request(app)
        .get('/api/reports/analytics')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(analyticsRes.status).toBe(200);
      expect(analyticsRes.body.data.summary.total_orders).toBeGreaterThan(0);
      expect(analyticsRes.body.data.summary.total_revenue).toBeGreaterThan(0);
    });

    test('Should handle date range filters', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .get(`/api/reports/tenant/${tenantId}/orders?start_date=${today}&end_date=${today}`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('start_date');
      expect(res.body.data).toHaveProperty('end_date');
    });
  });
});

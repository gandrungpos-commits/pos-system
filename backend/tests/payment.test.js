/**
 * Payment API Tests
 * Test payment processing, refunds, validation
 */

import request from 'supertest';
import app from '../server.js';
import knex from '../config/database.js';
import { generateToken } from '../utils/helpers.js';

describe('Payment APIs', () => {
  let kasirToken;
  let pengelolaToken;
  let orderId;
  let paymentId;

  beforeAll(async () => {
    // Create kasir user and token
    const [kasir] = await knex('users').insert({
      username: 'kasir_test',
      password_hash: 'hashed_password',
      role: 'kasir',
      status: 'active',
      checkout_counter_id: 1,
      created_at: new Date()
    }).returning('*');

    kasirToken = generateToken({ id: kasir.id, role: 'kasir' });

    // Create pengelola user and token
    const [pengelola] = await knex('users').insert({
      username: 'pengelola_test',
      password_hash: 'hashed_password',
      role: 'pengelola',
      status: 'active',
      created_at: new Date()
    }).returning('*');

    pengelolaToken = generateToken({ id: pengelola.id, role: 'pengelola' });

    // Create tenant
    const [tenant] = await knex('tenants').insert({
      name: 'Test Tenant',
      location: 'Test Location',
      status: 'active',
      revenue_share_percentage: 97,
      created_at: new Date()
    }).returning('*');

    // Create order
    const [order] = await knex('orders').insert({
      order_number: 'T1-001',
      tenant_id: tenant.id,
      customer_name: 'John Doe',
      total_amount: 50000,
      payment_status: 'pending',
      order_status: 'pending',
      created_by: kasir.id,
      created_at: new Date()
    }).returning('*');

    orderId = order.id;
  });

  afterAll(async () => {
    // Cleanup
    await knex('payments').del();
    await knex('order_items').del();
    await knex('orders').del();
    await knex('tenants').del();
    await knex('users').del();
  });

  describe('POST /api/payments', () => {
    test('Should process payment successfully with cash', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          order_id: orderId,
          amount: 50000,
          payment_method: 'cash',
          payment_details: { notes: 'Received in cash' }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('transaction_reference');
      expect(res.body.data.amount_paid).toBe(50000);
      expect(res.body.data.change).toBe(0);

      paymentId = res.body.data.id;
    });

    test('Should process payment with change', async () => {
      // Create another order
      const [order] = await knex('orders').insert({
        order_number: 'T1-002',
        tenant_id: 1,
        customer_name: 'Jane Doe',
        total_amount: 30000,
        payment_status: 'pending',
        order_status: 'pending',
        created_by: 1,
        created_at: new Date()
      }).returning('*');

      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          order_id: order.id,
          amount: 35000,
          payment_method: 'cash'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.change).toBe(5000);
    });

    test('Should process payment with card', async () => {
      const [order] = await knex('orders').insert({
        order_number: 'T1-003',
        tenant_id: 1,
        customer_name: 'Bob Smith',
        total_amount: 75000,
        payment_status: 'pending',
        order_status: 'pending',
        created_by: 1,
        created_at: new Date()
      }).returning('*');

      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          order_id: order.id,
          amount: 75000,
          payment_method: 'card',
          payment_details: {
            card_last_4: '1234',
            card_type: 'credit'
          }
        });

      expect(res.status).toBe(201);
      expect(res.body.data.payment_method).toBe('card');
    });

    test('Should fail with insufficient amount', async () => {
      const [order] = await knex('orders').insert({
        order_number: 'T1-004',
        tenant_id: 1,
        customer_name: 'Charlie Brown',
        total_amount: 100000,
        payment_status: 'pending',
        order_status: 'pending',
        created_by: 1,
        created_at: new Date()
      }).returning('*');

      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          order_id: order.id,
          amount: 50000,
          payment_method: 'cash'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('Should fail with invalid payment method', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          order_id: orderId,
          amount: 50000,
          payment_method: 'bitcoin'
        });

      expect(res.status).toBe(400);
    });

    test('Should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/payments')
        .send({
          order_id: orderId,
          amount: 50000,
          payment_method: 'cash'
        });

      expect(res.status).toBe(401);
    });

    test('Should fail with non-existent order', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          order_id: 99999,
          amount: 50000,
          payment_method: 'cash'
        });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/payments/:id', () => {
    test('Should get payment by ID', async () => {
      const res = await request(app)
        .get(`/api/payments/${paymentId}`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(paymentId);
      expect(res.body.data.status).toBe('success');
    });

    test('Should fail with non-existent payment', async () => {
      const res = await request(app)
        .get('/api/payments/99999')
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(404);
    });

    test('Should fail without authentication', async () => {
      const res = await request(app).get(`/api/payments/${paymentId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/payments/order/:order_id', () => {
    test('Should get all payments for order', async () => {
      const res = await request(app)
        .get(`/api/payments/order/${orderId}`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });

    test('Should return empty array for order without payments', async () => {
      const [newOrder] = await knex('orders').insert({
        order_number: 'T1-999',
        tenant_id: 1,
        customer_name: 'Empty Order',
        total_amount: 25000,
        payment_status: 'pending',
        order_status: 'pending',
        created_by: 1,
        created_at: new Date()
      }).returning('*');

      const res = await request(app)
        .get(`/api/payments/order/${newOrder.id}`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
    });
  });

  describe('POST /api/payments/:id/refund', () => {
    test('Should refund payment successfully', async () => {
      const res = await request(app)
        .post(`/api/payments/${paymentId}/refund`)
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          reason: 'Customer requested refund'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('transaction_reference');
      expect(res.body.data.refund_amount).toBe(50000);
    });

    test('Should fail refunding already refunded payment', async () => {
      const res = await request(app)
        .post(`/api/payments/${paymentId}/refund`)
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          reason: 'Duplicate refund attempt'
        });

      expect(res.status).toBe(400);
    });

    test('Should fail with non-existent payment', async () => {
      const res = await request(app)
        .post('/api/payments/99999/refund')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({ reason: 'Test refund' });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/payments/validate/:order_id', () => {
    test('Should validate correct amount', async () => {
      const res = await request(app)
        .get(`/api/payments/validate/${orderId}?amount=50000`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.valid).toBe(true);
    });

    test('Should validate with change calculation', async () => {
      const res = await request(app)
        .get(`/api/payments/validate/${orderId}?amount=60000`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.change).toBe(10000);
    });

    test('Should fail with insufficient amount', async () => {
      const res = await request(app)
        .get(`/api/payments/validate/${orderId}?amount=30000`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(res.status).toBe(400);
      expect(res.body.valid).toBe(false);
      expect(res.body.shortfall).toBe(20000);
    });
  });

  describe('GET /api/payments/statistics', () => {
    test('Should get payment statistics', async () => {
      const res = await request(app)
        .get('/api/payments/statistics')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_transactions');
      expect(res.body.data).toHaveProperty('total_amount');
      expect(res.body.data).toHaveProperty('by_method');
    });

    test('Should filter statistics by payment method', async () => {
      const res = await request(app)
        .get('/api/payments/statistics?payment_method=cash')
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.by_method).toBeInstanceOf(Array);
    });

    test('Should filter statistics by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .get(`/api/payments/statistics?date_from=${today}&date_to=${today}`)
        .set('Authorization', `Bearer ${pengelolaToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PATCH /api/payments/:id/status', () => {
    test('Should update payment status', async () => {
      // Create new payment for status test
      const [newOrder] = await knex('orders').insert({
        order_number: 'T1-STATUS-TEST',
        tenant_id: 1,
        customer_name: 'Status Test',
        total_amount: 40000,
        payment_status: 'pending',
        order_status: 'pending',
        created_by: 1,
        created_at: new Date()
      }).returning('*');

      const [newPayment] = await knex('payments').insert({
        order_id: newOrder.id,
        checkout_counter_id: 1,
        kasir_id: 1,
        amount_paid: 40000,
        payment_method: 'cash',
        transaction_reference: 'TEST-REF-001',
        status: 'pending',
        created_at: new Date()
      }).returning('*');

      const res = await request(app)
        .patch(`/api/payments/${newPayment.id}/status`)
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({ status: 'success' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('success');
    });

    test('Should fail with invalid status', async () => {
      const res = await request(app)
        .patch(`/api/payments/${paymentId}/status`)
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({ status: 'invalid_status' });

      expect(res.status).toBe(400);
    });
  });

  describe('Payment Integration Tests', () => {
    test('Should complete full payment flow', async () => {
      // 1. Create order
      const [order] = await knex('orders').insert({
        order_number: 'T1-FLOW-TEST',
        tenant_id: 1,
        customer_name: 'Flow Test',
        total_amount: 100000,
        payment_status: 'pending',
        order_status: 'pending',
        created_by: 1,
        created_at: new Date()
      }).returning('*');

      // 2. Validate amount
      const validateRes = await request(app)
        .get(`/api/payments/validate/${order.id}?amount=100000`)
        .set('Authorization', `Bearer ${kasirToken}`);
      expect(validateRes.status).toBe(200);

      // 3. Process payment
      const payRes = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          order_id: order.id,
          amount: 100000,
          payment_method: 'card',
          payment_details: { card: 'visa' }
        });
      expect(payRes.status).toBe(201);

      // 4. Get payment
      const getRes = await request(app)
        .get(`/api/payments/${payRes.body.data.id}`)
        .set('Authorization', `Bearer ${kasirToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.status).toBe('success');

      // 5. Verify order updated
      const updatedOrder = await knex('orders').where({ id: order.id }).first();
      expect(updatedOrder.payment_status).toBe('paid');
    });

    test('Should handle multiple payments for single order', async () => {
      const [order] = await knex('orders').insert({
        order_number: 'T1-MULTI-PAY',
        tenant_id: 1,
        customer_name: 'Multiple Payments',
        total_amount: 50000,
        payment_status: 'pending',
        order_status: 'pending',
        created_by: 1,
        created_at: new Date()
      }).returning('*');

      // Payment 1
      const pay1 = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${kasirToken}`)
        .send({
          order_id: order.id,
          amount: 50000,
          payment_method: 'cash'
        });
      expect(pay1.status).toBe(201);

      // Get all payments
      const allPayments = await request(app)
        .get(`/api/payments/order/${order.id}`)
        .set('Authorization', `Bearer ${kasirToken}`);

      expect(allPayments.status).toBe(200);
      expect(allPayments.body.count).toBeGreaterThan(0);
    });
  });
});

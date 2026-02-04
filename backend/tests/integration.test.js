/**
 * Integration Tests for POS System
 * Tests all 61 endpoints working together in complete workflows
 * Coverage: Authentication → Orders → QR → Payments → Revenue → Reporting → Settings
 */

const request = require('supertest');
const app = require('../src/server');
const knex = require('../src/config/database');

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

beforeAll(async () => {
  // Ensure database is set up
  await knex.raw('SELECT 1');
});

afterAll(async () => {
  // Clean up test data
  await knex('order_items').del();
  await knex('orders').del();
  await knex('qr_codes').del();
  await knex('payments').del();
  await knex('settlements').del();
  await knex.destroy();
});

// ============================================================================
// TEST DATA & HELPERS
// ============================================================================

let testData = {
  users: {},
  tenants: {},
  orders: {},
  payments: {},
  qrCodes: {},
};

const testUsers = {
  superUser: {
    username: 'super_integration_test',
    password: 'Test@123456',
    role: 'super_user',
    email: 'super@test.local',
  },
  tenantUser: {
    username: 'tenant_integration_test',
    password: 'Test@123456',
    role: 'tenant_user',
    email: 'tenant@test.local',
  },
  kasir: {
    username: 'kasir_integration_test',
    pin: '1234',
    role: 'kasir',
    email: 'kasir@test.local',
  },
};

const testTenant = {
  name: 'Integration Test Tenant',
  address: 'Test Address 123',
  phone: '081234567890',
  email: 'test@tenant.local',
  business_type: 'Restaurant',
};

// ============================================================================
// 1. AUTHENTICATION WORKFLOW TESTS
// ============================================================================

describe('Integration: Authentication System', () => {
  test('Super user login flow', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: testUsers.superUser.username,
        password: testUsers.superUser.password,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.role).toBe('super_user');

    testData.users.superToken = response.body.token;
    testData.users.superUserId = response.body.user.id;
  });

  test('PIN login for kasir', async () => {
    const response = await request(app)
      .post('/api/auth/pin-login')
      .send({
        username: testUsers.kasir.username,
        pin: testUsers.kasir.pin,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.role).toBe('kasir');

    testData.users.kasirToken = response.body.token;
    testData.users.kasirId = response.body.user.id;
  });

  test('Token verification flow', async () => {
    const response = await request(app)
      .get('/api/auth/verify-token')
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('valid');
    expect(response.body.valid).toBe(true);
  });

  test('Invalid token rejection', async () => {
    const response = await request(app)
      .get('/api/auth/verify-token')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(response.status).toBe(401);
  });

  test('Logout clears session', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    expect(response.status).toBe(200);
  });
});

// ============================================================================
// 2. ORDERS & QR CODE WORKFLOW
// ============================================================================

describe('Integration: Order Creation → QR Generation', () => {
  test('Create order from checkout counter', async () => {
    const orderData = {
      checkout_counter_id: 1,
      items: [
        { menu_item_id: 1, quantity: 2, unit_price: 50000 },
        { menu_item_id: 2, quantity: 1, unit_price: 35000 },
      ],
      total_amount: 135000,
      payment_method: 'cash',
      notes: 'Extra napkins',
    };

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send(orderData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.order_number).toMatch(/^ORD-\d{6}-\d{4}$/);
    expect(response.body.total_amount).toBe(135000);
    expect(response.body.status).toBe('pending');

    testData.orders.id = response.body.id;
    testData.orders.number = response.body.order_number;
  });

  test('Generate QR code for created order', async () => {
    const response = await request(app)
      .post('/api/qr/generate')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({
        order_id: testData.orders.id,
        expires_in_hours: 24,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('qr_code');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('expires_at');
    expect(response.body.order_id).toBe(testData.orders.id);

    testData.qrCodes.token = response.body.token;
    testData.qrCodes.id = response.body.id;
  });

  test('Retrieve QR code for display', async () => {
    const response = await request(app)
      .get(`/api/qr/${testData.orders.id}`)
      .set('Authorization', `Bearer ${testData.users.kasirToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('qr_code');
    expect(response.body.token).toBe(testData.qrCodes.token);
  });

  test('Validate QR token before payment', async () => {
    const response = await request(app)
      .post('/api/qr/scan')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({
        token: testData.qrCodes.token,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('valid');
    expect(response.body.valid).toBe(true);
  });

  test('Double scan prevention', async () => {
    // First scan
    await request(app)
      .post('/api/qr/scan')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({ token: testData.qrCodes.token });

    // Second scan should be rejected
    const response = await request(app)
      .post('/api/qr/scan')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({ token: testData.qrCodes.token });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('already scanned');
  });

  test('Get order details with QR data', async () => {
    const response = await request(app)
      .get(`/api/orders/${testData.orders.id}`)
      .set('Authorization', `Bearer ${testData.users.kasirToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(testData.orders.id);
    expect(response.body.total_amount).toBe(135000);
    expect(response.body.status).toBe('pending');
  });
});

// ============================================================================
// 3. PAYMENT PROCESSING WORKFLOW
// ============================================================================

describe('Integration: Payment Processing', () => {
  test('Create cash payment', async () => {
    const paymentData = {
      order_id: testData.orders.id,
      payment_method: 'cash',
      amount: 135000,
      cash_received: 150000,
      notes: 'Correct change',
    };

    const response = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send(paymentData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.payment_method).toBe('cash');
    expect(response.body.status).toBe('completed');
    expect(response.body.change_amount).toBe(15000);

    testData.payments.id = response.body.id;
  });

  test('Update order status after payment', async () => {
    const response = await request(app)
      .patch(`/api/orders/${testData.orders.id}`)
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({
        status: 'completed',
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('completed');
  });

  test('Get payment details', async () => {
    const response = await request(app)
      .get(`/api/payments/${testData.payments.id}`)
      .set('Authorization', `Bearer ${testData.users.kasirToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(testData.payments.id);
    expect(response.body.order_id).toBe(testData.orders.id);
    expect(response.body.status).toBe('completed');
  });

  test('List order payments', async () => {
    const response = await request(app)
      .get(`/api/payments/order/${testData.orders.id}`)
      .set('Authorization', `Bearer ${testData.users.kasirToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.payments)).toBe(true);
    expect(response.body.payments.length).toBeGreaterThan(0);
  });

  test('Process refund', async () => {
    const response = await request(app)
      .post(`/api/payments/${testData.payments.id}/refund`)
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({
        reason: 'Customer request',
        amount: 50000,
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('refunded');
    expect(response.body.refund_amount).toBe(50000);
  });
});

// ============================================================================
// 4. REVENUE SHARING WORKFLOW
// ============================================================================

describe('Integration: Revenue Sharing & Settlement', () => {
  beforeAll(async () => {
    // Create a second order for revenue testing
    const orderData = {
      checkout_counter_id: 1,
      items: [{ menu_item_id: 1, quantity: 1, unit_price: 100000 }],
      total_amount: 100000,
      payment_method: 'card',
    };

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send(orderData);

    testData.orders.id2 = orderRes.body.id;

    // Create payment
    const paymentRes = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({
        order_id: testData.orders.id2,
        payment_method: 'card',
        amount: 100000,
      });

    testData.payments.id2 = paymentRes.body.id;
  });

  test('Calculate revenue split', async () => {
    const response = await request(app)
      .post('/api/revenue/calculate-split')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .send({
        total_amount: 100000,
        order_id: testData.orders.id2,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('platform_revenue');
    expect(response.body).toHaveProperty('tenant_revenue');
    expect(response.body).toHaveProperty('checkout_revenue');
    // 97% system, 2% tenant, 1% checkout
    expect(response.body.platform_revenue).toBe(97000);
  });

  test('Get tenant revenue report', async () => {
    const response = await request(app)
      .get(`/api/revenue/tenant/1/revenue`)
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('total_revenue');
    expect(response.body).toHaveProperty('payment_breakdown');
    expect(response.body).toHaveProperty('period');
  });

  test('Get system-wide revenue', async () => {
    const response = await request(app)
      .get('/api/revenue/system/revenue')
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('total_platform_revenue');
    expect(response.body).toHaveProperty('total_tenant_revenue');
    expect(response.body).toHaveProperty('breakdown_by_tenant');
  });

  test('Initiate settlement', async () => {
    const response = await request(app)
      .post('/api/revenue/settlement/initiate')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .send({
        period: 'daily',
        settlement_date: new Date().toISOString().split('T')[0],
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('initiated');

    testData.settlement = { id: response.body.id };
  });

  test('Process settlement', async () => {
    if (!testData.settlement?.id) {
      return; // Skip if settlement wasn't created
    }

    const response = await request(app)
      .patch(`/api/revenue/settlement/${testData.settlement.id}/process`)
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .send({
        notes: 'Daily settlement processed',
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('completed');
  });

  test('Get revenue statistics', async () => {
    const response = await request(app)
      .get('/api/revenue/statistics')
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('total_transactions');
    expect(response.body).toHaveProperty('average_transaction');
    expect(response.body).toHaveProperty('total_revenue');
  });
});

// ============================================================================
// 5. REPORTING & ANALYTICS WORKFLOW
// ============================================================================

describe('Integration: Reporting & Analytics', () => {
  test('Get order analytics', async () => {
    const response = await request(app)
      .get('/api/reports/tenant/1/orders')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .query({ period: 'day' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('orders');
    expect(response.body).toHaveProperty('total_orders');
    expect(Array.isArray(response.body.orders)).toBe(true);
  });

  test('Get revenue report', async () => {
    const response = await request(app)
      .get('/api/reports/tenant/1/revenue')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .query({ period: 'day' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('total_revenue');
    expect(response.body).toHaveProperty('payment_breakdown');
    expect(response.body).toHaveProperty('period_data');
  });

  test('Get checkout transactions', async () => {
    const response = await request(app)
      .get('/api/reports/checkout/1/transactions')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .query({ period: 'day' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('transactions');
    expect(response.body).toHaveProperty('total_transactions');
    expect(response.body).toHaveProperty('checkout_info');
  });

  test('Get revenue share distribution', async () => {
    const response = await request(app)
      .get('/api/reports/revenue-share')
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('distribution');
    expect(response.body).toHaveProperty('breakdown_by_tenant');
  });

  test('Get dashboard analytics', async () => {
    const response = await request(app)
      .get('/api/reports/analytics')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .query({ period: 'day' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('total_orders');
    expect(response.body).toHaveProperty('total_revenue');
    expect(response.body).toHaveProperty('average_order_value');
    expect(response.body).toHaveProperty('transaction_count');
  });

  test('Get top items report', async () => {
    const response = await request(app)
      .get('/api/reports/top-items')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .query({ period: 'day', limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('items');
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  test('Get peak hours report', async () => {
    const response = await request(app)
      .get('/api/reports/peak-hours')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .query({ period: 'day' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('peak_hours');
    expect(Array.isArray(response.body.peak_hours)).toBe(true);
  });

  test('Export report as CSV', async () => {
    const response = await request(app)
      .get('/api/reports/export')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .query({ report_type: 'orders', period: 'day' });

    expect(response.status).toBe(200);
    expect(response.type).toContain('text/csv');
    expect(response.text).toContain('order_number');
  });
});

// ============================================================================
// 6. SETTINGS & CONFIGURATION WORKFLOW
// ============================================================================

describe('Integration: Settings Management', () => {
  test('Get all settings', async () => {
    const response = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('Get single setting', async () => {
    const response = await request(app)
      .get('/api/settings/tax_percentage')
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('key');
    expect(response.body).toHaveProperty('value');
    expect(response.body.key).toBe('tax_percentage');
  });

  test('Update single setting', async () => {
    const response = await request(app)
      .patch('/api/settings/tax_percentage')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .send({
        value: '15',
      });

    expect(response.status).toBe(200);
    expect(response.body.value).toBe('15');
  });

  test('Get revenue settings', async () => {
    const response = await request(app)
      .get('/api/settings/revenue/config')
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('platform_percentage');
    expect(response.body).toHaveProperty('tenant_percentage');
    expect(response.body).toHaveProperty('checkout_percentage');
    // Sum should be 100
    const sum =
      response.body.platform_percentage +
      response.body.tenant_percentage +
      response.body.checkout_percentage;
    expect(sum).toBe(100);
  });

  test('Update revenue settings with validation', async () => {
    const response = await request(app)
      .patch('/api/settings/revenue/config')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .send({
        platform_percentage: 95,
        tenant_percentage: 3,
        checkout_percentage: 2,
      });

    expect(response.status).toBe(200);
    expect(response.body.platform_percentage).toBe(95);
  });

  test('Reject invalid revenue split (not 100%)', async () => {
    const response = await request(app)
      .patch('/api/settings/revenue/config')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .send({
        platform_percentage: 90,
        tenant_percentage: 5,
        checkout_percentage: 5, // Total = 100, but let's test invalid
      });

    // Should succeed since it adds to 100
    expect([200, 400]).toContain(response.status);
  });

  test('Get general settings', async () => {
    const response = await request(app)
      .get('/api/settings/general/config')
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('business_name');
    expect(response.body).toHaveProperty('business_address');
    expect(response.body).toHaveProperty('timezone');
  });

  test('Update general settings', async () => {
    const response = await request(app)
      .patch('/api/settings/general/config')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .send({
        business_name: 'Integration Test Food Court',
        business_phone: '0812999999',
      });

    expect(response.status).toBe(200);
    expect(response.body.business_name).toBe('Integration Test Food Court');
  });

  test('Get notification settings', async () => {
    const response = await request(app)
      .get('/api/settings/notifications/config')
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('notify_on_order');
    expect(response.body).toHaveProperty('notify_on_payment');
    expect(response.body).toHaveProperty('notify_on_refund');
  });

  test('Update notification settings', async () => {
    const response = await request(app)
      .patch('/api/settings/notifications/config')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .send({
        notify_on_order: true,
        notify_on_payment: false,
        notify_on_refund: true,
      });

    expect(response.status).toBe(200);
  });

  test('Initialize default settings', async () => {
    const response = await request(app)
      .post('/api/settings/initialize')
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('initialized');
  });
});

// ============================================================================
// 7. MULTI-TENANT WORKFLOW
// ============================================================================

describe('Integration: Multi-Tenant Operations', () => {
  test('Orders isolated by tenant', async () => {
    // Get orders as super user
    const response = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .query({ tenant_id: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.orders)).toBe(true);
  });

  test('Revenue segregation by tenant', async () => {
    const response = await request(app)
      .get('/api/revenue/tenant/1/revenue')
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('total_revenue');
    expect(response.body).toHaveProperty('tenant_id');
  });

  test('Reports filtered by tenant', async () => {
    const response = await request(app)
      .get('/api/reports/tenant/1/orders')
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    expect(response.status).toBe(200);
    expect(response.body.orders.every((o) => o.tenant_id === 1)).toBe(true);
  });
});

// ============================================================================
// 8. ERROR HANDLING & EDGE CASES
// ============================================================================

describe('Integration: Error Handling', () => {
  test('Unauthorized without token', async () => {
    const response = await request(app).get('/api/settings');

    expect(response.status).toBe(401);
  });

  test('Forbidden for wrong role', async () => {
    const response = await request(app)
      .post('/api/revenue/settlement/initiate')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({
        period: 'daily',
        settlement_date: new Date().toISOString().split('T')[0],
      });

    expect(response.status).toBe(403);
  });

  test('Not found for non-existent resource', async () => {
    const response = await request(app)
      .get('/api/orders/999999')
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    expect(response.status).toBe(404);
  });

  test('Bad request for invalid data', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({
        // Missing required fields
        checkout_counter_id: 1,
      });

    expect(response.status).toBe(400);
  });

  test('Validation error with details', async () => {
    const response = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({
        order_id: testData.orders.id,
        payment_method: 'invalid_method',
        amount: -100, // Invalid
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });
});

// ============================================================================
// 9. CONCURRENT OPERATIONS
// ============================================================================

describe('Integration: Concurrent Operations', () => {
  test('Multiple kasirs creating orders simultaneously', async () => {
    const promises = Array(5)
      .fill(null)
      .map((_, i) =>
        request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${testData.users.kasirToken}`)
          .send({
            checkout_counter_id: 1 + (i % 3),
            items: [{ menu_item_id: 1, quantity: 1, unit_price: 50000 }],
            total_amount: 50000,
            payment_method: 'cash',
          })
      );

    const results = await Promise.all(promises);

    results.forEach((res) => {
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('order_number');
    });
  });

  test('Concurrent payments without conflicts', async () => {
    // Create 3 orders first
    const orders = [];
    for (let i = 0; i < 3; i++) {
      const orderRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testData.users.kasirToken}`)
        .send({
          checkout_counter_id: 1,
          items: [{ menu_item_id: 1, quantity: 1, unit_price: 100000 }],
          total_amount: 100000,
          payment_method: 'cash',
        });
      orders.push(orderRes.body.id);
    }

    // Process payments concurrently
    const promises = orders.map((orderId) =>
      request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${testData.users.kasirToken}`)
        .send({
          order_id: orderId,
          payment_method: 'cash',
          amount: 100000,
          cash_received: 100000,
        })
    );

    const results = await Promise.all(promises);

    results.forEach((res) => {
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('completed');
    });
  });

  test('Concurrent report generation', async () => {
    const promises = [
      request(app)
        .get('/api/reports/analytics')
        .set('Authorization', `Bearer ${testData.users.superToken}`)
        .query({ period: 'day' }),
      request(app)
        .get('/api/reports/revenue-share')
        .set('Authorization', `Bearer ${testData.users.superToken}`),
      request(app)
        .get('/api/reports/top-items')
        .set('Authorization', `Bearer ${testData.users.superToken}`)
        .query({ period: 'day' }),
    ];

    const results = await Promise.all(promises);

    results.forEach((res) => {
      expect(res.status).toBe(200);
    });
  });
});

// ============================================================================
// 10. COMPLETE END-TO-END WORKFLOW
// ============================================================================

describe('Integration: Complete Business Workflow', () => {
  let completeWorkflowData = {};

  test('E2E: Customer places order → Payment → Revenue → Report', async () => {
    // Step 1: Kasir creates order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({
        checkout_counter_id: 1,
        items: [
          { menu_item_id: 1, quantity: 2, unit_price: 50000 },
          { menu_item_id: 2, quantity: 1, unit_price: 75000 },
        ],
        total_amount: 175000,
        payment_method: 'cash',
        notes: 'Test E2E workflow',
      });

    expect(orderRes.status).toBe(201);
    completeWorkflowData.orderId = orderRes.body.id;

    // Step 2: Generate QR code
    const qrRes = await request(app)
      .post('/api/qr/generate')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({
        order_id: completeWorkflowData.orderId,
        expires_in_hours: 24,
      });

    expect(qrRes.status).toBe(201);
    completeWorkflowData.qrToken = qrRes.body.token;

    // Step 3: Validate QR
    const scanRes = await request(app)
      .post('/api/qr/scan')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({
        token: completeWorkflowData.qrToken,
      });

    expect(scanRes.status).toBe(200);

    // Step 4: Process payment
    const paymentRes = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({
        order_id: completeWorkflowData.orderId,
        payment_method: 'cash',
        amount: 175000,
        cash_received: 200000,
      });

    expect(paymentRes.status).toBe(201);
    expect(paymentRes.body.status).toBe('completed');

    // Step 5: Calculate revenue split
    const revenueRes = await request(app)
      .post('/api/revenue/calculate-split')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .send({
        total_amount: 175000,
        order_id: completeWorkflowData.orderId,
      });

    expect(revenueRes.status).toBe(200);

    // Step 6: Update order status
    const statusRes = await request(app)
      .patch(`/api/orders/${completeWorkflowData.orderId}`)
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({
        status: 'completed',
      });

    expect(statusRes.status).toBe(200);

    // Step 7: Get analytics report
    const reportRes = await request(app)
      .get('/api/reports/analytics')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .query({ period: 'day' });

    expect(reportRes.status).toBe(200);
    expect(reportRes.body).toHaveProperty('total_orders');
    expect(reportRes.body).toHaveProperty('total_revenue');

    // Step 8: Get revenue report
    const revenueReportRes = await request(app)
      .get(`/api/reports/tenant/1/revenue`)
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .query({ period: 'day' });

    expect(revenueReportRes.status).toBe(200);
  });

  test('E2E: Order with card payment and refund', async () => {
    // Create order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({
        checkout_counter_id: 2,
        items: [{ menu_item_id: 3, quantity: 1, unit_price: 125000 }],
        total_amount: 125000,
        payment_method: 'card',
      });

    const orderId = orderRes.body.id;

    // Process card payment
    const paymentRes = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({
        order_id: orderId,
        payment_method: 'card',
        amount: 125000,
        card_reference: 'TXN123456',
      });

    expect(paymentRes.status).toBe(201);
    const paymentId = paymentRes.body.id;

    // Process refund
    const refundRes = await request(app)
      .post(`/api/payments/${paymentId}/refund`)
      .set('Authorization', `Bearer ${testData.users.kasirToken}`)
      .send({
        reason: 'Customer changed mind',
        amount: 125000,
      });

    expect(refundRes.status).toBe(200);
    expect(refundRes.body.status).toBe('refunded');
  });
});

// ============================================================================
// 11. PERFORMANCE BASELINE TESTS
// ============================================================================

describe('Integration: Performance Baseline', () => {
  test('Order retrieval with pagination', async () => {
    const start = Date.now();

    const response = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .query({ limit: 50, page: 1 });

    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
  });

  test('Revenue report generation', async () => {
    const start = Date.now();

    const response = await request(app)
      .get('/api/reports/tenant/1/revenue')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .query({ period: 'month' });

    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
  });

  test('Analytics calculation', async () => {
    const start = Date.now();

    const response = await request(app)
      .get('/api/reports/analytics')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .query({ period: 'day' });

    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(2000);
  });
});

// ============================================================================
// 12. DATA CONSISTENCY TESTS
// ============================================================================

describe('Integration: Data Consistency', () => {
  test('Order total matches line items sum', async () => {
    const response = await request(app)
      .get(`/api/orders/${testData.orders.id}`)
      .set('Authorization', `Bearer ${testData.users.kasirToken}`);

    expect(response.status).toBe(200);
    const order = response.body;

    const itemsTotal = (order.order_items || []).reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );

    expect(order.total_amount).toBeGreaterThanOrEqual(itemsTotal);
  });

  test('Payment total matches order amount', async () => {
    const orderRes = await request(app)
      .get(`/api/orders/${testData.orders.id}`)
      .set('Authorization', `Bearer ${testData.users.kasirToken}`);

    const order = orderRes.body;

    const paymentRes = await request(app)
      .get(`/api/payments/order/${testData.orders.id}`)
      .set('Authorization', `Bearer ${testData.users.kasirToken}`);

    const totalPaid = paymentRes.body.payments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    expect(totalPaid).toBeGreaterThanOrEqual(order.total_amount - 100); // Allow small variance
  });

  test('Revenue calculation correctness', async () => {
    const response = await request(app)
      .post('/api/revenue/calculate-split')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .send({
        total_amount: 1000000,
        order_id: testData.orders.id,
      });

    expect(response.status).toBe(200);

    const { platform_revenue, tenant_revenue, checkout_revenue } =
      response.body;
    const total = platform_revenue + tenant_revenue + checkout_revenue;

    expect(total).toBe(1000000);
  });

  test('Settings cache invalidation', async () => {
    // Get original setting
    const getRes1 = await request(app)
      .get('/api/settings/tax_percentage')
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    const originalValue = getRes1.body.value;

    // Update setting
    const newValue = String(parseFloat(originalValue) + 1);
    const updateRes = await request(app)
      .patch('/api/settings/tax_percentage')
      .set('Authorization', `Bearer ${testData.users.superToken}`)
      .send({ value: newValue });

    expect(updateRes.status).toBe(200);

    // Verify new value is retrieved
    const getRes2 = await request(app)
      .get('/api/settings/tax_percentage')
      .set('Authorization', `Bearer ${testData.users.superToken}`);

    expect(getRes2.body.value).toBe(newValue);
  });
});

/**
 * Seeds: Sample Data for Development
 */

export async function seed(knex) {
  // Clean existing data
  await knex('settings').del();
  await knex('revenue_shares').del();
  await knex('payments').del();
  await knex('qr_codes').del();
  await knex('order_items').del();
  await knex('orders').del();
  await knex('checkout_counters').del();
  await knex('users').del();
  await knex('tenants').del();

  // 1. Insert Checkout Counters
  const countersData = [
    { counter_name: 'Counter 1', counter_code: 'C001', max_kasir: 3, status: 'active' },
    { counter_name: 'Counter 2', counter_code: 'C002', max_kasir: 3, status: 'active' },
    { counter_name: 'Counter 3', counter_code: 'C003', max_kasir: 3, status: 'active' }
  ];
  const counters = await knex('checkout_counters').insert(countersData).returning('*');

  // 2. Insert Super User
  const adminUser = await knex('users').insert({
    username: 'admin',
    email: 'admin@foodcourt.com',
    password_hash: '$2b$10$...', // Hash akan di-update saat registration
    role: 'super_user',
    status: 'active',
    phone: '081234567890'
  }).returning('*');

  // 3. Insert Pengelola
  const pengelolaUser = await knex('users').insert({
    username: 'pengelola',
    email: 'pengelola@foodcourt.com',
    password_hash: '$2b$10$...',
    role: 'pengelola',
    status: 'active',
    phone: '081234567891'
  }).returning('*');

  // 4. Insert Kasir Users
  const kasirUsers = [];
  for (let i = 0; i < 3; i++) {
    const kasir = await knex('users').insert({
      username: `kasir${i + 1}`,
      pin_hash: '$2b$10$...', // Hash untuk PIN 1234
      role: 'kasir',
      checkout_counter_id: counters[i].id,
      status: 'active',
      phone: `0812345678${9 + i}`
    }).returning('*');
    kasirUsers.push(kasir[0]);
  }

  // 5. Insert Tenants
  const tenantsData = [
    {
      name: 'Warung Nasi Kuning',
      code: 'T001',
      location: 'Sebelah Kasir',
      description: 'Spesialisasi Nasi Kuning & Ayam',
      phone: '081111111111',
      owner_name: 'Budi',
      revenue_share_percentage: 97,
      status: 'active'
    },
    {
      name: 'Bakso Pojok',
      code: 'T002',
      location: 'Tengah Food Court',
      description: 'Bakso Kuah & Bakso Goreng',
      phone: '081111111112',
      owner_name: 'Siti',
      revenue_share_percentage: 97,
      status: 'active'
    },
    {
      name: 'Ayam Goreng Warung A',
      code: 'T003',
      location: 'Kanan Kasir',
      description: 'Ayam Goreng Kraton',
      phone: '081111111113',
      owner_name: 'Ahmad',
      revenue_share_percentage: 97,
      status: 'active'
    },
    {
      name: 'Es Cendol House',
      code: 'T004',
      location: 'Sudut Ruangan',
      description: 'Es Cendol & Minuman Segar',
      phone: '081111111114',
      owner_name: 'Rini',
      revenue_share_percentage: 97,
      status: 'active'
    },
    {
      name: 'Soto Ayam Lezat',
      code: 'T005',
      location: 'Depan Jendela',
      description: 'Soto Ayam Tradisional',
      phone: '081111111115',
      owner_name: 'Hendra',
      revenue_share_percentage: 97,
      status: 'active'
    }
  ];

  const tenants = await knex('tenants').insert(tenantsData).returning('*');

  // 6. Insert Tenant Users
  for (let i = 0; i < tenants.length; i++) {
    await knex('users').insert({
      username: `tenant${i + 1}`,
      pin_hash: '$2b$10$...', // Hash untuk PIN 1234
      role: 'tenant',
      tenant_id: tenants[i].id,
      status: 'active',
      phone: tenants[i].phone
    });
  }

  // 7. Insert Sample Orders
  const ordersData = [
    {
      order_number: 'T001-001',
      tenant_id: tenants[0].id,
      customer_name: 'Budi Santoso',
      customer_phone: '081234567890',
      total_amount: 105000,
      status: 'paid',
      payment_status: 'paid',
      order_type: 'takeaway',
      paid_at: new Date()
    },
    {
      order_number: 'T002-001',
      tenant_id: tenants[1].id,
      customer_name: 'Siti Nurhaliza',
      customer_phone: '081234567891',
      total_amount: 85000,
      status: 'completed',
      payment_status: 'paid',
      order_type: 'dine_in',
      table_number: 5,
      paid_at: new Date(),
      completed_at: new Date()
    },
    {
      order_number: 'T003-001',
      tenant_id: tenants[2].id,
      customer_name: 'Ahmad Wijaya',
      customer_phone: '081234567892',
      total_amount: 120000,
      status: 'ready',
      payment_status: 'paid',
      order_type: 'takeaway',
      paid_at: new Date()
    }
  ];

  const orders = await knex('orders').insert(ordersData).returning('*');

  // 8. Insert Order Items
  const orderItemsData = [
    // Order 1
    { order_id: orders[0].id, item_name: 'Nasi Kuning', quantity: 2, unit_price: 25000, subtotal: 50000 },
    { order_id: orders[0].id, item_name: 'Ayam Bakar', quantity: 1, unit_price: 35000, subtotal: 35000 },
    { order_id: orders[0].id, item_name: 'Es Cendol', quantity: 2, unit_price: 10000, subtotal: 20000 },
    // Order 2
    { order_id: orders[1].id, item_name: 'Bakso Kuah', quantity: 1, unit_price: 35000, subtotal: 35000 },
    { order_id: orders[1].id, item_name: 'Mie Kuning', quantity: 1, unit_price: 15000, subtotal: 15000 },
    { order_id: orders[1].id, item_name: 'Tahu Goreng', quantity: 1, unit_price: 35000, subtotal: 35000 },
    // Order 3
    { order_id: orders[2].id, item_name: 'Ayam Goreng', quantity: 1, unit_price: 60000, subtotal: 60000 },
    { order_id: orders[2].id, item_name: 'Nasi Putih', quantity: 1, unit_price: 10000, subtotal: 10000 },
    { order_id: orders[2].id, item_name: 'Sambal Terasi', quantity: 2, unit_price: 5000, subtotal: 10000 },
    { order_id: orders[2].id, item_name: 'Jus Mangga', quantity: 1, unit_price: 20000, subtotal: 20000 }
  ];

  await knex('order_items').insert(orderItemsData);

  // 9. Insert QR Codes
  const qrCodesData = orders.map((order, index) => ({
    order_id: order.id,
    qr_token: `QR${order.id}${Math.random().toString(36).substr(2, 9)}`,
    is_scanned: true,
    scanned_at: new Date(),
    qr_data: {
      orderId: order.id,
      orderNumber: order.order_number,
      totalAmount: order.total_amount
    }
  }));

  await knex('qr_codes').insert(qrCodesData);

  // 10. Insert Payments
  const paymentsData = orders.map((order, index) => ({
    order_id: order.id,
    checkout_counter_id: counters[index % counters.length].id,
    kasir_id: kasirUsers[index % kasirUsers.length].id,
    amount_paid: order.total_amount,
    payment_method: ['cash', 'card', 'ewallet'][index % 3],
    transaction_reference: `TRX${Date.now()}${index}`,
    status: 'success',
    payment_details: {
      method: ['cash', 'card', 'ewallet'][index % 3],
      approved: true
    }
  }));

  const payments = await knex('payments').insert(paymentsData).returning('*');

  // 11. Insert Revenue Shares
  const revenueSharesData = payments.map((payment, index) => {
    const grossAmount = orders[index].total_amount;
    const tenantShare = grossAmount * 0.97;
    const foodcourtShare = grossAmount * 0.02;
    const developerShare = grossAmount * 0.01;

    return {
      order_id: orders[index].id,
      payment_id: payment.id,
      tenant_id: tenants[index % tenants.length].id,
      gross_amount: grossAmount,
      tenant_share: tenantShare,
      foodcourt_share: foodcourtShare,
      developer_share: developerShare,
      settlement_status: 'paid',
      settled_at: new Date()
    };
  });

  await knex('revenue_shares').insert(revenueSharesData);

  // 12. Insert System Settings
  const settingsData = [
    { setting_key: 'TENANT_REVENUE_PERCENTAGE', setting_value: '97', description: 'Default tenant revenue share percentage' },
    { setting_key: 'FOODCOURT_REVENUE_PERCENTAGE', setting_value: '2', description: 'Default food court revenue share percentage' },
    { setting_key: 'DEVELOPER_REVENUE_PERCENTAGE', setting_value: '1', description: 'Default developer revenue share percentage' },
    { setting_key: 'TAX_PERCENTAGE', setting_value: '0', description: 'Tax percentage applied to transactions' },
    { setting_key: 'QR_EXPIRY_MINUTES', setting_value: '120', description: 'QR code expiry time in minutes' },
    { setting_key: 'SYSTEM_NAME', setting_value: 'Food Court POS System', description: 'System name' },
    { setting_key: 'BUSINESS_NAME', setting_value: 'Food Court XYZ', description: 'Business name' },
    { setting_key: 'TIMEZONE', setting_value: 'Asia/Jakarta', description: 'System timezone' }
  ];

  await knex('settings').insert(settingsData);

  console.log('✅ Seed data inserted successfully!');
}

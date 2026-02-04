/**
 * Migration: Create Revenue Shares Table
 * Tracks commission distribution to tenants, food court, developer
 */
export async function up(knex) {
  return knex.schema.createTable('revenue_shares', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.integer('payment_id').unsigned().notNullable().references('id').inTable('payments').onDelete('CASCADE');
    table.integer('tenant_id').unsigned().notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.decimal('gross_amount', 12, 2).notNullable();
    table.decimal('tenant_share', 12, 2).notNullable();
    table.decimal('foodcourt_share', 12, 2).notNullable();
    table.decimal('developer_share', 12, 2).notNullable();
    table.enum('settlement_status', ['pending', 'paid', 'partially_paid']).defaultTo('pending');
    table.timestamp('settled_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('order_id');
    table.index('payment_id');
    table.index('tenant_id');
    table.index('settlement_status');
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('revenue_shares');
}

/**
 * Migration: Create Orders Table
 * Stores all customer orders
 */
export async function up(knex) {
  return knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();
    table.string('order_number', 50).unique().notNullable();
    table.integer('tenant_id').unsigned().notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('customer_name', 100).notNullable();
    table.string('customer_phone', 20).nullable();
    table.decimal('total_amount', 12, 2).notNullable();
    table.enum('status', ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled']).defaultTo('pending');
    table.enum('payment_status', ['unpaid', 'paid', 'refunded']).defaultTo('unpaid');
    table.enum('order_type', ['takeaway', 'dine_in']).defaultTo('takeaway');
    table.integer('table_number').nullable();
    table.text('notes').nullable();
    table.timestamp('paid_at').nullable();
    table.timestamp('ready_at').nullable();
    table.timestamp('completed_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('order_number');
    table.index('tenant_id');
    table.index('status');
    table.index('payment_status');
    table.index('created_at');
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('orders');
}

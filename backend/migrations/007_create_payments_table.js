/**
 * Migration: Create Payments Table
 * Stores payment transaction records
 */
export async function up(knex) {
  return knex.schema.createTable('payments', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.integer('checkout_counter_id').unsigned().notNullable().references('id').inTable('checkout_counters').onDelete('RESTRICT');
    table.integer('kasir_id').unsigned().notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.decimal('amount_paid', 12, 2).notNullable();
    table.enum('payment_method', ['cash', 'card', 'ewallet', 'qris']).notNullable();
    table.string('transaction_reference', 255).nullable().unique();
    table.enum('status', ['pending', 'success', 'failed', 'refunded']).defaultTo('pending');
    table.jsonb('payment_details').nullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('order_id');
    table.index('checkout_counter_id');
    table.index('kasir_id');
    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('payments');
}

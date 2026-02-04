/**
 * Migration: Create Checkout Counters Table
 * Represents physical payment counters
 */
export async function up(knex) {
  return knex.schema.createTable('checkout_counters', (table) => {
    table.increments('id').primary();
    table.string('counter_name', 100).notNullable();
    table.string('counter_code', 50).unique().notNullable();
    table.integer('current_kasir_count').defaultTo(0);
    table.integer('max_kasir').defaultTo(3);
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('counter_code');
    table.index('status');
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('checkout_counters');
}

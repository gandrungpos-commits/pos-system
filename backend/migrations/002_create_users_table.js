/**
 * Migration: Create Users Table
 * Handles super user, kasir, tenant, customer accounts
 */
export async function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username', 100).unique().nullable();
    table.string('email', 100).unique().nullable();
    table.string('password_hash', 255).nullable();
    table.string('pin_hash', 255).nullable();
    table.enum('role', ['super_user', 'pengelola', 'kasir', 'tenant', 'customer']);
    table.integer('tenant_id').unsigned().nullable(); // FK will be added after tenant table exists
    table.integer('checkout_counter_id').unsigned().nullable(); // FK will be added after checkout_counters table exists
    table.string('device_id', 255).nullable();
    table.string('phone', 20).nullable();
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamp('last_login').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('role');
    table.index('tenant_id');
    table.index('status');
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('users');
}

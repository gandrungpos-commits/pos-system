/**
 * Migration: Create QR Codes Table
 * Stores QR code data for each order
 */
export async function up(knex) {
  return knex.schema.createTable('qr_codes', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().unique().notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.string('qr_token', 100).unique().notNullable();
    table.jsonb('qr_data').nullable();
    table.boolean('is_scanned').defaultTo(false);
    table.timestamp('scanned_at').nullable();
    table.timestamp('expires_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('qr_token');
    table.index('order_id');
    table.index('is_scanned');
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('qr_codes');
}

/**
 * Migration: Create Order Items Table
 * Stores individual items in each order
 */
export async function up(knex) {
  return knex.schema.createTable('order_items', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.string('item_name', 255).notNullable();
    table.integer('quantity').notNullable();
    table.decimal('unit_price', 10, 2).notNullable();
    table.decimal('subtotal', 12, 2).notNullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('order_id');
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('order_items');
}

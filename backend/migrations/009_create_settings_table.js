/**
 * Migration: Create Settings Table
 * Configurable system settings
 */
export async function up(knex) {
  return knex.schema.createTable('settings', (table) => {
    table.increments('id').primary();
    table.string('setting_key', 100).unique().notNullable();
    table.string('setting_value', 255).notNullable();
    table.text('description').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Index
    table.index('setting_key');
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('settings');
}

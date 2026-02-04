/**
 * Migration: Create Tenants Table
 * Store food court tenant businesses
 */
export async function up(knex) {
  return knex.schema.createTable('tenants', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('code', 50).unique().notNullable();
    table.string('location', 255).nullable();
    table.text('description').nullable();
    table.string('image_url', 255).nullable();
    table.string('phone', 20).nullable();
    table.string('owner_name', 100).nullable();
    table.decimal('revenue_share_percentage', 5, 2).defaultTo(97);
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.integer('user_id').unsigned().nullable(); // Will add FK later
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('code');
    table.index('status');
    table.index('user_id');
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('tenants');
}

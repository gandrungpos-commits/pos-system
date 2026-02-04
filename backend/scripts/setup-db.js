#!/usr/bin/env node

/**
 * Database Migration & Seeding Script
 * Usage: node scripts/setup-db.js
 */

import knex from 'knex';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import config from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = knex(config);

async function setupDatabase() {
  try {
    console.log('🔄 Starting database setup...\n');

    // Run migrations
    console.log('📦 Running migrations...');
    await db.migrate.latest({ directory: '../migrations' });
    console.log('✅ Migrations completed!\n');

    // Run seeds
    console.log('🌱 Seeding initial data...');
    await db.seed.run({ directory: '../seeds' });
    console.log('✅ Seeding completed!\n');

    console.log('🎉 Database setup finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database setup:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setupDatabase();

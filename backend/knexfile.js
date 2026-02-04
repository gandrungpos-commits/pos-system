/**
 * Knex Configuration
 * Database migrations and seeds configuration
 */

import dotenv from 'dotenv';

dotenv.config();

const config = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'foodcourt_pos_dev'
    },
    migrations: {
      directory: './migrations',
      extension: 'js'
    },
    seeds: {
      directory: './seeds',
      extension: 'js'
    },
    pool: {
      min: 2,
      max: 10
    }
  },

  testing: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'foodcourt_pos_test'
    },
    migrations: {
      directory: './migrations',
      extension: 'js'
    },
    seeds: {
      directory: './seeds',
      extension: 'js'
    }
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: './migrations',
      extension: 'js'
    },
    seeds: {
      directory: './seeds',
      extension: 'js'
    },
    pool: {
      min: 5,
      max: 20
    }
  }
};

export default config[process.env.NODE_ENV || 'development'];

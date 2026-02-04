# Database Setup Guide

## Prerequisites

- PostgreSQL 12+ installed and running
- Node.js 16+ and npm installed
- Environment variables configured in `.env` file

## Environment Setup

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Required database variables:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=foodcourt_pos_dev
```

## Installation

1. Install dependencies:
```bash
npm install
```

## Database Migration & Seeding

### Option 1: Full Setup (Recommended)
Run migrations and seed data in one command:
```bash
npm run db:setup
```

### Option 2: Step by Step

1. **Run migrations only:**
   ```bash
   npm run migrate
   ```

2. **Run seeds only:**
   ```bash
   npm run seed
   ```

3. **Create a new migration:**
   ```bash
   npm run migrate:make create_users_table
   ```

4. **Create a new seed file:**
   ```bash
   npm run seed:make 002_seed_orders
   ```

5. **Rollback migrations:**
   ```bash
   npm run migrate:rollback
   ```

6. **Reset database (WARNING: Destructive):**
   ```bash
   npm run db:reset
   ```

## Database Schema

### Tables Created

1. **users** - User accounts with multiple roles
   - super_user: System administrator
   - pengelola: Food court manager
   - kasir: Cashier at payment counter
   - tenant: Food stall owner
   - customer: End customer

2. **tenants** - Food stall/vendor information

3. **checkout_counters** - Payment counter definitions

4. **orders** - Main order transactions

5. **order_items** - Line items within orders

6. **qr_codes** - QR code tracking for orders

7. **payments** - Payment transaction records

8. **revenue_shares** - Commission distribution records

9. **settings** - System configuration key-value pairs

## Sample Data Included

The seed file inserts:
- 1 Super User (admin)
- 1 Pengelola (manager)
- 3 Kasir Users
- 5 Tenants
- 3 Sample Orders with items
- Payment records
- Revenue share calculations
- System settings

## Verification

After setup, verify the database:

```bash
# Connect to PostgreSQL
psql -U postgres -d foodcourt_pos_dev

# List all tables
\dt

# Show sample data
SELECT * FROM users;
SELECT * FROM tenants;
SELECT * FROM orders;
```

## Using with Docker (Optional)

If PostgreSQL is not installed locally, use Docker:

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Then run migrations
npm run db:setup
```

## Troubleshooting

### Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running
- Check DB_HOST and DB_PORT in .env
- For Docker: `docker-compose up -d postgres`

### Database Doesn't Exist
```
Error: database "foodcourt_pos_dev" does not exist
```
- Create database: `createdb -U postgres foodcourt_pos_dev`

### Migration Already Run
```
Error: Migration was already executed
```
- Clean migrations: `npm run migrate:rollback`
- Or use `npm run db:reset` to start fresh

## Next Steps

1. Start the backend server: `npm run dev`
2. Server runs on `http://localhost:5000`
3. Begin implementing API endpoints (Task 3)

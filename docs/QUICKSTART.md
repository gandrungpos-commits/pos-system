# Getting Started - Quick Start Guide

## 🚀 First Time Setup (5 minutes)

### 1. Clone/Navigate to Project
```bash
cd /Users/sugenghariadi/pos-system/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` with your database credentials (or keep defaults for local dev):
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=foodcourt_pos_dev
```

### 4. Create Database (First Time)
```bash
# Create the database
createdb -U postgres foodcourt_pos_dev

# Or using Docker if PostgreSQL not installed
docker-compose up -d postgres
sleep 5
```

### 5. Run Migrations & Seeds
```bash
npm run db:setup
```

### 6. Start Development Server
```bash
npm run dev
```

Server running at: `http://localhost:5000`

## 📚 Documentation Guide

### For Project Overview
- **Start Here:** [SYSTEM_OVERVIEW.md](../SYSTEM_OVERVIEW.md) - Quick 5-min read
- **Business Case:** [PROPOSAL.md](../PROPOSAL.md) - For stakeholder approval

### For Development
- **Backend Setup:** [README.md](README.md)
- **API Endpoints:** [API.md](API.md) - All 30+ endpoints documented
- **Database:** [DATABASE.md](DATABASE.md) - Schema and setup
- **Development:** [DEVELOPMENT.md](DEVELOPMENT.md) - Implementation guide

### For Architecture
- **Full Architecture:** [ARCHITECTURE.md](../ARCHITECTURE.md) - Technical design
- **Task List:** [TODO.md](../TODO.md) - 24-task project plan
- **User Manual:** [USER_MANUAL.md](../USER_MANUAL.md) - Operations guide

## 🔍 Quick Status Check

After setup, verify everything works:

```bash
# 1. Check server is running
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-15T..."}

# 2. Check database connection
psql -U postgres -d foodcourt_pos_dev -c "SELECT COUNT(*) as user_count FROM users;"

# Expected: 5 (1 admin + 1 pengelola + 3 kasir)

# 3. Check seed data
npm run seed
```

## 🎯 Next Development Task

### Task 3: Authentication APIs (Ready to Start!)

**Duration:** 3-4 hours  
**Files to Create:**
- `src/controllers/authController.js`
- `src/middleware/authMiddleware.js`
- `tests/auth.test.js`

**Files to Update:**
- `src/services/AuthService.js` (implement the stubs)
- `src/routes/authRoutes.js` (complete the endpoints)

**What to Build:**
```javascript
// POST /auth/login
{
  "username": "kasir1",
  "password": "pass123"
}

// POST /auth/pin-login  
{
  "username": "kasir1",
  "pin": "1234"
}

// GET /auth/verify-token
// DELETE /auth/logout
// POST /auth/reset-pin
```

**Test Data Available:**
```
Kasir 1: username=kasir1, pin=1234
Kasir 2: username=kasir2, pin=1234
Kasir 3: username=kasir3, pin=1234
Admin:   username=admin, password=admin123
```

**Success Criteria:**
- All 5 auth endpoints working
- JWT tokens generated and validated
- PIN validation working
- Proper error messages (401, 400, 500)
- All test cases passing (80%+ coverage)

## 📋 Useful Commands

### Database
```bash
npm run migrate              # Run migrations
npm run migrate:rollback     # Undo migrations
npm run seed                 # Seed sample data
npm run db:setup             # Migrate + Seed
npm run db:reset             # Complete reset (⚠️ deletes data)
```

### Development
```bash
npm run dev                  # Development with hot-reload
npm start                    # Production mode
npm test                     # Run tests
npm test -- --watch         # Watch mode
npm run lint                 # Check code style
npm run format               # Auto-format code
```

### Database CLI
```bash
# Connect to database
psql -U postgres -d foodcourt_pos_dev

# Useful commands in psql:
\dt                          # List all tables
\d users                      # Describe users table
SELECT * FROM users;         # Show users
\q                           # Quit
```

## 🛠️ Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:**
- Start PostgreSQL: `brew services start postgresql` (macOS)
- Or use Docker: `docker-compose up -d postgres`
- Check .env has correct DB_HOST and DB_PORT

### Port 5000 Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Find and kill process using port 5000
lsof -i :5000
kill -9 <PID>
```

### Database Already Exists
```
Error: database "foodcourt_pos_dev" already exists
```
**Solution:**
```bash
npm run db:reset
```

### Migration Failed
```
Error: Migration was already executed
```
**Solution:**
```bash
npm run migrate:rollback
npm run migrate
```

## 📞 Getting Help

If you get stuck:

1. **Check the docs:**
   - API endpoints → [API.md](API.md)
   - Database schema → [DATABASE.md](DATABASE.md)
   - Development guide → [DEVELOPMENT.md](DEVELOPMENT.md)

2. **Check the logs:**
   - Express logs: `logs/` directory
   - Database logs: PostgreSQL error output

3. **Test endpoint manually:**
   ```bash
   # Health check
   curl http://localhost:5000/health
   
   # With Postman: Import endpoints from API.md
   ```

## 🎓 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   API Clients                           │
│  (React, React Native, Web, Mobile, TV Display)        │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────┐         ┌───────▼────┐
    │ REST    │         │ Socket.io  │
    │ APIs    │         │ Real-time  │
    └────┬────┘         └───────┬────┘
         │                       │
    ┌────▼──────────────────────▼────┐
    │   Express.js Server (Port 5000) │
    │  ┌──────────────────────────┐  │
    │  │ Routes & Controllers     │  │
    │  └──────────────────────────┘  │
    │  ┌──────────────────────────┐  │
    │  │ Services Layer (7 classes)  │
    │  │ - Auth, Order, Payment    │  │
    │  │ - QR, Revenue, Report     │  │
    │  └──────────────────────────┘  │
    │  ┌──────────────────────────┐  │
    │  │ Middleware & Utilities   │  │
    │  │ - Auth, Error, Logging   │  │
    │  └──────────────────────────┘  │
    └────┬────────────────────────────┘
         │
    ┌────▼────────────────────────┐
    │   PostgreSQL Database       │
    │  (9 Tables, 80+ Columns)   │
    │  ┌──────────────────────┐   │
    │  │ users, tenants,      │   │
    │  │ orders, payments,    │   │
    │  │ qr_codes, revenue    │   │
    │  └──────────────────────┘   │
    └─────────────────────────────┘
```

## ✅ Phase 2 Complete!

You now have:
- ✅ Production-ready backend structure
- ✅ Complete database schema with 9 tables
- ✅ 7 service classes ready for implementation
- ✅ 30 method stubs ready to code
- ✅ 15+ utility functions ready to use
- ✅ Comprehensive API documentation
- ✅ Sample data for testing
- ✅ Docker configuration for easy deployment

## 🚀 What's Next?

**Task 3:** Implement Authentication APIs (3-4 hours)
- Login endpoint with username/password
- PIN login for kasir/tenant
- Token verification
- PIN reset functionality

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed task breakdown.

---

**Ready to start?** Run `npm run dev` and begin implementing! 🎉

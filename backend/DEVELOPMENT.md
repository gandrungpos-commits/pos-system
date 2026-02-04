# Backend Development Guide

## Quick Reference

### Setup Environment
```bash
cd /Users/sugenghariadi/pos-system/backend
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

Server will start on `http://localhost:5000`

### Folder Structure Reference

```
backend/
├── migrations/           # Database migration files (001-009)
├── seeds/               # Seed data files (001_seed_initial_data.js)
├── scripts/             # Utility scripts (setup-db.js)
├── src/
│   ├── config/         # Database & logger config
│   ├── controllers/    # Request handlers (TODO - implement in Task 3+)
│   ├── services/       # Business logic
│   │   ├── AuthService.js        # Auth logic stubs
│   │   ├── OrderService.js       # Order management stubs
│   │   ├── PaymentService.js     # Payment processing stubs
│   │   ├── QRCodeService.js      # QR operations stubs
│   │   ├── RevenueShareService.js # Commission calculation stubs
│   │   ├── NotificationService.js # Socket.io broadcasting stubs
│   │   └── ReportService.js       # Analytics stubs
│   ├── routes/         # API route definitions
│   │   └── authRoutes.js         # Auth endpoint skeleton
│   ├── middleware/     # Express middleware
│   │   ├── requestLogger.js
│   │   └── errorHandler.js
│   ├── utils/          # Helper functions
│   │   └── helpers.js  # 15+ utility functions
│   ├── socket/         # Socket.io handlers (TODO - implement in Task 7)
│   ├── models/         # Database models (TODO - create in Task 3+)
│   └── index.js        # Express + Socket.io server entry
├── tests/              # Jest test files (TODO - implement in Task 11)
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore patterns
├── package.json        # Node dependencies & scripts
├── knexfile.js         # Knex configuration
├── Dockerfile          # Docker image definition
├── docker-compose.yml  # PostgreSQL + Node.js services
├── DATABASE.md         # Database setup guide
├── API.md              # API documentation
└── README.md           # Project overview
```

## Key Files by Task

### Task 3: Authentication
- **Implement:** `src/controllers/authController.js`
- **Update:** `src/services/AuthService.js` (methods are stubbed)
- **Routes:** `src/routes/authRoutes.js`
- **Test:** `tests/auth.test.js`
- **API Docs:** See [API.md - Authentication Section](API.md#authentication-endpoints)

### Task 4: Orders
- **Implement:** `src/controllers/orderController.js`
- **Update:** `src/services/OrderService.js`
- **Routes:** `src/routes/orderRoutes.js`
- **Test:** `tests/orders.test.js`
- **Database:** Uses `orders`, `order_items`, `qr_codes` tables

### Task 6: Payments
- **Implement:** `src/controllers/paymentController.js`
- **Update:** `src/services/PaymentService.js`
- **Routes:** `src/routes/paymentRoutes.js`
- **Database:** Uses `payments` table
- **Integration:** Midtrans/Xendit (Task 18)

### Task 7: Socket.io
- **Implement:** `src/socket/eventHandlers.js`
- **Rooms:** tenant-{id}, kasir-{counter_id}, customer, display-{tenant_id}
- **Events:** order:paid, order:ready, payment:confirmed, kitchen:order-received

### Task 8: Revenue Sharing
- **Implement:** `src/controllers/revenueController.js`
- **Update:** `src/services/RevenueShareService.js`
- **Calculation:** 97% tenant, 2% food court, 1% developer
- **Database:** Uses `revenue_shares` table

## Service Methods to Implement

### AuthService.js
```javascript
login(username, password)              // ✓ Stub exists
pinLogin(username, pin)                // ✓ Stub exists
verifyToken(token)                     // ✓ Stub exists
resetPin(username, newPin)             // ✓ Stub exists
logout(userId)                         // ✓ Stub exists
```

### OrderService.js
```javascript
createOrder(tenantId, orderData, items)     // ✓ Stub exists
getOrder(orderId)                           // ✓ Stub exists
listOrders(filters, pagination)             // ✓ Stub exists
updateOrderStatus(orderId, newStatus)       // ✓ Stub exists
cancelOrder(orderId)                        // ✓ Stub exists
```

### PaymentService.js
```javascript
processPayment(orderId, paymentData)        // ✓ Stub exists
getPayment(paymentId)                       // ✓ Stub exists
refundPayment(paymentId, reason)            // ✓ Stub exists
validateAmount(amount, orderTotal)          // ✓ Stub exists
```

### QRCodeService.js
```javascript
generateQRCode(orderId)                     // ✓ Stub exists
getQRCode(qrId)                             // ✓ Stub exists
validateQRToken(token)                      // ✓ Stub exists
markAsScanned(qrId)                         // ✓ Stub exists
```

### RevenueShareService.js
```javascript
calculateRevenueSplit(orderAmount, tenantId)  // ✓ Stub exists
recordRevenueSplit(orderId, paymentId)        // ✓ Stub exists
getEarnings(tenantId, dateRange)              // ✓ Stub exists
settlement(tenantId, dateRange)               // ✓ Stub exists
```

### NotificationService.js
```javascript
notifyOrderPaid(order)                  // ✓ Stub exists
notifyOrderReady(order)                 // ✓ Stub exists
notifyPaymentConfirmed(payment)         // ✓ Stub exists
broadcast(room, event, data)            // ✓ Stub exists
```

### ReportService.js
```javascript
getRevenueReport(dateRange)             // ✓ Stub exists
getPeakHours(dateRange)                 // ✓ Stub exists
getTopItems(limit, dateRange)           // ✓ Stub exists
getTenantEarnings(tenantId, dateRange)  // ✓ Stub exists
```

## Database Tables

### 9 Core Tables Created:
1. **users** - Authentication & authorization
2. **tenants** - Food stall information
3. **checkout_counters** - Payment counter management
4. **orders** - Transaction records
5. **order_items** - Line items per order
6. **qr_codes** - QR tracking & scanning
7. **payments** - Payment transactions
8. **revenue_shares** - Commission distribution
9. **settings** - System configuration

### Useful Queries for Development

```sql
-- See all users
SELECT * FROM users;

-- See all orders with total
SELECT * FROM orders ORDER BY created_at DESC;

-- See sample order with items
SELECT o.*, oi.* FROM orders o 
LEFT JOIN order_items oi ON o.id = oi.order_id 
WHERE o.id = 1;

-- Revenue by tenant for month
SELECT 
  t.name, 
  COUNT(rs.id) as transactions,
  SUM(rs.gross_amount) as total_revenue,
  SUM(rs.tenant_share) as tenant_earned,
  SUM(rs.foodcourt_share) as foodcourt_earned
FROM revenue_shares rs
JOIN tenants t ON rs.tenant_id = t.id
WHERE rs.created_at >= '2024-01-01'
GROUP BY t.id;

-- Orders pending payment
SELECT * FROM orders 
WHERE payment_status = 'unpaid'
ORDER BY created_at DESC;
```

## Development Workflow

### 1. Database Changes
```bash
# Create new migration
npm run migrate:make [name]

# Run migrations
npm run migrate

# Reset database
npm run db:reset
```

### 2. API Development
1. Define route in `src/routes/`
2. Create controller in `src/controllers/`
3. Implement service method
4. Add error handling
5. Test with Postman
6. Write Jest tests in `tests/`

### 3. Socket.io Events
1. Define handler in `src/socket/`
2. Register in `src/index.js`
3. Test with Socket.io client library
4. Document in API.md

### 4. Testing
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
```

## Common Patterns

### Express Route Handler
```javascript
import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import AuthService from '../services/AuthService.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await AuthService.login(username, password);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
});

export default router;
```

### Service Method
```javascript
async login(username, password) {
  // 1. Validate input
  // 2. Find user in database
  // 3. Compare password with hash
  // 4. Generate JWT token
  // 5. Return token and user data
}
```

### Socket.io Event Handler
```javascript
socket.on('join-room', ({ room, userId }) => {
  socket.join(room);
  socket.broadcast.to(room).emit('user:joined', { userId });
});

socket.on('order:paid', async (orderData) => {
  await notifyTenant(orderData.tenant_id);
  io.to(`tenant-${orderData.tenant_id}`).emit('order:paid', orderData);
});
```

## Error Handling

Always use try-catch and return proper HTTP status codes:

```javascript
// 200 - Success
// 201 - Created
// 400 - Bad Request (validation error)
// 401 - Unauthorized (auth required)
// 403 - Forbidden (permission denied)
// 404 - Not Found
// 500 - Server Error
```

## Debugging Tips

1. **Check logs:** Output goes to `logs/` directory
2. **Database issues:** Check `.env` configuration
3. **Socket.io:** Use Socket.io DevTools browser extension
4. **Postman:** Import endpoint definitions from API.md
5. **Database CLI:** `psql -U postgres -d foodcourt_pos_dev`

## Next Task: Authentication APIs

### Deliverables for Task 3:
- [ ] `src/controllers/authController.js` with all handlers
- [ ] `src/routes/authRoutes.js` with all endpoint definitions
- [ ] `src/services/AuthService.js` fully implemented
- [ ] `src/middleware/authMiddleware.js` for JWT validation
- [ ] `tests/auth.test.js` with 80%+ coverage
- [ ] All auth endpoints working in Postman
- [ ] Error handling for invalid credentials, expired tokens

### Time Estimate: 3-4 hours

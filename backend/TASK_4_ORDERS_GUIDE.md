# Task 4: Order Management APIs - Getting Started

## Overview
Task 4 focuses on creating the complete order management system. Orders are the core transaction in the POS system, tracking customer orders, items, status workflow, and payment linkage.

## What You'll Implement

### Endpoints (5 total)
1. **POST /api/orders** - Create new order
2. **GET /api/orders** - List orders with filters
3. **GET /api/orders/:id** - Get order details
4. **PATCH /api/orders/:id/status** - Update order status
5. **DELETE /api/orders/:id** - Cancel order

### Database Tables Used
- `orders` - Main order records
- `order_items` - Line items per order
- `qr_codes` - QR tracking (linked to order)
- `users` - To track kasir/tenant context

### Service Methods to Implement
```javascript
// OrderService class
async createOrder(tenantId, orderData, items)
async getOrder(orderId)
async listOrders(filters, pagination)
async updateOrderStatus(orderId, newStatus)
async cancelOrder(orderId)
async getOrderNumber(tenantId) // Helper
```

## Status Workflow

```
┌─────────┐
│ pending │  (Order created, awaiting payment)
└────┬────┘
     │
     ▼
┌─────────┐
│  paid   │  (Payment confirmed, ready for tenant kitchen)
└────┬────┘
     │
     ▼
┌──────────────┐
│  preparing   │  (Tenant is preparing food)
└────┬─────────┘
     │
     ▼
┌────────┐
│ ready  │  (Food ready, customer can pickup or delivered)
└────┬───┘
     │
     ├─────────────────┐
     │                 │
     ▼                 ▼
┌──────────┐   ┌──────────────┐
│completed │   │  cancelled   │
└──────────┘   └──────────────┘
```

## Implementation Plan

### Step 1: Update OrderService (2 hours)
Location: `src/services/OrderService.js`

```javascript
async createOrder(tenantId, orderData, items) {
  // 1. Validate input
  // 2. Generate order number
  // 3. Create order record in database
  // 4. Create order items
  // 5. Generate QR code
  // 6. Return created order with QR
}

async getOrder(orderId) {
  // 1. Fetch order from database
  // 2. Fetch associated items
  // 3. Fetch payment info
  // 4. Fetch QR code data
  // 5. Return complete order object
}

async listOrders(filters, pagination) {
  // 1. Build query with filters (status, tenant, date range, etc)
  // 2. Apply pagination (limit, offset)
  // 3. Return orders with count
}

async updateOrderStatus(orderId, newStatus) {
  // 1. Validate status transition
  // 2. Update order status
  // 3. Update timestamps (paid_at, ready_at, completed_at)
  // 4. Return updated order
  // 5. Emit Socket.io event
}

async cancelOrder(orderId) {
  // 1. Check if order can be cancelled (not completed/already cancelled)
  // 2. Mark as cancelled
  // 3. If paid, process refund
  // 4. Return refund info
}
```

### Step 2: Create OrderController (1.5 hours)
Location: `src/controllers/orderController.js`

Implement handlers for all 5 endpoints with:
- Input validation
- Permission checks (user can only see own orders)
- Error handling
- Response formatting

### Step 3: Create OrderRoutes (30 minutes)
Location: `src/routes/orderRoutes.js`

Register all 5 endpoints with auth middleware protection.

### Step 4: Write Tests (1.5 hours)
Location: `tests/orders.test.js`

Test scenarios:
- Creating order with items
- Listing orders with filters
- Status transitions
- Cancellations
- Permission validation
- Edge cases (duplicate order numbers, invalid status)

### Step 5: Integration (1 hour)
- Register routes in `src/index.js`
- Test with Postman
- Verify auth middleware protection
- Check Socket.io event emission

## Key Files to Create/Modify

| File | Type | Action |
|------|------|--------|
| `src/services/OrderService.js` | Service | Implement all methods |
| `src/controllers/orderController.js` | Controller | Create handlers |
| `src/routes/orderRoutes.js` | Routes | Create routes |
| `tests/orders.test.js` | Tests | Create test suite |
| `src/index.js` | Config | Add route registration |

## Request/Response Examples

### Create Order
```bash
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "tenant_id": 1,
  "customer_name": "Budi Santoso",
  "customer_phone": "081234567890",
  "order_type": "takeaway",
  "table_number": null,
  "items": [
    {
      "item_name": "Nasi Kuning",
      "quantity": 2,
      "unit_price": 25000,
      "notes": "Pedas"
    },
    {
      "item_name": "Ayam Bakar",
      "quantity": 1,
      "unit_price": 35000,
      "notes": ""
    }
  ]
}

Response 201:
{
  "success": true,
  "order": {
    "id": 1,
    "order_number": "T001-001",
    "tenant_id": 1,
    "customer_name": "Budi Santoso",
    "total_amount": 85000,
    "status": "pending",
    "payment_status": "unpaid",
    "items": [...],
    "qr_code": {
      "qr_token": "QR1ABC123...",
      "qr_image": "data:image/png;base64,..."
    },
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### List Orders
```bash
GET /api/orders?status=paid&tenant_id=1&limit=10&offset=0
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "orders": [...],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "page": 1
  }
}
```

### Update Status
```bash
PATCH /api/orders/1/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "preparing"
}

Response 200:
{
  "success": true,
  "order": {
    "id": 1,
    "status": "preparing",
    "updated_at": "2024-01-15T10:32:00Z"
  }
}
```

## Testing Strategy

### Unit Tests (Service)
- Order creation with validation
- Order retrieval
- Status transitions
- Order cancellation
- Edge cases

### Integration Tests (API)
- Full request/response cycle
- Permission validation
- Filter combinations
- Error handling

### Manual Testing (Postman)
1. Create order as tenant
2. List orders with filters
3. Update status workflow (pending → paid → preparing → ready)
4. Cancel order with refund
5. Verify auth protection

## Success Criteria

✅ All 5 endpoints working
✅ Order workflow validated
✅ Auth middleware protecting routes
✅ Proper error messages
✅ 80%+ test coverage
✅ QR codes generated for each order
✅ Socket.io events emitted on status change

## Important Notes

1. **Order Number Format**: `TENANT_CODE-SEQUENCE`
   - Example: T001-001 (Tenant 1, Order 1)
   - Must be unique per tenant per date
   - Implement with database sequence or counter

2. **Permission Model**:
   - Kasir can only see orders from their assigned counter tenant (if any)
   - Tenant can only see their own orders
   - Admin can see all orders
   - Use `req.user` context from auth

3. **Status Transitions**:
   - pending → paid (only via payment)
   - paid → preparing
   - preparing → ready
   - ready → completed
   - Any status → cancelled

4. **QR Code Integration**:
   - Generate QR for each order on creation
   - Store QR token in qr_codes table
   - Return QR data (token + image) in response
   - Use QRCodeService for generation

5. **Socket.io Events**:
   - Emit `order:created` to tenant room
   - Emit `order:status-changed` to relevant rooms
   - Emit `order:ready` to display and customer rooms

## Dependencies Ready

✅ `src/services/QRCodeService.js` - For QR generation
✅ `src/utils/helpers.js` - For order number generation
✅ `src/middleware/authMiddleware.js` - For auth protection
✅ Database schema (orders, order_items, qr_codes tables)
✅ Seed data with sample orders

## Useful SQL Queries for Development

```sql
-- Get order with items
SELECT o.*, oi.* FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = 1;

-- Count orders by status
SELECT status, COUNT(*) as count FROM orders
GROUP BY status;

-- Orders for specific tenant
SELECT * FROM orders WHERE tenant_id = 1
ORDER BY created_at DESC;

-- Get next order number for tenant
SELECT COALESCE(MAX(CAST(SPLIT_PART(order_number, '-', 2) AS INT)), 0) + 1
FROM orders WHERE order_number LIKE 'T001-%';
```

## Next: Continue to Implementation

Ready to start implementing Task 4? The backend foundation is solid and all dependencies are ready!

Run `npm run dev` and begin creating the OrderService methods.

---

**Estimated Total Time: 6-8 hours**
**Target Completion: Next session**

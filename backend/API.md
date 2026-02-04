# Food Court POS Backend - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All endpoints (except `/auth/login` and `/auth/pin-login`) require JWT token in header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### 1. Login with Username & Password
```
POST /auth/login
Content-Type: application/json

{
  "username": "kasir1",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "kasir1",
    "role": "kasir",
    "checkout_counter_id": 1
  }
}
```

### 2. Login with PIN (for Kasir/Tenant)
```
POST /auth/pin-login
Content-Type: application/json

{
  "username": "kasir1",
  "pin": "1234"
}

Response 200:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### 3. Verify Token
```
GET /auth/verify-token

Response 200:
{
  "valid": true,
  "user": { ... }
}
```

### 4. Logout
```
POST /auth/logout

Response 200:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 5. Reset PIN
```
POST /auth/reset-pin
Content-Type: application/json

{
  "username": "kasir1",
  "new_pin": "5678"
}

Response 200:
{
  "success": true,
  "message": "PIN updated successfully"
}
```

---

## Order Endpoints

### 1. Create Order
```
POST /orders
Content-Type: application/json
Authorization: Bearer <token>

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
      "notes": ""
    },
    {
      "item_name": "Ayam Bakar",
      "quantity": 1,
      "unit_price": 35000,
      "notes": "Jangan terlalu pedas"
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
    "total_amount": 85000,
    "status": "pending",
    "payment_status": "unpaid",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Get Order Details
```
GET /orders/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "order": {
    "id": 1,
    "order_number": "T001-001",
    "tenant_id": 1,
    "customer_name": "Budi Santoso",
    "total_amount": 85000,
    "status": "paid",
    "payment_status": "paid",
    "items": [
      {
        "item_name": "Nasi Kuning",
        "quantity": 2,
        "unit_price": 25000,
        "subtotal": 50000
      }
    ],
    "payment": {
      "method": "cash",
      "amount_paid": 85000,
      "status": "success"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "paid_at": "2024-01-15T10:32:00Z"
  }
}
```

### 3. List Orders
```
GET /orders?status=pending&tenant_id=1&limit=20&offset=0
Authorization: Bearer <token>

Query Parameters:
- status: pending|paid|preparing|ready|completed|cancelled
- tenant_id: Filter by tenant
- payment_status: unpaid|paid|refunded
- order_type: takeaway|dine_in
- date_from: YYYY-MM-DD
- date_to: YYYY-MM-DD
- limit: 20 (default)
- offset: 0 (default)

Response 200:
{
  "success": true,
  "orders": [ ... ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

### 4. Update Order Status
```
PATCH /orders/:id/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "preparing"
}

Valid transitions:
- pending → paid (after payment)
- paid → preparing
- preparing → ready
- ready → completed
- (any) → cancelled

Response 200:
{
  "success": true,
  "order": { ... }
}
```

### 5. Cancel Order
```
DELETE /orders/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Order cancelled",
  "refund_amount": 85000
}
```

---

## Payment Endpoints

### 1. Process Payment
```
POST /payments
Content-Type: application/json
Authorization: Bearer <token>

{
  "order_id": 1,
  "checkout_counter_id": 1,
  "amount_paid": 85000,
  "payment_method": "cash",
  "payment_details": {
    "notes": "Bayar pas"
  }
}

Valid methods: cash|card|ewallet|qris

Response 200:
{
  "success": true,
  "payment": {
    "id": 1,
    "order_id": 1,
    "transaction_reference": "TRX202401151030001",
    "amount_paid": 85000,
    "payment_method": "cash",
    "status": "success",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Get Payment Details
```
GET /payments/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "payment": { ... }
}
```

### 3. Process Refund
```
POST /payments/:id/refund
Content-Type: application/json
Authorization: Bearer <token>

{
  "reason": "Customer cancelled order"
}

Response 200:
{
  "success": true,
  "refund": {
    "id": 2,
    "original_payment_id": 1,
    "refund_amount": 85000,
    "status": "success",
    "created_at": "2024-01-15T10:35:00Z"
  }
}
```

---

## QR Code Endpoints

### 1. Generate QR Code
```
POST /qrcodes
Content-Type: application/json
Authorization: Bearer <token>

{
  "order_id": 1
}

Response 200:
{
  "success": true,
  "qrcode": {
    "id": 1,
    "order_id": 1,
    "qr_token": "QR1ABC123XYZ",
    "qr_image": "data:image/png;base64,...",
    "expires_at": "2024-01-15T12:30:00Z"
  }
}
```

### 2. Validate & Scan QR Code
```
POST /qrcodes/validate
Content-Type: application/json
Authorization: Bearer <token>

{
  "qr_token": "QR1ABC123XYZ"
}

Response 200:
{
  "success": true,
  "order": {
    "order_number": "T001-001",
    "customer_name": "Budi Santoso",
    "status": "ready",
    "items": [ ... ]
  }
}
```

### 3. Get QR Code Details
```
GET /qrcodes/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "qrcode": {
    "id": 1,
    "order_id": 1,
    "qr_token": "QR1ABC123XYZ",
    "is_scanned": true,
    "scanned_at": "2024-01-15T10:35:00Z"
  }
}
```

---

## Revenue Share Endpoints

### 1. Get Tenant Revenue
```
GET /revenue/tenant/:tenant_id?date_from=2024-01-01&date_to=2024-01-31
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "period": "2024-01-01 to 2024-01-31",
  "revenue": {
    "gross_amount": 1000000,
    "tenant_share": 970000,
    "foodcourt_share": 20000,
    "developer_share": 10000,
    "transactions_count": 150,
    "settlement_status": "paid"
  }
}
```

### 2. Get All Revenue Splits
```
GET /revenue/splits?settlement_status=pending&limit=20
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "splits": [ ... ],
  "total": 45
}
```

### 3. Mark Revenue as Settled
```
PATCH /revenue/splits/:id/settle
Content-Type: application/json
Authorization: Bearer <token>

{
  "settlement_reference": "SETTLE001"
}

Response 200:
{
  "success": true,
  "split": {
    "id": 1,
    "settlement_status": "paid",
    "settled_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## Report Endpoints

### 1. Revenue Report
```
GET /reports/revenue?date_from=2024-01-01&date_to=2024-01-31
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "period": "2024-01-01 to 2024-01-31",
  "summary": {
    "total_orders": 500,
    "total_revenue": 5000000,
    "average_order_value": 10000,
    "completed_orders": 480,
    "cancelled_orders": 20
  },
  "by_tenant": [
    {
      "tenant_id": 1,
      "tenant_name": "Warung Nasi Kuning",
      "orders_count": 150,
      "revenue": 1500000,
      "share": 1455000
    }
  ],
  "by_payment_method": {
    "cash": 3000000,
    "card": 1500000,
    "ewallet": 500000
  }
}
```

### 2. Peak Hours Report
```
GET /reports/peak-hours?date_from=2024-01-01&date_to=2024-01-31
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "peak_hours": [
    {
      "hour": 12,
      "orders_count": 150,
      "total_revenue": 1500000
    },
    {
      "hour": 18,
      "orders_count": 130,
      "total_revenue": 1300000
    }
  ]
}
```

### 3. Top Items Report
```
GET /reports/top-items?limit=10&date_from=2024-01-01&date_to=2024-01-31
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "items": [
    {
      "item_name": "Nasi Kuning",
      "quantity_sold": 450,
      "total_revenue": 1125000,
      "tenant_name": "Warung Nasi Kuning"
    }
  ]
}
```

---

## User Management Endpoints

### 1. Get Current User Profile
```
GET /users/profile
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "user": {
    "id": 1,
    "username": "kasir1",
    "email": "kasir1@foodcourt.com",
    "role": "kasir",
    "status": "active",
    "phone": "081234567890"
  }
}
```

### 2. Update Profile
```
PATCH /users/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "phone": "081234567891",
  "email": "newemail@foodcourt.com"
}

Response 200:
{
  "success": true,
  "user": { ... }
}
```

### 3. Change Password
```
POST /users/change-password
Content-Type: application/json
Authorization: Bearer <token>

{
  "old_password": "oldpass123",
  "new_password": "newpass456"
}

Response 200:
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Settings Endpoints (Admin Only)

### 1. Get All Settings
```
GET /settings
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "settings": {
    "TENANT_REVENUE_PERCENTAGE": 97,
    "FOODCOURT_REVENUE_PERCENTAGE": 2,
    "DEVELOPER_REVENUE_PERCENTAGE": 1,
    "TAX_PERCENTAGE": 0,
    "QR_EXPIRY_MINUTES": 120
  }
}
```

### 2. Update Setting
```
PATCH /settings/:key
Content-Type: application/json
Authorization: Bearer <token>

{
  "value": 95
}

Response 200:
{
  "success": true,
  "setting": {
    "key": "TENANT_REVENUE_PERCENTAGE",
    "value": "95"
  }
}
```

---

## Real-time Events (Socket.io)

### Server sends to client:

```javascript
// Order paid
socket.emit('order:paid', {
  order_id: 1,
  order_number: 'T001-001',
  total_amount: 85000,
  tenant_id: 1
});

// Order status changed
socket.emit('order:status-changed', {
  order_id: 1,
  old_status: 'pending',
  new_status: 'preparing'
});

// Order ready
socket.emit('order:ready', {
  order_id: 1,
  order_number: 'T001-001'
});

// Payment confirmed
socket.emit('payment:confirmed', {
  payment_id: 1,
  order_id: 1,
  amount: 85000
});
```

### Client sends to server:

```javascript
// Join notification room
socket.emit('join-room', {
  room: 'tenant-1',
  user_id: 5,
  role: 'tenant'
});

// Listen for orders
socket.on('order:paid', (data) => {
  console.log('Order paid:', data);
});
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request format",
  "details": "Field 'customer_name' is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not found",
  "message": "Order with id 999 not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- Auth endpoints: 5 requests per minute per IP
- API endpoints: 100 requests per minute per user
- Payment endpoints: 20 requests per minute per user

---

## Next Steps

1. Implement authentication service (Task 3)
2. Implement order management APIs (Task 4)
3. Implement payment processing (Task 5)
4. Setup Socket.io real-time notifications (Task 6)
5. Implement revenue sharing calculations (Task 7)

# POS System Food Court - Arsitektur Lengkap

## 1. SYSTEM OVERVIEW

Sistem POS terpusat untuk food court dengan 30+ tenant, di mana pelanggan pesan ke tenant tetapi pembayaran dilakukan di kasir terpusat dengan mekanisme QR code scanning.

---

## 2. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND APPLICATIONS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │  TENANT APP     │  │   KASIR APP      │  │ CUSTOMER APP │   │
│  │  (React Native) │  │  (React.js Web)  │  │ (React.js)   │   │
│  │  Android Tablet │  │  Web/Tablet      │  │ Smartphone   │   │
│  └────────┬────────┘  └────────┬─────────┘  └──────┬───────┘   │
│           │                    │                    │            │
│           └────────────────────┼────────────────────┘            │
│                                │                                  │
│          ┌─────────────────────┘                                 │
│          │ Socket.io + REST API                                  │
│          ▼                                                        │
│  ┌─────────────────────────────────────┐                        │
│  │   DISPLAY MONITOR & PORTABLE DEVICE │                        │
│  │  (React.js Dashboard)               │                        │
│  └─────────────────────────────────────┘                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           │ HTTPS + WSS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ API Routes & Controllers                                 │   │
│  │ ├── Auth Controller                                      │   │
│  │ ├── Tenant Controller                                    │   │
│  │ ├── Order Controller                                     │   │
│  │ ├── Payment Controller                                   │   │
│  │ ├── QR Code Controller                                   │   │
│  │ ├── Kasir Controller                                     │   │
│  │ ├── Report Controller                                    │   │
│  │ └── Settings Controller                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Business Logic (Services)                                │   │
│  │ ├── AuthService                                          │   │
│  │ ├── OrderService                                         │   │
│  │ ├── PaymentService                                       │   │
│  │ ├── QRCodeService                                        │   │
│  │ ├── NotificationService (Socket.io)                      │   │
│  │ ├── RevenueShareService                                  │   │
│  │ └── ReportService                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Middleware & Utilities                                   │   │
│  │ ├── Auth Middleware (PIN/Password)                       │   │
│  │ ├── Error Handling                                       │   │
│  │ ├── Request Validation                                   │   │
│  │ └── Logging                                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           │ PostgreSQL Driver
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               DATABASE (PostgreSQL)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Core Tables                                              │   │
│  │ ├── users (super user, kasir, tenant, customer)         │   │
│  │ ├── tenants (daftar tenant di food court)               │   │
│  │ ├── orders (semua order)                                │   │
│  │ ├── order_items (item dalam order)                      │   │
│  │ ├── payments (transaksi pembayaran)                     │   │
│  │ ├── qr_codes (QR unik untuk setiap order)               │   │
│  │ ├── checkout_counters (kasir counters)                  │   │
│  │ ├── revenue_share (perhitungan komisi)                  │   │
│  │ └── settings (config server-wide)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. COMPONENT BREAKDOWN

### 3.1 Frontend - Tenant App (Android Tablet)
**Tech:** React Native + Expo/Android Studio
**Responsibilities:**
- Input pesanan customer
- Generate QR code untuk setiap pesanan
- Print atau display QR ke customer
- Real-time notification ketika order sudah dibayar
- Konfirmasi pengambilan pesanan
- PIN login local

**Key Screens:**
- Login
- Dashboard (order list)
- New Order Form
- QR Display/Print
- Paid Orders List
- Delivery/Pickup Confirmation

### 3.2 Frontend - Kasir App (React.js Web)
**Tech:** React.js + Vite + TailwindCSS
**Responsibilities:**
- Scan QR code dari customer
- Lihat detail order (berapa item, total harga)
- Process pembayaran
- Pilih payment method (cash, e-wallet, card)
- Confirm payment → trigger notifikasi ke tenant
- PIN login
- Dashboard kasir (real-time transactions)

**Key Screens:**
- Login
- QR Scanner
- Order Detail & Payment
- Payment Confirmation
- Transaction History
- Counter Manager (lihat semua counter)

### 3.3 Frontend - Customer App (React.js Web/Progressive Web App)
**Tech:** React.js + Vite
**Responsibilities:**
- Scan QR dari order (atau manual input)
- Lihat detail order
- Real-time status order (waiting → paid → ready → completed)
- Notifikasi ketika order siap

**Key Screens:**
- QR Scanner
- Order Status
- Order Detail

### 3.4 Frontend - Display Monitor
**Tech:** React.js
**Responsibilities:**
- Display nomor antrian/order yang siap diambil
- Display list order yang sedang diproses per tenant
- Countdown timer untuk order
- Bisa connect ke portable device alarm

**Sections:**
- Ready Orders Board (nomor antrian)
- Processing Orders (per tenant)
- Statistics (real-time)

### 3.5 Backend - Core Services

#### AuthService
- Validate PIN/Password
- Token generation (JWT)
- Session management
- Device-level pin storage

#### OrderService
- Create order (input dari tenant)
- Update order status (pending → paid → ready → completed → cancelled)
- Retrieve order history
- Order validation

#### PaymentService
- Process payment
- Calculate total + tax/service charge
- Update payment status
- Refund handling

#### QRCodeService
- Generate unique QR code per order
- Store QR data (order_id, unique_code)
- QR validation saat scan
- QR expiry logic (optional)

#### NotificationService (Socket.io)
- Real-time update order status ke tenant
- Real-time update ke display monitor
- Trigger alarm/notification di customer device
- Push notification ke portable device

#### RevenueShareService
- Calculate revenue per transaction
- Split payment ke: Food Court, Developer, Tenant
- Generate revenue reports

#### ReportService
- Order analytics per tenant
- Revenue reports
- Customer analytics
- Peak hours analysis

---

## 4. DATABASE SCHEMA (PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  pin_hash VARCHAR(255),
  role ENUM('super_user', 'pengelola', 'kasir', 'tenant', 'customer'),
  tenant_id INT (nullable for non-tenant users),
  checkout_counter_id INT (nullable for kasir),
  status ENUM('active', 'inactive'),
  device_id VARCHAR(255) (untuk mobile),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Tenants Table
```sql
CREATE TABLE tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  code VARCHAR(50) UNIQUE,
  location VARCHAR(255),
  description TEXT,
  image_url VARCHAR(255),
  revenue_share_percentage DECIMAL(5,2) DEFAULT 97,
  status ENUM('active', 'inactive'),
  user_id INT REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE,
  tenant_id INT REFERENCES tenants(id),
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  total_amount DECIMAL(12,2),
  status ENUM('pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'),
  payment_status ENUM('unpaid', 'paid', 'refunded'),
  order_type ENUM('takeaway', 'dine_in'),
  table_number INT (nullable for dine_in),
  notes TEXT,
  created_at TIMESTAMP,
  paid_at TIMESTAMP (nullable),
  completed_at TIMESTAMP (nullable),
  updated_at TIMESTAMP
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  item_name VARCHAR(255),
  quantity INT,
  unit_price DECIMAL(10,2),
  subtotal DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMP
);
```

### QR Codes Table
```sql
CREATE TABLE qr_codes (
  id SERIAL PRIMARY KEY,
  order_id INT UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  qr_token VARCHAR(100) UNIQUE,
  qr_data JSON, -- store order details as JSON
  is_scanned BOOLEAN DEFAULT false,
  scanned_at TIMESTAMP (nullable),
  expires_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  checkout_counter_id INT REFERENCES checkout_counters(id),
  kasir_id INT REFERENCES users(id),
  amount_paid DECIMAL(12,2),
  payment_method ENUM('cash', 'card', 'ewallet', 'qris'),
  transaction_reference VARCHAR(255),
  status ENUM('pending', 'success', 'failed', 'refunded'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Checkout Counters Table
```sql
CREATE TABLE checkout_counters (
  id SERIAL PRIMARY KEY,
  counter_name VARCHAR(100),
  counter_code VARCHAR(50) UNIQUE,
  current_kasir_count INT DEFAULT 0,
  max_kasir INT DEFAULT 3,
  status ENUM('active', 'inactive'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Revenue Share Table
```sql
CREATE TABLE revenue_shares (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  payment_id INT REFERENCES payments(id),
  gross_amount DECIMAL(12,2),
  tenant_share DECIMAL(12,2),
  foodcourt_share DECIMAL(12,2),
  developer_share DECIMAL(12,2),
  created_at TIMESTAMP
);
```

### Settings Table
```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE,
  setting_value VARCHAR(255),
  description TEXT,
  updated_at TIMESTAMP
);

-- Contoh settings:
-- tenant_revenue_percentage: 97
-- foodcourt_revenue_percentage: 2
-- developer_revenue_percentage: 1
-- tax_percentage: 0
-- qr_expiry_minutes: 120
```

---

## 5. API ENDPOINTS STRUCTURE

### Authentication
```
POST   /api/auth/login              (super user + pengelola)
POST   /api/auth/pin-login          (kasir + tenant)
POST   /api/auth/logout
POST   /api/auth/verify-token
```

### Orders
```
POST   /api/orders                  (create - tenant)
GET    /api/orders/:id              (get detail)
GET    /api/orders                  (list - with filter)
PATCH  /api/orders/:id              (update status)
DELETE /api/orders/:id              (cancel)
GET    /api/orders/tenant/:tenant_id (get tenant's orders)
```

### QR Codes
```
GET    /api/qr/:order_id            (get QR data)
POST   /api/qr/scan                 (validate QR scan - kasir)
GET    /api/qr/:qr_token/validate   (validate token)
```

### Payments
```
POST   /api/payments                (create payment - kasir)
GET    /api/payments/:id
PATCH  /api/payments/:id            (update status)
GET    /api/payments/checkout/:counter_id (get counter payments)
POST   /api/payments/:id/refund     (refund)
```

### Tenants
```
GET    /api/tenants                 (list all active tenants)
GET    /api/tenants/:id
POST   /api/tenants                 (create - super user)
PATCH  /api/tenants/:id             (update)
```

### Checkout Counters
```
GET    /api/checkout-counters
GET    /api/checkout-counters/:id
POST   /api/checkout-counters       (create)
PATCH  /api/checkout-counters/:id   (update)
```

### Reports
```
GET    /api/reports/tenant/:tenant_id/orders
GET    /api/reports/tenant/:tenant_id/revenue
GET    /api/reports/checkout/:counter_id/transactions
GET    /api/reports/revenue-share   (all)
GET    /api/reports/analytics
```

### Settings
```
GET    /api/settings                (super user only)
PATCH  /api/settings/:key           (update setting)
```

---

## 6. REAL-TIME COMMUNICATION (Socket.io)

### Socket Events - Server to Client

#### Tenant
```javascript
socket.on('order:paid', {
  order_id: 123,
  customer_name: 'John',
  items: [...],
  total: 150000,
  payment_method: 'cash'
})

socket.on('order:payment-confirmed', {
  order_id: 123,
  status: 'preparing'
})

socket.on('order:ready', {
  order_id: 123,
  notification_type: 'display' // atau 'alarm', 'call', 'tv'
})
```

#### Kasir
```javascript
socket.on('order:scanned', {
  order_id: 123,
  qr_token: 'abc123',
  items: [...]
})
```

#### Display Monitor
```javascript
socket.on('orders:ready-list', {
  orders: [
    { order_number: 'T001-001', customer_name: 'John', ready_time: '2 min' }
  ]
})

socket.on('orders:status-update', {
  order_id: 123,
  status: 'ready'
})
```

### Socket Events - Client to Server

#### Tenant
```javascript
socket.emit('tenant:ready-to-receive', { order_id: 123 })
socket.emit('tenant:completed', { order_id: 123 })
```

#### Kasir
```javascript
socket.emit('kasir:qr-scanned', { qr_token: 'abc123' })
socket.emit('kasir:payment-processed', { order_id: 123, amount: 150000 })
```

---

## 7. DATA FLOW - USER SCENARIOS

### Scenario 1: Complete Order Lifecycle

```
1. CUSTOMER ORDERS
   Pelanggan datang ke Tenant A
   Tenant input order di tablet
   → API: POST /api/orders
   → Status: PENDING
   
2. QR GENERATED
   Sistem generate unique QR code
   → Store di QR_CODES table
   → Display/Print QR ke customer
   
3. CUSTOMER GOES TO KASIR
   Pelanggan scan QR di Kasir
   → Kasir app: QR Scanner
   → API: POST /api/qr/scan
   → Validate QR token
   → Display order detail + total amount
   
4. PAYMENT PROCESSED
   Kasir input payment method + amount
   → API: POST /api/payments
   → Calculate revenue share
   → Update order status: PAID
   → Store di PAYMENTS table
   
5. NOTIFICATION TO TENANT
   Socket.io event: order:paid
   → Tenant app get real-time notification
   → Badge/alert di tablet
   → Tenant mulai prepare pesanan
   
6. ORDER READY
   Tenant mark order sebagai READY
   → API: PATCH /api/orders/:id {status: 'ready'}
   → Socket.io: Display monitor update
   → Display nomor antrian di TV
   → Trigger alarm di portable device
   → SMS/Notif ke customer phone (optional)
   
7. CUSTOMER PICKUP/DELIVERY
   Tenant deliver atau customer ambil
   → API: PATCH /api/orders/:id {status: 'completed'}
   → Socket.io: Update semua dashboard
   
8. REVENUE RECORDED
   Sistem auto-calculate revenue share:
   → Revenue table: Insert record
   → Prepare untuk settlement
```

---

## 8. SECURITY & AUTHENTICATION

### PIN-based Authentication (Kasir & Tenant)
```
Device Storage (Secure):
- PIN di-hash menggunakan bcrypt
- Stored di AsyncStorage (React Native) / LocalStorage (Web)
- Sent only via HTTPS to backend

Backend:
- Verify PIN hash
- Generate JWT token (30 min expiry)
- Session stored di Redis/database
```

### Super User / Pengelola
```
- Username + Password
- 2FA optional
- JWT token dengan longer expiry
- Stored di secure session
```

### API Security
```
- HTTPS only
- CORS configured
- Request validation middleware
- Rate limiting
- JWT verification middleware
```

---

## 9. DEPLOYMENT STRUCTURE

```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── config/
│   │   └── index.js (entry point)
│   ├── tests/
│   ├── .env
│   ├── package.json
│   └── docker-compose.yml (PostgreSQL)
│
├── frontend-tenant/
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/ (API calls)
│   │   ├── store/ (state management)
│   │   └── App.js
│   ├── package.json
│   └── app.json (Expo)
│
├── frontend-kasir/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.jsx
│   └── package.json
│
├── frontend-customer/
│   └── (similar structure)
│
├── frontend-display/
│   └── (similar structure)
│
└── docs/
    ├── API.md
    ├── DATABASE.md
    ├── DEPLOYMENT.md
    └── USER_MANUAL.md
```

---

## 10. KEY FEATURES SUMMARY

✅ Multi-tenant POS system  
✅ Centralized payment processing  
✅ QR code-based order tracking  
✅ Real-time notifications (Socket.io)  
✅ Multiple payment methods  
✅ Flexible revenue sharing  
✅ Order status management  
✅ Kasir PIN authentication  
✅ Role-based access control  
✅ Analytics & reporting  
✅ Portable device notifications  
✅ TV monitor display  

---

## 11. TECHNOLOGY CHOICES

| Component | Technology | Why |
|-----------|-----------|-----|
| Backend | Node.js + Express | Fast, scalable, event-driven |
| Database | PostgreSQL | ACID compliance, good for financial data |
| Real-time | Socket.io | Reliable WebSocket + fallback |
| Tenant App | React Native | One codebase for Android/iOS |
| Kasir/Display | React.js | Fast, responsive web UI |
| QR Code | qrcode.react + qr-scanner | Reliable, well-maintained |
| State Mgmt | Redux / Context API | Manage complex app state |
| Auth | JWT + bcrypt | Stateless, secure |

---

Sekarang kita siap untuk mulai implementasi. Agree dengan arsitektur ini?

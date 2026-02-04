# Backend Integration Guide

## Setup

### 1. Backend Environment Variables
Create `.env` file di `/backend` dengan:
```
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=pos_system
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 2. Start Backend Server
```bash
cd /backend
npm install
npm run dev
```
Backend akan berjalan di `http://localhost:5000/api`

### 3. Frontend Environment Variables

**Admin Dashboard** (`.env` di `/frontend/apps/admin/`):
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Admin Dashboard
```

**SuperAdmin Dashboard** (`.env` di `/frontend/apps/superadmin/`):
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=SuperAdmin Dashboard
```

### 4. Start Frontend Apps
```bash
# Terminal 1: Admin Dashboard
cd /frontend/apps/admin
npm run dev
# Runs on http://localhost:5176

# Terminal 2: SuperAdmin Dashboard
cd /frontend/apps/superadmin
npm run dev
# Runs on http://localhost:5177

# Terminal 3: Other apps if needed
cd /frontend/apps/kasir
npm run dev

cd /frontend/apps/display
npm run dev
```

## API Integration Points

### Menu Management (Admin)
- **Fetch menus**: Uses `fetchMenus()` thunk from `menuSlice.async.ts`
- **Create menu**: Uses `createMenu()` thunk
- **Update menu**: Uses `updateMenu()` thunk
- **Delete menu**: Uses `deleteMenu()` thunk

API endpoints:
```
GET    /menus
POST   /menus
PUT    /menus/:id
DELETE /menus/:id
```

### Orders (Admin)
- Uses similar async thunks pattern
- Filter by status, payment method, date range

API endpoints:
```
GET    /orders
POST   /orders
PUT    /orders/:id
PATCH  /orders/:id/status
DELETE /orders/:id
```

### Staff/Users (Admin)
- CRUD operations with role management
- Update role and permissions

API endpoints:
```
GET    /users
POST   /users
PUT    /users/:id
PATCH  /users/:id/role
DELETE /users/:id
```

### Tenants (SuperAdmin)
- Manage restaurant tenants
- Update subscription tiers

API endpoints:
```
GET    /superadmin/tenants
POST   /superadmin/tenants
PUT    /superadmin/tenants/:id
PATCH  /superadmin/tenants/:id/status
DELETE /superadmin/tenants/:id
```

### Users (SuperAdmin)
- Manage platform users
- Assign roles (super_admin, support, etc.)

API endpoints:
```
GET    /superadmin/users
POST   /superadmin/users
PUT    /superadmin/users/:id
PATCH  /superadmin/users/:id/role
DELETE /superadmin/users/:id
```

### Analytics
**Admin**: `/analytics/dashboard`, `/analytics/revenue`, `/analytics/orders`
**SuperAdmin**: `/superadmin/analytics/dashboard`, `/superadmin/analytics/tenant-metrics`

## Authentication Flow

1. User logs in with username/password
2. Backend returns JWT token + user data
3. Token stored in localStorage
4. All subsequent requests include `Authorization: Bearer {token}` header
5. Axios interceptor handles automatic token inclusion
6. 401 responses trigger logout + redirect to /login

## Error Handling

Axios interceptors handle:
- Network errors → displayed via Redux error state
- 401 Unauthorized → automatic logout
- Other errors → Redux `error` state with message

Components should check:
```typescript
if (state.menu.loading) return <Spinner />
if (state.menu.error) return <ErrorAlert message={state.menu.error} />
```

## Development Workflow

1. Backend runs independently on port 5000
2. Frontend apps connect via configured API_URL
3. Redux thunks handle async API calls
4. Local Redux state for UI state (filters, editing, etc.)
5. API integration is transparent to components

## Testing with Real Data

After backend is running:
```bash
# Create seed data
cd /backend
npm run seed

# Then in admin dashboard
npm run dev
# Menu page will show real data from API
```

## Next Steps

1. ✅ API services configured
2. ✅ Auth service integrated
3. ✅ Async thunks for menu management
4. 📋 Complete async thunks for other resources (orders, users, analytics)
5. 📋 Update components to use Redux thunks
6. 📋 Add error boundaries and loading states
7. 📋 E2E tests with real backend
8. 📋 Deploy to production

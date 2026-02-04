# Supabase Integration Guide

## Setup Complete ✅

**Database:** Supabase (vbclcsccuzcgrxedzpej.supabase.co)
**URL:** https://vbclcsccuzcgrxedzpej.supabase.co
**Anon Key:** sb_publishable_0ZMziQhXB9SKGQgD9voFvA_rYaE18Bb

## Environments Setup ✅

All 5 apps configured with `.env.local`:
- Kasir: http://localhost:5174
- Customer: http://localhost:5175
- Display: http://localhost:5176
- Admin: http://localhost:5179
- Tenant: http://localhost:5180

## How to Use in Components

### 1. Import Supabase Client
```typescript
import { supabase, db, auth, useAuth, AuthProvider } from '@pos/utils';
```

### 2. Setup Auth Provider (in App.tsx)
```typescript
import { AuthProvider } from '@pos/utils';

function App() {
  return (
    <AuthProvider>
      {/* Your app routes */}
    </AuthProvider>
  );
}
```

### 3. Use Auth Hook
```typescript
import { useAuth } from '@pos/utils';

function LoginPage() {
  const { user, loading, signIn, signOut } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (user) return <p>Welcome {user.email}!</p>;

  return <LoginForm onLogin={handleLogin} />;
}
```

### 4. Query Database
```typescript
import { db } from '@pos/utils';

async function getTenants() {
  const { data, error } = await db.getTenants();
  if (error) console.error(error);
  return data;
}

async function getOrders(tenantId: number) {
  const { data, error } = await db.getOrders({ tenant_id: tenantId });
  if (error) console.error(error);
  return data;
}

async function createOrder(order: any) {
  const { data, error } = await db.createOrder(order);
  if (error) console.error(error);
  return data;
}
```

### 5. Real-time Subscriptions
```typescript
import { db } from '@pos/utils';

useEffect(() => {
  const subscription = db.subscribeToOrders((payload) => {
    console.log('Order updated:', payload);
    // Update UI
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Testing

### Create Test User (via Supabase Dashboard)
1. Go to https://app.supabase.com → Project → Authentication → Users
2. Create new user:
   - Email: `test@pos.com`
   - Password: `Test@123456`

### Test Login in Frontend
```bash
# Start any app (e.g., Admin)
cd frontend/apps/admin
npm run dev

# Try login with:
# Email: test@pos.com
# Password: Test@123456
```

## Database Schema

**Tables:**
- `tenants` - Restaurant businesses (5 vendors)
- `users` - User accounts with roles (super_user, tenant, kasir, customer)
- `orders` - Customer orders
- `order_items` - Items per order
- `payments` - Payment transactions
- `qr_codes` - QR codes for orders
- `revenue_shares` - Commission distribution
- `checkout_counters` - Payment counters
- `settings` - System settings

## RLS (Row Level Security)

All data is protected with RLS policies:
- Tenants can only see their own data
- Kasir can only see their counter transactions
- Super users see everything
- Customers see their own orders

## Available Functions

### Calculate Tenant Revenue
```sql
SELECT * FROM calculate_tenant_revenue(tenant_id, from_date, to_date);
```

### Calculate Revenue Share
```sql
SELECT * FROM calculate_revenue_share(gross_amount, tenant_percentage);
```

### Get Top Selling Tenants
```sql
SELECT * FROM get_top_selling_tenants(from_date, to_date, limit);
```

## Next Steps

1. **Create Auth Pages** - Implement login/signup pages in each app
2. **Update Components** - Replace mock data with Supabase queries
3. **Test Real-time** - Verify real-time updates work
4. **Deploy to Vercel** - Push to production

## Troubleshooting

### "Table does not exist"
- Check Supabase Tables Editor to verify tables exist
- Ensure SUPABASE_SETUP.sql ran successfully

### "Policy denies access"
- Check RLS policies in Supabase
- Verify user role matches policy requirements

### "CORS error"
- Supabase CORS is pre-configured
- Check browser console for specific error

## Support

For issues, check:
1. Supabase Dashboard: https://app.supabase.com
2. Console logs in browser
3. Network tab for API errors
4. Supabase documentation: https://supabase.com/docs

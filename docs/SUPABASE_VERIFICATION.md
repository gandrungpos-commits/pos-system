# 🔍 Supabase Data Verification Checklist

## Verify di Supabase Dashboard

**Link:** https://app.supabase.com/project/vbclcsccuzcgrxedzpej

### 1. Check Tables (Table Editor)
- [ ] tenants (5 rows)
- [ ] users (empty - akan dibuat via Auth)
- [ ] checkout_counters (3 rows)
- [ ] orders (empty)
- [ ] order_items (empty)
- [ ] payments (empty)
- [ ] revenue_shares (empty)
- [ ] qr_codes (empty)
- [ ] settings (6 rows)

### 2. Check Data in Tenants

**Query to verify:**
```sql
SELECT id, name, code, status FROM tenants ORDER BY id;
```

**Expected Results:**
```
1 | Ayam Geprek Pak Maksur | AYAM_GEPREK | active
2 | Soto Makasar Asoy | SOTO_MAKASAR | active
3 | Gado-Gado Mak Ijah | GADO_GADO | active
4 | Mie Aceh Teh Matahari | MIE_ACEH | active
5 | Es Cendol Cidro | ES_CENDOL | active
```

### 3. Check Settings

**Query:**
```sql
SELECT setting_key, setting_value FROM settings ORDER BY setting_key;
```

**Expected (6 rows):**
- foodcourt_name
- foodcourt_location
- order_timeout_minutes
- payment_methods_enabled
- revenue_share_developer_percentage
- revenue_share_foodcourt_percentage

### 4. Check Checkout Counters

**Query:**
```sql
SELECT id, counter_name, counter_code, status FROM checkout_counters;
```

**Expected (3 rows):**
```
1 | Counter 1 | C001 | active
2 | Counter 2 | C002 | active
3 | Counter 3 | C003 | inactive
```

### 5. Check RLS Policies

Go to **Table Editor** → Select any table → **RLS** button
- [ ] tenants - 3 policies
- [ ] users - 1 policy
- [ ] checkout_counters - 1 policy
- [ ] orders - 2 policies
- [ ] order_items - 1 policy
- [ ] qr_codes - 1 policy
- [ ] payments - 1 policy
- [ ] revenue_shares - 1 policy
- [ ] settings - 1 policy

### 6. Check Functions

Go to **Database** → **Functions**
- [ ] calculate_tenant_revenue
- [ ] calculate_revenue_share
- [ ] validate_order_for_payment
- [ ] get_top_selling_tenants

---

## How to Access

1. Open https://app.supabase.com
2. Click project: **gandrungpos-commits's Project**
3. Navigate to **SQL Editor** for queries
4. Navigate to **Table Editor** to see data
5. Navigate to **Database** → Functions to check functions

---

## Verification Status

Run these queries in SQL Editor to check data:

```sql
-- Check tenants count
SELECT COUNT(*) as tenant_count FROM tenants;

-- Check settings count
SELECT COUNT(*) as settings_count FROM settings;

-- Check checkout counters
SELECT COUNT(*) as counter_count FROM checkout_counters;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**All data should be in Supabase now!** ✅

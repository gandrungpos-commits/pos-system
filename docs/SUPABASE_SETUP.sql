-- ============================================================================
-- SUPABASE SETUP SCRIPT FOR POS FOODCOURT SAMARINDA
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. CREATE TABLES (Migrations)
-- ============================================================================

-- Table: tenants
CREATE TABLE IF NOT EXISTS tenants (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  location VARCHAR(255),
  description TEXT,
  image_url VARCHAR(255),
  phone VARCHAR(20),
  owner_name VARCHAR(100),
  revenue_share_percentage DECIMAL(5,2) DEFAULT 97,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_code ON tenants(code);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  username VARCHAR(100) UNIQUE,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  pin_hash VARCHAR(255),
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_user', 'pengelola', 'kasir', 'tenant', 'customer')),
  tenant_id BIGINT REFERENCES tenants(id),
  checkout_counter_id BIGINT,
  device_id VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Table: checkout_counters
CREATE TABLE IF NOT EXISTS checkout_counters (
  id BIGSERIAL PRIMARY KEY,
  counter_name VARCHAR(100) NOT NULL,
  counter_code VARCHAR(50) UNIQUE NOT NULL,
  current_kasir_count INTEGER DEFAULT 0,
  max_kasir INTEGER DEFAULT 3,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkout_counters_code ON checkout_counters(counter_code);
CREATE INDEX IF NOT EXISTS idx_checkout_counters_status ON checkout_counters(status);

-- Add FK for users.checkout_counter_id
ALTER TABLE users ADD CONSTRAINT fk_users_checkout_counter_id 
  FOREIGN KEY (checkout_counter_id) REFERENCES checkout_counters(id) ON DELETE SET NULL;

-- Table: orders
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20),
  total_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled')),
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  order_type VARCHAR(20) DEFAULT 'takeaway' CHECK (order_type IN ('takeaway', 'dine_in')),
  table_number INTEGER,
  notes TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  ready_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Table: order_items
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Table: qr_codes
CREATE TABLE IF NOT EXISTS qr_codes (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  qr_token VARCHAR(100) UNIQUE NOT NULL,
  qr_data JSONB,
  is_scanned BOOLEAN DEFAULT FALSE,
  scanned_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_codes_token ON qr_codes(qr_token);
CREATE INDEX IF NOT EXISTS idx_qr_codes_order_id ON qr_codes(order_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_is_scanned ON qr_codes(is_scanned);

-- Table: payments
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  checkout_counter_id BIGINT NOT NULL REFERENCES checkout_counters(id) ON DELETE RESTRICT,
  kasir_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount_paid DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'ewallet', 'qris')),
  transaction_reference VARCHAR(255) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  payment_details JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_checkout_counter_id ON payments(checkout_counter_id);
CREATE INDEX IF NOT EXISTS idx_payments_kasir_id ON payments(kasir_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Table: revenue_shares
CREATE TABLE IF NOT EXISTS revenue_shares (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  gross_amount DECIMAL(12,2) NOT NULL,
  tenant_share DECIMAL(12,2) NOT NULL,
  foodcourt_share DECIMAL(12,2) NOT NULL,
  developer_share DECIMAL(12,2) NOT NULL,
  settlement_status VARCHAR(20) DEFAULT 'pending' CHECK (settlement_status IN ('pending', 'paid', 'partially_paid')),
  settled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenue_shares_order_id ON revenue_shares(order_id);
CREATE INDEX IF NOT EXISTS idx_revenue_shares_payment_id ON revenue_shares(payment_id);
CREATE INDEX IF NOT EXISTS idx_revenue_shares_tenant_id ON revenue_shares(tenant_id);
CREATE INDEX IF NOT EXISTS idx_revenue_shares_settlement_status ON revenue_shares(settlement_status);

-- Table: settings
CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value VARCHAR(255) NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(setting_key);

-- ============================================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. RLS POLICIES
-- ============================================================================

-- TENANTS: Tenant managers can view/edit their own tenant
CREATE POLICY "tenant_managers_view_own" ON tenants
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (SELECT role FROM users WHERE id = user_id) = 'super_user'
  );

CREATE POLICY "tenant_managers_update_own" ON tenants
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (SELECT role FROM users WHERE id = user_id) = 'super_user'
  );

CREATE POLICY "super_user_all_tenants" ON tenants
  FOR ALL USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'super_user'
  );

-- USERS: Users can view themselves
CREATE POLICY "users_view_self" ON users
  FOR SELECT USING (
    auth.uid() = id OR 
    (SELECT role FROM users WHERE id = auth.uid()) = 'super_user'
  );

-- CHECKOUT_COUNTERS: Anyone authenticated can view
CREATE POLICY "checkout_counters_view" ON checkout_counters
  FOR SELECT USING (auth.role() = 'authenticated');

-- ORDERS: Tenants can view their own orders
CREATE POLICY "orders_tenant_view_own" ON orders
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'super_user'
  );

CREATE POLICY "orders_customer_view_own" ON orders
  FOR SELECT USING (
    customer_phone = (SELECT phone FROM users WHERE id = auth.uid())
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'super_user'
  );

-- ORDER_ITEMS: Visible based on order access
CREATE POLICY "order_items_view" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE 
        tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
        OR (SELECT role FROM users WHERE id = auth.uid()) = 'super_user'
    )
  );

-- QR_CODES: Visible to tenant and super_user
CREATE POLICY "qr_codes_view" ON qr_codes
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE 
        tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
        OR (SELECT role FROM users WHERE id = auth.uid()) = 'super_user'
    )
  );

-- PAYMENTS: Visible to kasir, tenant, and super_user
CREATE POLICY "payments_view" ON payments
  FOR SELECT USING (
    kasir_id = auth.uid()
    OR order_id IN (
      SELECT id FROM orders WHERE 
        tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    )
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'super_user'
  );

-- REVENUE_SHARES: Visible to tenant and super_user
CREATE POLICY "revenue_shares_tenant_view" ON revenue_shares
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'super_user'
  );

-- SETTINGS: Anyone authenticated can view
CREATE POLICY "settings_view" ON settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================================
-- 4. POSTGRES FUNCTIONS FOR BUSINESS LOGIC
-- ============================================================================

-- Function: Calculate tenant revenue for date range
CREATE OR REPLACE FUNCTION calculate_tenant_revenue(
  p_tenant_id BIGINT,
  p_from_date TIMESTAMP WITH TIME ZONE,
  p_to_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue DECIMAL,
  avg_order_value DECIMAL,
  completed_orders BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(o.id)::BIGINT,
    COALESCE(SUM(o.total_amount), 0)::DECIMAL,
    COALESCE(AVG(o.total_amount), 0)::DECIMAL,
    COUNT(CASE WHEN o.status = 'completed' THEN 1 END)::BIGINT
  FROM orders o
  WHERE o.tenant_id = p_tenant_id
    AND o.created_at >= p_from_date
    AND o.created_at <= p_to_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Calculate revenue share for payment
CREATE OR REPLACE FUNCTION calculate_revenue_share(
  p_gross_amount DECIMAL,
  p_tenant_percentage DECIMAL
)
RETURNS TABLE (
  tenant_share DECIMAL,
  foodcourt_share DECIMAL,
  developer_share DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (p_gross_amount * p_tenant_percentage / 100)::DECIMAL,
    (p_gross_amount * 2 / 100)::DECIMAL,
    (p_gross_amount * 1 / 100)::DECIMAL;
END;
$$ LANGUAGE plpgsql;

-- Function: Validate order before payment
CREATE OR REPLACE FUNCTION validate_order_for_payment(p_order_id BIGINT)
RETURNS TABLE (
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_order_id BIGINT;
  v_status VARCHAR;
BEGIN
  SELECT id, status INTO v_order_id, v_status FROM orders WHERE id = p_order_id;
  
  IF v_order_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Order not found'::TEXT;
  ELSIF v_status IN ('completed', 'cancelled') THEN
    RETURN QUERY SELECT FALSE, 'Order already ' || v_status;
  ELSIF v_status = 'paid' THEN
    RETURN QUERY SELECT TRUE, 'Order already paid'::TEXT;
  ELSE
    RETURN QUERY SELECT TRUE, ''::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Get top selling tenants
CREATE OR REPLACE FUNCTION get_top_selling_tenants(
  p_from_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  p_to_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  tenant_id BIGINT,
  tenant_name VARCHAR,
  total_orders BIGINT,
  total_revenue DECIMAL,
  avg_order_value DECIMAL,
  growth_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH tenant_stats AS (
    SELECT 
      t.id,
      t.name,
      COUNT(o.id) as order_count,
      COALESCE(SUM(o.total_amount), 0) as revenue,
      COALESCE(AVG(o.total_amount), 0) as avg_value
    FROM tenants t
    LEFT JOIN orders o ON t.id = o.tenant_id 
      AND o.created_at >= p_from_date 
      AND o.created_at <= p_to_date
    GROUP BY t.id, t.name
  )
  SELECT 
    ts.id,
    ts.name,
    ts.order_count,
    ts.revenue,
    ts.avg_value,
    ((ts.order_count::DECIMAL / 
      NULLIF(
        (SELECT COUNT(*) FROM orders 
         WHERE tenant_id = ts.id 
           AND created_at < p_from_date 
           AND created_at >= p_from_date - INTERVAL '30 days'), 
        0
      )) * 100 - 100)::DECIMAL as growth
  FROM tenant_stats ts
  ORDER BY revenue DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DONE! Now run seed data
-- ============================================================================

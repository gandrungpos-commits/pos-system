-- Enable public access to orders table for testing
-- In production, you should use proper RLS policies based on tenant_id

-- Disable RLS for testing (not recommended for production)
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_counters DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Note: After testing is complete, re-enable RLS with proper policies
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

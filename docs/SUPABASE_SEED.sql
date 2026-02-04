-- ============================================================================
-- SEED DATA FOR POS FOODCOURT SAMARINDA (Simplified - no users)
-- Run this AFTER SUPABASE_SETUP.sql
-- Users will be created via Supabase Auth instead
-- ============================================================================

-- ============================================================================
-- 1. INSERT CHECKOUT COUNTERS
-- ============================================================================

INSERT INTO public.checkout_counters (counter_name, counter_code, current_kasir_count, max_kasir, status)
VALUES 
  ('Counter 1', 'C001', 1, 3, 'active'),
  ('Counter 2', 'C002', 1, 3, 'active'),
  ('Counter 3', 'C003', 0, 3, 'inactive');

-- ============================================================================
-- 2. INSERT TENANTS (5 vendors)
-- ============================================================================

INSERT INTO public.tenants (name, code, location, description, phone, owner_name, revenue_share_percentage, status, user_id)
VALUES 
  ('Ayam Geprek Pak Maksur', 'AYAM_GEPREK', 'Samarinda Supermall Lt. 3', 'Ayam geprek dengan sambal pedas khas', '0541-123456', 'Pak Maksur', 97, 'active', NULL),
  ('Soto Makasar Asoy', 'SOTO_MAKASAR', 'Samarinda Supermall Lt. 3', 'Soto makasar tradisional enak', '0541-123457', 'Ibu Asoy', 97, 'active', NULL),
  ('Gado-Gado Mak Ijah', 'GADO_GADO', 'Samarinda Supermall Lt. 3', 'Gado-gado dengan bumbu kacang istimewa', '0541-123458', 'Mak Ijah', 97, 'active', NULL),
  ('Mie Aceh Teh Matahari', 'MIE_ACEH', 'Samarinda Supermall Lt. 3', 'Mie aceh goreng dan kuah autentik', '0541-123459', 'Teh Matahari', 97, 'active', NULL),
  ('Es Cendol Cidro', 'ES_CENDOL', 'Samarinda Supermall Lt. 3', 'Es cendol tradisional segar', '0541-123460', 'Cidro', 97, 'active', NULL);

-- ============================================================================
-- 3. INSERT SETTINGS
-- ============================================================================

INSERT INTO public.settings (setting_key, setting_value, description)
VALUES 
  ('foodcourt_name', 'Samarinda Supermall Food Court Lt. 3', 'Nama food court'),
  ('foodcourt_location', 'Level 3, Samarinda Supermall', 'Lokasi food court'),
  ('revenue_share_foodcourt_percentage', '2', 'Persentase revenue untuk food court'),
  ('revenue_share_developer_percentage', '1', 'Persentase revenue untuk developer'),
  ('order_timeout_minutes', '30', 'Timeout order jika belum dibayar'),
  ('payment_methods_enabled', 'cash,card,ewallet,qris', 'Metode pembayaran yang tersedia');

-- ============================================================================
-- SEED DATA BERHASIL DIINSERT!
-- Next: Create users via Supabase Auth & frontend will handle it
-- ============================================================================

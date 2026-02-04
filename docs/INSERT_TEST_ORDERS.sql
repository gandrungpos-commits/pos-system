-- Insert test orders untuk tenant app testing
INSERT INTO orders (order_number, tenant_id, customer_name, customer_phone, total_amount, status, payment_status, order_type) VALUES
('ORDER-001', 1, 'Customer A', '081234567890', 150000, 'completed', 'paid', 'takeaway'),
('ORDER-002', 1, 'Customer B', '081234567891', 225000, 'completed', 'paid', 'dine_in'),
('ORDER-003', 1, 'Customer C', '081234567892', 85000, 'completed', 'paid', 'takeaway'),
('ORDER-004', 1, 'Customer D', '081234567893', 310000, 'completed', 'paid', 'dine_in'),
('ORDER-005', 1, 'Customer E', '081234567894', 195000, 'completed', 'paid', 'takeaway');

-- Verify insert
SELECT COUNT(*) as total_orders, 
       SUM(total_amount) as total_revenue,
       AVG(total_amount) as avg_order
FROM orders
WHERE tenant_id = 1;

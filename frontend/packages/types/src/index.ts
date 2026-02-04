// Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'cashier' | 'customer';
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'admin' | 'cashier' | 'customer';
  restaurant_id: string;
}

// Order Types
export interface OrderItem {
  id: string;
  menu_id: string;
  menu_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  order_number: string;
  customer_name?: string;
  customer_phone?: string;
  items: OrderItem[];
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  payment_method?: 'cash' | 'card' | 'e_wallet' | 'bank_transfer';
  payment_status: 'pending' | 'completed' | 'failed';
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateOrderPayload {
  restaurant_id: string;
  customer_name?: string;
  customer_phone?: string;
  items: Array<{
    menu_id: string;
    quantity: number;
    notes?: string;
  }>;
  discount_amount?: number;
  notes?: string;
}

// Menu Types
export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Payment Types
export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: 'cash' | 'card' | 'e_wallet' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed';
  reference_number?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentPayload {
  order_id: string;
  amount: number;
  method: 'cash' | 'card' | 'e_wallet' | 'bank_transfer';
  reference_number?: string;
}

// QR Code Types
export interface QRCode {
  id: string;
  restaurant_id: string;
  table_number: string;
  qr_string: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Revenue Types
export interface RevenueSummary {
  date: string;
  total_orders: number;
  total_amount: number;
  cash_amount: number;
  card_amount: number;
  e_wallet_amount: number;
  bank_transfer_amount: number;
  discount_amount: number;
  average_order_value: number;
}

// Settings Types
export interface RestaurantSettings {
  restaurant_id: string;
  restaurant_name: string;
  address: string;
  phone: string;
  email: string;
  business_hours_open: string;
  business_hours_close: string;
  tax_rate: number;
  currency: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    total_pages?: number;
  };
}

// Socket.io Event Types
export interface SocketEvents {
  'order:created': Order;
  'order:updated': Order;
  'order:status:changed': { order_id: string; status: Order['status']; timestamp: string };
  'payment:completed': Payment;
  'kitchen:order:received': Order;
  'display:order:ready': { order_id: string; order_number: string; timestamp: string };
  'queue:updated': { pending_count: number; preparing_count: number; ready_count: number };
}

// Form Types
export interface FormError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: FormError[];
}

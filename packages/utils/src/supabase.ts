import { createClient } from '@supabase/supabase-js';

// Supabase credentials (from environment variables)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.REACT_APP_SUPABASE_URL || 'https://vbclcsccuzcgrxedzpej.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE || import.meta.env.VITE_SUPABASE_KEY || import.meta.env.REACT_APP_SUPABASE_KEY || 'sb_publishable_0ZMziQhXB9SKGQgD9voFvA_rYaE18Bb';

// Debug logging
console.log('🔧 Supabase Init:', {
  url: SUPABASE_URL,
  keyType: SUPABASE_KEY.substring(0, 20) + '...',
  hasServiceRole: !!import.meta.env.VITE_SUPABASE_SERVICE_ROLE,
});

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Auth functions
export const auth = {
  // Sign up
  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({
      email,
      password,
    });
  },

  // Sign in
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  // Sign out
  async signOut() {
    return await supabase.auth.signOut();
  },

  // Get current session
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // Get user
  async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  // On auth state change
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database queries
export const db = {
  // Tenants
  async getTenants() {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('status', 'active');
    return { data, error };
  },

  async getTenant(id: number) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async updateTenant(id: number, updates: any) {
    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  // Orders
  async getOrders(filters?: any) {
    let query = supabase.from('orders').select(`
      *,
      order_items(*)
    `);

    if (filters?.tenant_id) {
      query = query.eq('tenant_id', filters.tenant_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.payment_status) {
      query = query.eq('payment_status', filters.payment_status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async getOrder(id: number) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('id', id)
      .single();
    return { data, error };
  },

  async createOrder(order: any) {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select();
    return { data, error };
  },

  async updateOrder(id: number, updates: any) {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  // Users
  async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    return { data, error };
  },

  async createUser(user: any) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select();
    return { data, error };
  },

  async updateUser(id: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  // Settings
  async getSetting(key: string) {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('setting_key', key)
      .single();
    return { data, error };
  },

  async getSettings() {
    const { data, error } = await supabase
      .from('settings')
      .select('*');
    return { data, error };
  },

  // Real-time subscriptions
  subscribeToOrders(callback: (payload: any) => void) {
    return supabase
      .on('*', { event: '*', schema: 'public', table: 'orders' }, callback)
      .subscribe();
  },

  subscribeToTenants(callback: (payload: any) => void) {
    return supabase
      .on('*', { event: '*', schema: 'public', table: 'tenants' }, callback)
      .subscribe();
  },
};

export default supabase;

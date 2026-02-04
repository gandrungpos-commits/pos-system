// Supabase client and utilities
export { supabase, auth, db } from './supabase';

// Auth context and hook
export { AuthProvider, useAuth } from './auth-context';

// Types
export type { User as AuthUser } from './auth-context';

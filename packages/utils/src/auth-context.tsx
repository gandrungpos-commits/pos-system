import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, auth } from './supabase';

interface User {
  id: string;
  email?: string;
  role?: string;
  tenant_id?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if demo mode is enabled
    const demoMode = localStorage.getItem('pos_demo_mode');
    if (demoMode === 'true') {
      const demoUser = localStorage.getItem('pos_demo_user');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
      }
      setLoading(false);
      return;
    }

    // Check current session
    const checkSession = async () => {
      try {
        const session = await auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session check error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data } = auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      if (data?.subscription) {
        data.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await auth.signIn(email, password);
    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await auth.signUp(email, password);
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    // Clear demo mode if enabled
    localStorage.removeItem('pos_demo_mode');
    localStorage.removeItem('pos_demo_user');
    localStorage.removeItem('demo_mode');
    localStorage.removeItem('demo_user');
    
    try {
      const { error } = await auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Signout error:', err);
    }
    
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

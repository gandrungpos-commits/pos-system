import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAPIClient } from '@pos/api-client';
import type { User, AuthResponse } from '@pos/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: false,
    error: null,
  });

  const apiClient = getAPIClient();

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponse | null> => {
      setState({ user: null, loading: true, error: null });
      try {
        const response = await apiClient.login(email, password);
        setState({ user: response.user, loading: false, error: null });
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        setState({ user: null, loading: false, error: errorMessage });
        return null;
      }
    },
    [apiClient]
  );

  const register = useCallback(
    async (payload: any): Promise<AuthResponse | null> => {
      setState({ user: null, loading: true, error: null });
      try {
        const response = await apiClient.register(payload);
        setState({ user: response.user, loading: false, error: null });
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Registration failed';
        setState({ user: null, loading: false, error: errorMessage });
        return null;
      }
    },
    [apiClient]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
      setState({ user: null, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setState({ user: null, loading: false, error: errorMessage });
    }
  }, [apiClient]);

  const getCurrentUser = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const user = await apiClient.getCurrentUser();
      setState({ user, loading: false, error: null });
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
      setState({ user: null, loading: false, error: errorMessage });
      return null;
    }
  }, [apiClient]);

  return {
    ...state,
    login,
    register,
    logout,
    getCurrentUser,
  };
}

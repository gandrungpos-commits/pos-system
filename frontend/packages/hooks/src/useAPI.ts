import { useCallback, useState } from 'react';
import { getAPIClient } from '@pos/api-client';
import type { ApiResponse } from '@pos/types';

interface UseAPIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAPI<T>() {
  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const apiClient = getAPIClient();

  const request = useCallback(
    async (url: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET', payload?: any): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });
      try {
        let response: any;
        switch (method) {
          case 'POST':
            response = await apiClient.axios.post<ApiResponse<T>>(url, payload);
            break;
          case 'PATCH':
            response = await apiClient.axios.patch<ApiResponse<T>>(url, payload);
            break;
          case 'DELETE':
            response = await apiClient.axios.delete<ApiResponse<T>>(url);
            break;
          case 'GET':
          default:
            response = await apiClient.axios.get<ApiResponse<T>>(url);
        }

        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'API request failed';
        setState({ data: null, loading: false, error: errorMessage });
        return null;
      }
    },
    [apiClient]
  );

  return {
    ...state,
    request,
  };
}

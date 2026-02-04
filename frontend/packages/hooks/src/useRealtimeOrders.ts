import { useEffect, useState, useCallback } from 'react';
import { getAPIClient } from '@pos/api-client';
import type { Order } from '@pos/types';

interface RealtimeOrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
}

export function useRealtimeOrders() {
  const [state, setState] = useState<RealtimeOrdersState>({
    orders: [],
    loading: true,
    error: null,
    isConnected: false,
  });

  const apiClient = getAPIClient();

  useEffect(() => {
    const socket = apiClient.connectSocket();

    socket.on('connect', () => {
      setState((prev) => ({ ...prev, isConnected: true }));
    });

    socket.on('disconnect', () => {
      setState((prev) => ({ ...prev, isConnected: false }));
    });

    socket.on('order:created', (order: Order) => {
      setState((prev) => ({
        ...prev,
        orders: [order, ...prev.orders],
      }));
    });

    socket.on('order:updated', (order: Order) => {
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => (o.id === order.id ? order : o)),
      }));
    });

    socket.on('order:status:changed', ({ order_id, status }) => {
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => (o.id === order_id ? { ...o, status } : o)),
      }));
    });

    setState((prev) => ({ ...prev, loading: false }));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('order:created');
      socket.off('order:updated');
      socket.off('order:status:changed');
    };
  }, [apiClient]);

  const updateOrderStatus = useCallback(
    (orderId: string, status: Order['status']) => {
      apiClient.emitSocketEvent('order:update:request', {
        order_id: orderId,
        status,
      });
    },
    [apiClient]
  );

  return {
    ...state,
    updateOrderStatus,
  };
}

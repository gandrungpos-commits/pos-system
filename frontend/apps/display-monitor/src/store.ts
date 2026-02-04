import { create } from 'zustand';
import type { Order } from '@pos/types';

interface DisplayStore {
  orders: Order[];
  readyOrders: Order[];
  completedOrders: Order[];
  isKioskMode: boolean;
  
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addReadyOrder: (order: Order) => void;
  completeOrder: (orderId: string) => void;
  setKioskMode: (enabled: boolean) => void;
}

export const useDisplayStore = create<DisplayStore>((set) => ({
  orders: [],
  readyOrders: [],
  completedOrders: [],
  isKioskMode: true,
  
  addOrder: (order) =>
    set((state) => ({
      orders: [...state.orders, order],
    })),
    
  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
    })),
    
  addReadyOrder: (order) =>
    set((state) => ({
      readyOrders: [...state.readyOrders, order],
    })),
    
  completeOrder: (orderId) =>
    set((state) => ({
      readyOrders: state.readyOrders.filter((o) => o.id !== orderId),
      completedOrders: [...state.completedOrders, ...state.readyOrders.filter((o) => o.id === orderId)],
    })),
    
  setKioskMode: (enabled) => set({ isKioskMode: enabled }),
}));

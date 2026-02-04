import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Order, OrderItem } from '@pos/types';

interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  selectedItems: OrderItem[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  selectedItems: [],
  loading: false,
  error: null,
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    removeOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter((o) => o.id !== action.payload);
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    addOrderItem: (state, action: PayloadAction<OrderItem>) => {
      const existingItem = state.selectedItems.find((item) => item.menu_id === action.payload.menu_id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.subtotal = existingItem.unit_price * existingItem.quantity;
      } else {
        state.selectedItems.push(action.payload);
      }
    },
    updateOrderItem: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.selectedItems.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        item.subtotal = item.unit_price * item.quantity;
      }
    },
    removeOrderItem: (state, action: PayloadAction<string>) => {
      state.selectedItems = state.selectedItems.filter((item) => item.id !== action.payload);
    },
    clearOrderItems: (state) => {
      state.selectedItems = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addOrder,
  updateOrder,
  removeOrder,
  setCurrentOrder,
  addOrderItem,
  updateOrderItem,
  removeOrderItem,
  clearOrderItems,
  setLoading,
  setError,
} = ordersSlice.actions;
export default ordersSlice.reducer;

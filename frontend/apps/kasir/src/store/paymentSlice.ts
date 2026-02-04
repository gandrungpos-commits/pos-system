import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Payment } from '@pos/types';

interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  loading: boolean;
  error: string | null;
  dailyTotal: number;
}

const initialState: PaymentState = {
  payments: [],
  currentPayment: null,
  loading: false,
  error: null,
  dailyTotal: 0,
};

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.push(action.payload);
      state.dailyTotal += action.payload.amount;
    },
    setCurrentPayment: (state, action: PayloadAction<Payment | null>) => {
      state.currentPayment = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setDailyTotal: (state, action: PayloadAction<number>) => {
      state.dailyTotal = action.payload;
    },
  },
});

export const { addPayment, setCurrentPayment, setLoading, setError, setDailyTotal } =
  paymentSlice.actions;
export default paymentSlice.reducer;

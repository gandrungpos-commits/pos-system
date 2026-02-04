import { create } from 'zustand';
import type { Order } from '@pos/types';

interface CustomerStore {
  currentOrder: Order | null;
  qrResult: string | null;
  isOnline: boolean;
  
  setCurrentOrder: (order: Order | null) => void;
  setQRResult: (result: string) => void;
  setOnline: (online: boolean) => void;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  currentOrder: null,
  qrResult: null,
  isOnline: navigator.onLine,
  
  setCurrentOrder: (order) => set({ currentOrder: order }),
  setQRResult: (result) => set({ qrResult: result }),
  setOnline: (online) => set({ isOnline: online }),
}));

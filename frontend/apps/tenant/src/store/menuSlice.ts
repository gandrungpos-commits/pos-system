import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MenuItem } from '@pos/types';

interface MenuState {
  items: MenuItem[];
  loading: boolean;
  error: string | null;
  selectedCategory: string;
}

const initialState: MenuState = {
  items: [],
  loading: false,
  error: null,
  selectedCategory: 'all',
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenuItems: (state, action: PayloadAction<MenuItem[]>) => {
      state.items = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setMenuItems, setSelectedCategory, setLoading, setError } = menuSlice.actions;
export default menuSlice.reducer;

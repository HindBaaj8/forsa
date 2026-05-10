// features/favorites/favoritesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Get favorites
export const getFavorites = createAsyncThunk(
  'favorites/get',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/favorites');
      // هاد هو الرابط الصحيح حسب routes/api.php
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Add favorite
export const addFavorite = createAsyncThunk(
  'favorites/add',
  async (workerId, { rejectWithValue }) => {
    try {
      const response = await api.post('/favorites', { worker_id: workerId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Remove favorite
export const removeFavorite = createAsyncThunk(
  'favorites/remove',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/favorites/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    favorites: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get
      .addCase(getFavorites.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        // هاد التصحيح مهم: استخرج البيانات من action.payload
        if (action.payload?.data?.data) {
          state.favorites = action.payload.data.data;
        } else if (Array.isArray(action.payload)) {
          state.favorites = action.payload;
        } else {
          state.favorites = [];
        }
      })
      .addCase(getFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add
      .addCase(addFavorite.fulfilled, (state, action) => {
        const newFavorite = action.payload?.data || action.payload;
        if (newFavorite && newFavorite.id) {
          state.favorites = [newFavorite, ...state.favorites];
        }
      })
      // Remove
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter(f => f.id !== action.payload);
      });
  },
});

export default favoritesSlice.reducer;
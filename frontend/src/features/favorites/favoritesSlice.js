// features/favorites/favoritesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Get favorites
export const getFavorites = createAsyncThunk(
  'favorites/get',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/client/favorites');
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
        state.favorites = action.payload.favorites;
      })
      .addCase(getFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.favorites.push(action.payload.favorite);
      })
      // Remove
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter(f => f.id !== action.payload);
      });
  },
});

export default favoritesSlice.reducer;
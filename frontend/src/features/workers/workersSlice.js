// features/workers/workersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Search workers
export const searchWorkers = createAsyncThunk(
  'workers/search',
  async ({ query, category, city }, { rejectWithValue }) => {
    try {
      const response = await api.post('/workers/search', { query, category, city });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Get filters (categories, cities)
export const getFilters = createAsyncThunk(
  'workers/filters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/workers/filters');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const workersSlice = createSlice({
  name: 'workers',
  initialState: {
    workers: [],
    filters: { categories: ['الكل'], cities: [] },
    isLoading: false,
    error: null,
  },
  reducers: {
    clearSearch: (state) => {
      state.workers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Search
      .addCase(searchWorkers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchWorkers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workers = action.payload.workers;
      })
      .addCase(searchWorkers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Filters
      .addCase(getFilters.fulfilled, (state, action) => {
        state.filters = action.payload;
      });
  },
});

export const { clearSearch } = workersSlice.actions;
export default workersSlice.reducer;
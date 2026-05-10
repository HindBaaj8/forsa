// features/worker/workersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// البحث عن عمال (لـ ClientSearch)
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

// جلب الفلاتر (لـ ClientSearch)
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
    filters: {
      categories: ['الكل', 'كهرباء', 'سباكة', 'نجارة', 'دهان', 'تنظيف', 'طبخ', 'تصميم'],
      cities: ['الدار البيضاء', 'الرباط', 'طنجة', 'مراكش', 'فاس', 'مكناس', 'أكادير'],
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    clearSearch: (state) => { state.workers = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchWorkers.pending,   (state) => { state.isLoading = true; })
      .addCase(searchWorkers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workers = action.payload?.data?.data || action.payload?.workers || [];
      })
      .addCase(searchWorkers.rejected,  (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getFilters.pending,   (state) => { state.isLoading = true; })
      .addCase(getFilters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filters = {
          categories: action.payload?.categories || state.filters.categories,
          cities:     action.payload?.cities     || state.filters.cities,
        };
      })
      .addCase(getFilters.rejected,  (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSearch } = workersSlice.actions;
export default workersSlice.reducer;
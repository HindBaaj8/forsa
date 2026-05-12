// features/services/serviceSlice.js
import { createCrudSlice } from '../../utils/createCrudSlice';
import api from '../../services/api';

// Custom thunks for service-specific operations
export const approveService = createAsyncThunk(
  'services/approve',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/services/${id}/approve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const rejectService = createAsyncThunk(
  'services/reject',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/services/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getPendingServices = createAsyncThunk(
  'services/getPending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/services/pending');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Create base CRUD slice
const { slice, thunks, actions } = createCrudSlice({
  name: 'services',
  endpoint: '/services',
  transformResponse: (data) => data,
});

// Add custom reducers
const serviceSlice = createSlice({
  ...slice,
  extraReducers: (builder) => {
    // Add base CRUD reducers
    slice.extraReducers(builder);
    
    // Add custom reducers
    builder
      .addCase(approveService.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
        }
      })
      .addCase(rejectService.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
        }
      })
      .addCase(getPendingServices.fulfilled, (state, action) => {
        state.pendingItems = action.payload.data || action.payload;
      });
  },
});

// Selectors
export const selectAllServices = (state) => state.services.items;
export const selectCurrentService = (state) => state.services.currentItem;
export const selectServicesLoading = (state) => state.services.isLoading;
export const selectServicesError = (state) => state.services.error;
export const selectServicesPagination = (state) => state.services.pagination;
export const selectPendingServices = (state) => state.services.pendingItems || [];

// Export actions and thunks
export const serviceActions = { ...actions, approveService, rejectService, getPendingServices };
export const serviceThunks = { ...thunks, approveService, rejectService, getPendingServices };

export default serviceSlice.reducer;
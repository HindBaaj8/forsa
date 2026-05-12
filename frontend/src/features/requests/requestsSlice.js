import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const getRequests = createAsyncThunk(
  'requests/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/requests', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getRequest = createAsyncThunk(
  'requests/getOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/requests/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createRequest = createAsyncThunk(
  'requests/create',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await api.post('/requests', requestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateRequest = createAsyncThunk(
  'requests/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/requests/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const cancelRequest = createAsyncThunk(
  'requests/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/requests/${id}/cancel`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteRequest = createAsyncThunk(
  'requests/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/requests/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  items: [],
  currentRequest: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  },
  isLoading: false,
  error: null,
};

const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data || action.payload;
        if (action.payload.meta) {
          state.pagination = action.payload.meta;
        }
      })
      .addCase(getRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getRequest.fulfilled, (state, action) => {
        state.currentRequest = action.payload;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateRequest.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentRequest?.id === action.payload.id) {
          state.currentRequest = action.payload;
        }
      })
      .addCase(cancelRequest.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteRequest.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
      });
  },
});

export const { clearError } = requestSlice.actions;
export default requestSlice.reducer;
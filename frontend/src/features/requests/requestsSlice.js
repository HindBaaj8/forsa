// features/requests/requestsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Get user requests
export const getUserRequests = createAsyncThunk(
  'requests/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/client/requests');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Create new request
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

// Cancel request
export const cancelRequest = createAsyncThunk(
  'requests/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/requests/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const requestsSlice = createSlice({
  name: 'requests',
  initialState: {
    requests: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get all
      .addCase(getUserRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload.requests;
      })
      .addCase(getUserRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createRequest.fulfilled, (state, action) => {
        state.requests.unshift(action.payload.request);
      })
      // Cancel
      .addCase(cancelRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(r => r.id !== action.payload.id);
      });
  },
});

export default requestsSlice.reducer;
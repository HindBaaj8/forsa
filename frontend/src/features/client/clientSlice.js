// features/client/clientSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ══ Dashboard ══
export const getDashboard = createAsyncThunk(
  'client/dashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/client/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ══ Requests ══
export const getClientRequests = createAsyncThunk(
  'client/getRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/client/requests');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createRequest = createAsyncThunk(
  'client/createRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await api.post('/requests', requestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'حدث خطأ');
    }
  }
);

export const cancelRequest = createAsyncThunk(
  'client/cancelRequest',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/requests/${id}/status`, { status: 'cancelled' });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ══ Profile ══
export const updateProfile = createAsyncThunk(
  'client/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/user/profile', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ══ Notifications ══
export const updateNotifications = createAsyncThunk(
  'client/updateNotifications',
  async (notifications, { rejectWithValue }) => {
    try {
      const response = await api.put('/user/notifications', notifications);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const clientSlice = createSlice({
  name: 'client',
  initialState: {
    dashboard: {
      stats: { activeRequests: 0, completedRequests: 0, totalSpent: 0, favorites: 0 },
      recentRequests: [],
      featuredWorkers: [],
    },
    requests: [],
    profile: null,
    notifications: { requests: true, messages: true, offers: false },
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(getDashboard.pending,   (state) => { state.isLoading = true; })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(getDashboard.rejected,  (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Requests
      .addCase(getClientRequests.pending,   (state) => { state.isLoading = true; })
      .addCase(getClientRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        // Laravel paginate كيرجع data فـ .data
        state.requests = action.payload.data?.data || action.payload.data || [];
      })
      .addCase(getClientRequests.rejected,  (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Request
      .addCase(createRequest.fulfilled, (state, action) => {
        const newReq = action.payload.data;
        state.requests = [newReq, ...state.requests];
      })

      // Cancel Request
      .addCase(cancelRequest.fulfilled, (state, action) => {
        const updated = action.payload.data;
        state.requests = state.requests.map(r =>
          r.id === updated.id ? updated : r
        );
      })

      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload.user;
      })

      // Update Notifications
      .addCase(updateNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications;
      });
  },
});

export default clientSlice.reducer;
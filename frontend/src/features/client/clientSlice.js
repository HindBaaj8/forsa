// features/client/clientSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Get dashboard data
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

// Update profile
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

// Update notifications settings
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
    profile: null,
    notifications: { requests: true, messages: true, offers: false },
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(getDashboard.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(getDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
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
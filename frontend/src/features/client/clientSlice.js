// src/features/client/clientSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Dashboard
export const getClientDashboard = createAsyncThunk(
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

// Requests
export const getClientRequests = createAsyncThunk(
  'client/getRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/requests');
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
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const cancelRequest = createAsyncThunk(
  'client/cancelRequest',
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
  'client/deleteRequest',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/requests/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Profile
export const updateProfile = createAsyncThunk(
  'client/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/me', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

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

// Favorites
export const getFavorites = createAsyncThunk(
  'client/getFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/favorites');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const removeFavorite = createAsyncThunk(
  'client/removeFavorite',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/favorites/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Search
export const searchWorkers = createAsyncThunk(
  'client/searchWorkers',
  async ({ query, category, city }, { rejectWithValue }) => {
    try {
      const response = await api.post('/workers/search', { query, category, city });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getFilters = createAsyncThunk(
  'client/getFilters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/workers/filters');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Change Password
export const changePassword = createAsyncThunk(
  'client/changePassword',
  async ({ current_password, new_password, confirm_password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/change-password', {
        current_password,
        new_password,
        new_password_confirmation: confirm_password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  dashboard: {
    stats: { activeRequests: 0, completedRequests: 0, totalSpent: 0, favorites: 0 },
    recentRequests: [],
    featuredServices: [],
  },
  requests: [],
  favorites: [],
  workers: [],
  filters: { categories: [], cities: [] },
  profile: null,
  notifications: { requests: true, messages: true, offers: false },
  isLoading: false,
  error: null,
};

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(getClientDashboard.pending, (state) => { state.isLoading = true; })
      .addCase(getClientDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload || initialState.dashboard;
      })
      .addCase(getClientDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Requests
      .addCase(getClientRequests.pending, (state) => { state.isLoading = true; })
      .addCase(getClientRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload?.data || action.payload || [];
      })
      .addCase(getClientRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.requests.unshift(action.payload);
      })
      .addCase(cancelRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex(r => r.id === action.payload.id);
        if (index !== -1) state.requests[index] = action.payload;
      })
      .addCase(deleteRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(r => r.id !== action.payload);
      })
      // Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      // Favorites
      .addCase(getFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload?.data || action.payload || [];
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter(f => f.id !== action.payload);
      })
      // Search
      .addCase(searchWorkers.fulfilled, (state, action) => {
        state.workers = action.payload?.data || action.payload || [];
      })
      .addCase(getFilters.fulfilled, (state, action) => {
        state.filters = action.payload || state.filters;
      });
  },
});

export const { clearError } = clientSlice.actions;
export default clientSlice.reducer;
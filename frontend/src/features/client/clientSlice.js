// src/features/client/clientSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Dashboard - ✅ تصحيح: استعمل /requests بدل /client/dashboard
export const getClientDashboard = createAsyncThunk(
  'client/dashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/requests');
      return {
        stats: {
          activeRequests: response.data?.data?.filter(r => r.status === 'pending').length || 0,
          completedRequests: response.data?.data?.filter(r => r.status === 'completed').length || 0,
          totalSpent: 0,
          favorites: 0,
        },
        recentRequests: response.data?.data?.slice(0, 5) || [],
        featuredServices: [],
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Requests - ✅ صحيح
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

// Create Request - ✅ صحيح
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

// Cancel Request - ✅ صحيح
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

// Delete Request - ✅ صحيح
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

// Update Profile - ⚠️ تصحيح: استعمل POST بدل PUT
export const updateProfile = createAsyncThunk(
  'client/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/me', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Update Notifications - ⚠️ مؤقتاً علق
export const updateNotifications = createAsyncThunk(
  'client/updateNotifications',
  async (notifications, { rejectWithValue }) => {
    try {
      // TODO: أضف route فـ Backend
      return notifications;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Favorites - ✅ صحيح (إذا عندك routes favorites فـ Backend)
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

// Search Workers - ⚠️ تصحيح: استعمل /services
export const searchWorkers = createAsyncThunk(
  'client/searchWorkers',
  async ({ query, category, city }, { rejectWithValue }) => {
    try {
      const response = await api.get('/services', { 
        params: { search: query, category_id: category, city } 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Get Filters - ⚠️ تصحيح: جلب من /categories
export const getFilters = createAsyncThunk(
  'client/getFilters',
  async (_, { rejectWithValue }) => {
    try {
      const [categoriesRes, servicesRes] = await Promise.all([
        api.get('/categories'),
        api.get('/services')
      ]);
      return {
        categories: categoriesRes.data.map(c => c.name),
        cities: [...new Set(servicesRes.data?.data?.map(s => s.location) || [])]
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Change Password - ⚠️ مؤقتاً
export const changePassword = createAsyncThunk(
  'client/changePassword',
  async ({ current_password, new_password, confirm_password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/change-password', {
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
        // تحديث user فـ localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...user, ...action.payload }));
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
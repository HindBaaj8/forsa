import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Dashboard Stats
export const getDashboardStats = createAsyncThunk(
  'admin/getDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Users Management
export const getUsers = createAsyncThunk(
  'admin/getUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const banUser = createAsyncThunk(
  'admin/banUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/users/${userId}/ban`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const activateUser = createAsyncThunk(
  'admin/activateUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/users/${userId}/activate`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Pending Services
export const getPendingServices = createAsyncThunk(
  'admin/getPendingServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/services/pending');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Reports
export const getReports = createAsyncThunk(
  'admin/getReports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/reports');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const resolveReport = createAsyncThunk(
  'admin/resolveReport',
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/reports/${reportId}/resolve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  dashboard: {
    stats: {
      totalUsers: 0,
      totalWorkers: 0,
      totalClients: 0,
      totalOrders: 0,
      totalRevenue: 0,
    },
    recentOrders: [],
  },
  users: {
    items: [],
    pagination: {},
  },
  pendingServices: [],
  reports: [],
  isLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.dashboard.stats = action.payload.stats || state.dashboard.stats;
        state.dashboard.recentOrders = action.payload.recentOrders || [];
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users.items = action.payload.data || action.payload;
        if (action.payload.meta) {
          state.users.pagination = action.payload.meta;
        }
      })
      .addCase(banUser.fulfilled, (state, action) => {
        const index = state.users.items.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users.items[index] = action.payload;
        }
      })
      .addCase(activateUser.fulfilled, (state, action) => {
        const index = state.users.items.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users.items[index] = action.payload;
        }
      })
      .addCase(getPendingServices.fulfilled, (state, action) => {
        state.pendingServices = action.payload.data || action.payload;
      })
      .addCase(getReports.fulfilled, (state, action) => {
        state.reports = action.payload.data || action.payload;
      })
      .addCase(resolveReport.fulfilled, (state, action) => {
        const index = state.reports.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
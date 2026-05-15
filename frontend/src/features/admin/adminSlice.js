// src/features/admin/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Dashboard Stats
export const getAdminDashboard = createAsyncThunk(
  'admin/getDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

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

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Workers Management
export const getWorkers = createAsyncThunk(
  'admin/getWorkers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/workers');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const approveWorker = createAsyncThunk(
  'admin/approveWorker',
  async (workerId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/workers/${workerId}/approve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const banWorker = createAsyncThunk(
  'admin/banWorker',
  async (workerId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/workers/${workerId}/ban`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteWorker = createAsyncThunk(
  'admin/deleteWorker',
  async (workerId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/workers/${workerId}`);
      return workerId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Requests Management
export const getRequests = createAsyncThunk(
  'admin/getRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/requests');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateRequestStatus = createAsyncThunk(
  'admin/updateRequestStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/requests/${id}`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteRequest = createAsyncThunk(
  'admin/deleteRequest',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/requests/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Categories Management
export const getCategories = createAsyncThunk(
  'admin/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/categories');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  'admin/createCategory',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/categories', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'admin/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/categories/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'admin/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const toggleCategory = createAsyncThunk(
  'admin/toggleCategory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/categories/${id}/toggle`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Finance
export const getFinanceStats = createAsyncThunk(
  'admin/getFinanceStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/finance');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Alerts
export const getAlerts = createAsyncThunk(
  'admin/getAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/alerts');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markAlertRead = createAsyncThunk(
  'admin/markAlertRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/alerts/${id}/read`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteAlert = createAsyncThunk(
  'admin/deleteAlert',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/alerts/${id}`);
      return id;
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
      totalServices: 0,
      totalRequests: 0,
      pendingRequests: 0,
      completedOrders: 0,
      totalRevenue: 0,
    },
    recentUsers: [],
    recentRequests: [],
  },
  users: [],
  workers: [],
  requests: [],
  categories: [],
  finance: {
    totalRevenue: 0,
    paidToWorkers: 0,
    netProfit: 0,
    transactions: [],
  },
  alerts: [],
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
      // Dashboard
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.dashboard.stats = action.payload.stats || state.dashboard.stats;
        state.dashboard.recentUsers = action.payload.recentUsers || [];
        state.dashboard.recentRequests = action.payload.recentRequests || [];
      })
      .addCase(getAdminDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload || state.dashboard;
      })
      // Users
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload.data || action.payload || [];
      })
      .addCase(banUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
      })
      .addCase(activateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      // Workers
      .addCase(getWorkers.fulfilled, (state, action) => {
        state.workers = action.payload.data || action.payload || [];
      })
      .addCase(approveWorker.fulfilled, (state, action) => {
        const index = state.workers.findIndex(w => w.id === action.payload.id);
        if (index !== -1) state.workers[index] = action.payload;
      })
      .addCase(banWorker.fulfilled, (state, action) => {
        const index = state.workers.findIndex(w => w.id === action.payload.id);
        if (index !== -1) state.workers[index] = action.payload;
      })
      .addCase(deleteWorker.fulfilled, (state, action) => {
        state.workers = state.workers.filter(w => w.id !== action.payload);
      })
      // Requests
      .addCase(getRequests.fulfilled, (state, action) => {
        state.requests = action.payload.data || action.payload || [];
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const index = state.requests.findIndex(r => r.id === action.payload.id);
        if (index !== -1) state.requests[index] = action.payload;
      })
      .addCase(deleteRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(r => r.id !== action.payload);
      })
      // Categories
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data || action.payload || [];
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.categories[index] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c.id !== action.payload);
      })
      .addCase(toggleCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.categories[index] = action.payload;
      })
      // Finance
      .addCase(getFinanceStats.fulfilled, (state, action) => {
        state.finance = action.payload || state.finance;
      })
      // Alerts
      .addCase(getAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload.data || action.payload || [];
      })
      .addCase(markAlertRead.fulfilled, (state, action) => {
        const index = state.alerts.findIndex(a => a.id === action.payload.id);
        if (index !== -1) state.alerts[index] = action.payload;
      })
      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.alerts = state.alerts.filter(a => a.id !== action.payload);
      })
      // Pending Services
      .addCase(getPendingServices.fulfilled, (state, action) => {
        state.pendingServices = action.payload.data || action.payload || [];
      })
      // Reports
      .addCase(getReports.fulfilled, (state, action) => {
        state.reports = action.payload.data || action.payload || [];
      })
      .addCase(resolveReport.fulfilled, (state, action) => {
        const index = state.reports.findIndex(r => r.id === action.payload.id);
        if (index !== -1) state.reports[index] = action.payload;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
// features/admin/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ============= Dashboard =============
export const getAdminDashboard = createAsyncThunk(
  'admin/getAdminDashboard',
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
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ============= Users =============
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
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ============= Workers =============
export const getWorkers = createAsyncThunk(
  'admin/getWorkers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/workers', { params });
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
      const response = await api.delete(`/admin/workers/${workerId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ============= Services =============
export const getServices = createAsyncThunk(
  'admin/getServices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/services', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const approveService = createAsyncThunk(
  'admin/approveService',
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/services/${serviceId}/approve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const rejectService = createAsyncThunk(
  'admin/rejectService',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/services/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteService = createAsyncThunk(
  'admin/deleteService',
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/services/${serviceId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ============= Categories =============
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
      const response = await api.delete(`/admin/categories/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ============= Requests =============
export const getRequests = createAsyncThunk(
  'admin/getRequests',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/requests', { params });
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
      const response = await api.put(`/admin/requests/${id}/status`, { status });
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
      const response = await api.delete(`/admin/requests/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ============= Finance =============
export const getFinanceStats = createAsyncThunk(
  'admin/getFinanceStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/finance', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ============= Alerts =============
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

export const resolveAlert = createAsyncThunk(
  'admin/resolveAlert',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/alerts/${id}/resolve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ============= Reports =============
export const getReports = createAsyncThunk(
  'admin/getReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/reports', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const resolveReport = createAsyncThunk(
  'admin/resolveReport',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/reports/${id}/resolve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ============= Pending Services =============
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

const initialState = {
  dashboardStats: null,
  users: [],
  workers: [],
  services: [],
  categories: [],
  requests: [],
  alerts: [],
  reports: [],
  financeStats: null,
  pendingServices: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  },
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
      .addCase(getAdminDashboard.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
      })
      // Users
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload?.data || [];
        state.pagination = action.payload?.meta || state.pagination;
      })
      // Workers
      .addCase(getWorkers.fulfilled, (state, action) => {
        state.workers = action.payload?.data || [];
        state.pagination = action.payload?.meta || state.pagination;
      })
      // Services
      .addCase(getServices.fulfilled, (state, action) => {
        state.services = action.payload?.data || [];
      })
      // Categories
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload?.data || [];
      })
      // Requests
      .addCase(getRequests.fulfilled, (state, action) => {
        state.requests = action.payload?.data || [];
      })
      // Finance
      .addCase(getFinanceStats.fulfilled, (state, action) => {
        state.financeStats = action.payload;
      })
      // Alerts
      .addCase(getAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload?.data || [];
      })
      // Reports
      .addCase(getReports.fulfilled, (state, action) => {
        state.reports = action.payload?.data || [];
      })
      // Pending Services
      .addCase(getPendingServices.fulfilled, (state, action) => {
        state.pendingServices = action.payload?.data || [];
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
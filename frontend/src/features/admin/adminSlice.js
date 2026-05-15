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
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.dashboard.stats = action.payload.stats || state.dashboard.stats;
        state.dashboard.recentOrders = action.payload.recentOrders || [];
      })
      // Users
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
      // Reports
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
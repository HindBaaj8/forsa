// features/worker/workerSlice.js - نسخة معدلة قليلاً
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Dashboard
export const getWorkerDashboard = createAsyncThunk(
  'worker/dashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/worker/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Orders
export const getWorkerOrders = createAsyncThunk(
  'worker/orders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/worker/orders');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const acceptOrder = createAsyncThunk(
  'worker/acceptOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${id}/accept`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const startOrder = createAsyncThunk(
  'worker/startOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${id}/start`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const completeOrder = createAsyncThunk(
  'worker/completeOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${id}/complete`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'worker/cancelOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Services
export const getWorkerServices = createAsyncThunk(
  'worker/services',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/worker/services');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createService = createAsyncThunk(
  'worker/createService',
  async (serviceData, { rejectWithValue }) => {
    try {
      const response = await api.post('/services', serviceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateService = createAsyncThunk(
  'worker/updateService',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/services/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteService = createAsyncThunk(
  'worker/deleteService',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/services/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Schedule
export const getWorkerSchedule = createAsyncThunk(
  'worker/schedule',
  async ({ date, view }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/worker/schedule?date=${date}&view=${view}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateScheduleStatus = createAsyncThunk(
  'worker/updateScheduleStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/worker/schedule/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Earnings
export const getWorkerEarnings = createAsyncThunk(
  'worker/earnings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/worker/earnings');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Profile
export const updateWorkerProfile = createAsyncThunk(
  'worker/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/worker/profile', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Settings
export const updateWorkerNotifications = createAsyncThunk(
  'worker/updateNotifications',
  async (notifications, { rejectWithValue }) => {
    try {
      const response = await api.put('/worker/notifications', notifications);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const workerSlice = createSlice({
  name: 'worker',
  initialState: {
    dashboard: { stats: {}, recentOrders: [], topServices: [] },
    orders: [],
    services: [],
    schedule: { appointments: [], stats: {} },
    earnings: { stats: {}, transactions: [] },
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(getWorkerDashboard.pending, (state) => { state.isLoading = true; })
      .addCase(getWorkerDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(getWorkerDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Orders
      .addCase(getWorkerOrders.pending, (state) => { state.isLoading = true; })
      .addCase(getWorkerOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload?.data?.data || action.payload?.orders || [];
      })
      .addCase(getWorkerOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        const updated = action.payload?.data || action.payload;
        if (updated) {
          state.orders = state.orders.map(o => o.id === updated.id ? updated : o);
        }
      })
      .addCase(startOrder.fulfilled, (state, action) => {
        const updated = action.payload?.data || action.payload;
        if (updated) {
          state.orders = state.orders.map(o => o.id === updated.id ? updated : o);
        }
      })
      .addCase(completeOrder.fulfilled, (state, action) => {
        const updated = action.payload?.data || action.payload;
        if (updated) {
          state.orders = state.orders.map(o => o.id === updated.id ? updated : o);
        }
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const updated = action.payload?.data || action.payload;
        if (updated) {
          state.orders = state.orders.map(o => o.id === updated.id ? updated : o);
        }
      })
      // Services
      .addCase(getWorkerServices.pending, (state) => { state.isLoading = true; })
      .addCase(getWorkerServices.fulfilled, (state, action) => {
        state.isLoading = false;
        // ✅ تصحيح استخراج البيانات
        if (action.payload?.data?.data) {
          state.services = action.payload.data.data;
        } else if (action.payload?.services) {
          state.services = action.payload.services;
        } else {
          state.services = [];
        }
      })
      .addCase(getWorkerServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ✅ Create Service - إضافة مباشرة
      .addCase(createService.pending, (state) => { state.isLoading = true; })
      .addCase(createService.fulfilled, (state, action) => {
        state.isLoading = false;
        const newService = action.payload?.data || action.payload;
        if (newService && newService.id) {
          // ✅ إضافة الخدمة الجديدة في البداية (بدون انتظار API)
          state.services = [newService, ...state.services];
        }
      })
      .addCase(createService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Service
      .addCase(updateService.fulfilled, (state, action) => {
        const updated = action.payload?.data || action.payload;
        if (updated && updated.id) {
          state.services = state.services.map(s => s.id === updated.id ? updated : s);
        }
      })
      // Delete Service
      .addCase(deleteService.fulfilled, (state, action) => {
        state.services = state.services.filter(s => s.id !== action.payload);
      })
      // Schedule
      .addCase(getWorkerSchedule.fulfilled, (state, action) => {
        state.schedule = action.payload;
      })
      // Earnings
      .addCase(getWorkerEarnings.fulfilled, (state, action) => {
        state.earnings = action.payload;
      });
  },
});

export default workerSlice.reducer;
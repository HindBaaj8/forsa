// src/features/worker/workerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { updateUser } from '../auth/authSlice';

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
export const getWorkerDashboard = createAsyncThunk(
  'worker/dashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/worker/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load dashboard');
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════
export const getWorkerServices = createAsyncThunk(
  'worker/getServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/worker/services');
      const services = response.data?.services || [];
      return services;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load services');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to create service');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to update service');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to delete service');
    }
  }
);

export const toggleService = createAsyncThunk(
  'worker/toggleService',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/services/${id}/toggle`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle service');
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════════
export const getWorkerOrders = createAsyncThunk(
  'worker/getOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/worker/orders');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load orders');
    }
  }
);

export const acceptOrder = createAsyncThunk(
  'worker/acceptOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${id}/accept`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept order');
    }
  }
);

export const rejectOrder = createAsyncThunk(
  'worker/rejectOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${id}/reject`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject order');
    }
  }
);

export const startOrder = createAsyncThunk(
  'worker/startOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${id}/start`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start order');
    }
  }
);

export const completeOrder = createAsyncThunk(
  'worker/completeOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${id}/complete`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete order');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'worker/cancelOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// REQUESTS (طلبات العملاء)
// ═══════════════════════════════════════════════════════════════
export const getWorkerRequests = createAsyncThunk(
  'worker/getWorkerRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/worker/requests');
      console.log('📦 API Response getWorkerRequests:', response.data);
      const requests = response.data?.requests || response.data?.data || [];
      console.log('✅ Extracted requests:', requests.length);
      return requests;
    } catch (error) {
      console.error('❌ Error getWorkerRequests:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to load requests');
    }
  }
);

export const submitOfferOnRequest = createAsyncThunk(
  'worker/submitOfferOnRequest',
  async ({ requestId, price, duration, message }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/worker/requests/${requestId}/offer`, {
        price,
        duration,
        message
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit offer');
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// EARNINGS
// ═══════════════════════════════════════════════════════════════
export const getWorkerEarnings = createAsyncThunk(
  'worker/getEarnings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/worker/earnings');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load earnings');
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// SCHEDULE
// ═══════════════════════════════════════════════════════════════
export const getWorkerSchedule = createAsyncThunk(
  'worker/getSchedule',
  async ({ date, view } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/worker/schedule', { params: { date, view } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load schedule');
    }
  }
);

export const updateScheduleStatus = createAsyncThunk(
  'worker/updateScheduleStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/worker/schedule/${id}`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update schedule');
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
export const updateWorkerNotifications = createAsyncThunk(
  'worker/updateNotifications',
  async (notifications, { rejectWithValue }) => {
    try {
      const response = await api.put('/worker/notifications', notifications);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update notifications');
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════════
export const updateWorkerProfile = createAsyncThunk(
  'worker/updateProfile',
  async (profileData, { dispatch, rejectWithValue }) => {
    try {
      let config = { headers: { 'Accept': 'application/json' } };
      const isFormData = profileData instanceof FormData;
      if (isFormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      } else {
        config.headers['Content-Type'] = 'application/json';
      }
      const response = await api.put('/worker/profile', profileData, config);
      const updatedUser = response.data.data || response.data;
      if (updatedUser && dispatch) {
        dispatch(updateUser(updatedUser));
      }
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newUser = { ...currentUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));
      return response.data;
    } catch (error) {
      const errors = error.response?.data?.errors;
      const message = errors ? Object.values(errors).flat()[0] : error.response?.data?.message || 'Failed to update profile';
      return rejectWithValue(message);
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════════════
const initialState = {
  dashboard: {
    stats: {
      totalEarnings: 0,
      totalServices: 0,
      completedOrders: 0,
      rating: 0,
    },
    recentOrders: [],
    upcomingAppointments: [],
  },
  services: [],
  orders: [],
  requests: [],
  earnings: {
    stats: {
      totalEarnings: 0,
      monthlyEarnings: 0,
      completedOrders: 0,
      pendingAmount: 0,
    },
    transactions: [],
  },
  schedule: {
    appointments: [],
  },
  profile: null,
  notifications: {
    new_orders: true,
    messages: true,
    newsletter: false,
  },
  isLoading: false,
  error: null,
};

// ═══════════════════════════════════════════════════════════════
// SLICE
// ═══════════════════════════════════════════════════════════════
const workerSlice = createSlice({
  name: 'worker',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearServices: (state) => {
      state.services = [];
    },
    clearOrders: (state) => {
      state.orders = [];
    },
    clearRequests: (state) => {
      state.requests = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // DASHBOARD
      .addCase(getWorkerDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWorkerDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload || initialState.dashboard;
      })
      .addCase(getWorkerDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // SERVICES
      .addCase(getWorkerServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWorkerServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getWorkerServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.services.unshift(action.payload);
      })
      .addCase(updateService.fulfilled, (state, action) => {
        const index = state.services.findIndex(s => s.id === action.payload.id);
        if (index !== -1) state.services[index] = action.payload;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.services = state.services.filter(s => s.id !== action.payload);
      })
      .addCase(toggleService.fulfilled, (state, action) => {
        const index = state.services.findIndex(s => s.id === action.payload.id);
        if (index !== -1) state.services[index] = action.payload;
      })
      // ORDERS
      .addCase(getWorkerOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWorkerOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload?.orders || action.payload?.data || [];
      })
      .addCase(getWorkerOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) state.orders[index] = action.payload;
      })
      .addCase(rejectOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(o => o.id !== action.payload.id);
      })
      .addCase(startOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) state.orders[index] = action.payload;
      })
      .addCase(completeOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) state.orders[index] = action.payload;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) state.orders[index] = action.payload;
      })
      // REQUESTS (طلبات العملاء)
      .addCase(getWorkerRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWorkerRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = Array.isArray(action.payload) ? action.payload : [];
        console.log('✅ State requests updated:', state.requests.length);
      })
      .addCase(getWorkerRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.requests = [];
      })
      // SUBMIT OFFER
      .addCase(submitOfferOnRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitOfferOnRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.requests.findIndex(r => r.id === action.payload.request_id);
        if (index !== -1) {
          state.requests[index] = {
            ...state.requests[index],
            my_offer: action.payload,
            status: 'offer_sent'
          };
        }
        console.log('✅ Offer submitted successfully');
      })
      .addCase(submitOfferOnRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // EARNINGS
      .addCase(getWorkerEarnings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWorkerEarnings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.earnings = action.payload || initialState.earnings;
      })
      .addCase(getWorkerEarnings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // SCHEDULE
      .addCase(getWorkerSchedule.fulfilled, (state, action) => {
        state.schedule = action.payload || initialState.schedule;
      })
      .addCase(updateScheduleStatus.fulfilled, (state, action) => {
        const index = state.schedule.appointments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) state.schedule.appointments[index] = action.payload;
      })
      // PROFILE
      .addCase(updateWorkerProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(updateWorkerProfile.rejected, (state, action) => {
        state.error = action.payload;
      })
      // NOTIFICATIONS
      .addCase(updateWorkerNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload || state.notifications;
      });
  },
});

export const { clearError, clearServices, clearOrders, clearRequests } = workerSlice.actions;
export default workerSlice.reducer;
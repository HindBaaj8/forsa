// src/features/notifications/notificationsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getNotifications = createAsyncThunk(
  'notifications/getAll',
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications', { params: { page } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/unread-count');
      // 🔥 التأكد من إرجاع العدد الصحيح
      return response.data?.count || response.data || 0;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/notifications/read-all');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  items: [],
  unreadCount: 0,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  },
  isLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    receiveNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload?.data || [];
        if (action.payload?.meta) {
          state.pagination = action.payload.meta;
        }
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.items = [];
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        // 🔥 التأكد من أن القيمة رقم
        state.unreadCount = typeof action.payload === 'number' ? action.payload : (action.payload?.count || 0);
      })
      .addCase(getUnreadCount.rejected, (state) => {
        state.unreadCount = 0;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notificationId = action.meta.arg;
        const index = state.items.findIndex(i => i.id === notificationId);
        if (index !== -1) {
          state.items[index].read_at = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(item => {
          item.read_at = new Date().toISOString();
        });
        state.unreadCount = 0;
      });
  },
});

export const { clearError, receiveNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
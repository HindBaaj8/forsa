// src/features/notifications/notificationsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ========== ASYNC THUNKS ==========

export const getNotifications = createAsyncThunk(
  'notifications/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load notifications');
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get unread count');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/notifications/read-all');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

export const receiveNotification = createAsyncThunk(
  'notifications/receive',
  async (notification) => notification
);

// ========== INITIAL STATE ==========

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

// ========== SLICE ==========

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
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
        if (action.payload?.data) {
          state.items = action.payload.data;
          if (action.payload.meta) {
            state.pagination = action.payload.meta;
          }
        } else if (Array.isArray(action.payload)) {
          state.items = action.payload;
        } else {
          state.items = [];
        }
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.items = [];
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload?.count || action.payload || 0;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = action.payload?.data || action.payload;
        if (notification?.id) {
          const index = state.items.findIndex(n => n.id === notification.id);
          if (index !== -1 && !state.items[index].is_read) {
            state.items[index] = { ...state.items[index], is_read: true };
            if (state.unreadCount > 0) state.unreadCount -= 1;
          }
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items = state.items.map(n => ({ ...n, is_read: true }));
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const deletedId = action.payload;
        const deletedItem = state.items.find(n => n.id === deletedId);
        if (deletedItem && !deletedItem.is_read && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
        state.items = state.items.filter(n => n.id !== deletedId);
      })
      .addCase(receiveNotification.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.unreadCount += 1;
      });
  },
});

// ========== ACTIONS ==========

export const { 
  clearError, 
  clearNotifications, 
  addNotification, 
  setUnreadCount 
} = notificationsSlice.actions;

// ========== SELECTORS ==========

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state) => state.notifications.isLoading;
export const selectNotificationsError = (state) => state.notifications.error;
export const selectNotificationsPagination = (state) => state.notifications.pagination;
export const selectHasUnreadNotifications = (state) => state.notifications.unreadCount > 0;
export const selectLatestNotification = (state) => state.notifications.items[0] || null;
export const selectNotificationById = (state, id) => state.notifications.items.find(n => n.id === id);

// ========== DEFAULT EXPORT ==========

export default notificationsSlice.reducer;
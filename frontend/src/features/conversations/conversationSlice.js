// src/features/conversations/conversationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getConversations = createAsyncThunk(
  'conversations/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/conversations');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getConversation = createAsyncThunk(
  'conversations/getOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/conversations/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getConversationByOrder = createAsyncThunk(
  'conversations/getByOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/conversations/by-order/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  conversations: [],
  currentConversation: null,
  unreadCounts: {},
  isLoading: false,
  error: null,
};

const conversationSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    updateUnreadCount: (state, action) => {
      const { conversationId, count } = action.payload;
      state.unreadCounts[conversationId] = count;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload?.data || action.payload || [];      })
      .addCase(getConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getConversation.fulfilled, (state, action) => {
        state.currentConversation = action.payload;
      })
      .addCase(getConversationByOrder.fulfilled, (state, action) => {
        state.currentConversation = action.payload;
      });
  },
});

export const { clearError, setCurrentConversation, updateUnreadCount } = conversationSlice.actions;
export default conversationSlice.reducer; // ✅ هذا مهم!
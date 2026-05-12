// src/features/messages/messageSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getConversations = createAsyncThunk(
  'messages/getConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/conversations');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getMessages = createAsyncThunk(
  'messages/getMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`);
      return { conversationId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/send',
  async ({ conversationId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/conversations/${conversationId}/messages`, { message });
      return { conversationId, message: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (conversationId, { rejectWithValue }) => {
    try {
      await api.post(`/conversations/${conversationId}/read-all`);
      return conversationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: {},
  isLoading: false,
  error: null,
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConversations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload?.data || action.payload || [];
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        const { conversationId, data } = action.payload;
        state.messages[conversationId] = data?.data || data || [];
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload;
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId].push(message);
      });
  },
});

export const { setCurrentConversation, addMessage } = messageSlice.actions;
export default messageSlice.reducer;
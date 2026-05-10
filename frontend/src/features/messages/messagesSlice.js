// features/messages/messagesSlice.js
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
      return { conversationId, messages: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post('/messages', { conversation_id: conversationId, message });
      return { conversationId, message: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (conversationId, { rejectWithValue }) => {
    try {
      await api.put(`/conversations/${conversationId}/read-all`);
      return conversationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ✅ أضف هاد الـ Thunk
export const startConversation = createAsyncThunk(
  'messages/startConversation',
  async ({ worker_id }, { rejectWithValue }) => {
    try {
      const response = await api.post('/conversations', { worker_id });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    conversations: [],
    currentConversation: null,
    messages: {},
    isLoading: false,
    error: null,
  },
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
      // Conversations
      .addCase(getConversations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload?.data?.data || action.payload?.data || [];
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Messages
      .addCase(getMessages.fulfilled, (state, action) => {
        const { conversationId, messages: msgs } = action.payload;
        state.messages[conversationId] = msgs?.map(msg => ({
          id: msg.id,
          body: msg.message,
          is_me: msg.sender?.id !== state.currentConversation?.participant?.id,
          is_read: msg.is_read,
          created_at: msg.created_at,
        })) || [];
      })
      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload;
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId].push({
          id: message.id,
          body: message.message,
          is_me: true,
          is_read: false,
          created_at: message.created_at,
        });
      })
      // Mark as Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const conversationId = action.payload;
        if (state.messages[conversationId]) {
          state.messages[conversationId] = state.messages[conversationId].map(msg => ({
            ...msg,
            is_read: true,
          }));
        }
      })
      // ✅ أضف هاد الـ case لـ startConversation
      .addCase(startConversation.fulfilled, (state, action) => {
        const newConversation = action.payload?.data || action.payload;
        if (newConversation && newConversation.id) {
          // التحقق إذا كانت المحادثة موجودة مسبقاً
          const exists = state.conversations.some(c => c.id === newConversation.id);
          if (!exists) {
            state.conversations = [newConversation, ...state.conversations];
          }
          state.currentConversation = newConversation;
        }
      });
  },
});

export const { setCurrentConversation, addMessage } = messagesSlice.actions;
export default messagesSlice.reducer;
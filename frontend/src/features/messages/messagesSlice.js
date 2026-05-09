// features/messages/messagesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Get conversations
export const getConversations = createAsyncThunk(
  'messages/conversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/conversations');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Get messages for a conversation
export const getMessages = createAsyncThunk(
  'messages/get',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`);
      return { conversationId, messages: response.data.messages };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Send message
export const sendMessage = createAsyncThunk(
  'messages/send',
  async ({ conversationId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/conversations/${conversationId}/messages`, { message });
      return { conversationId, message: response.data.message };
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
    addNewMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
      
      // Update last message in conversation
      const convIndex = state.conversations.findIndex(c => c.id === conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].last_message = message.body;
        state.conversations[convIndex].last_message_time = message.created_at;
      }
    },
    updateUnreadCount: (state, action) => {
      const { conversationId, count } = action.payload;
      const conv = state.conversations.find(c => c.id === conversationId);
      if (conv) conv.unread_count = count;
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
        state.conversations = action.payload.conversations;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Messages
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messages[action.payload.conversationId] = action.payload.messages;
      })
      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload;
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId].push(message);
      });
  },
});

export const { setCurrentConversation, addNewMessage, updateUnreadCount } = messagesSlice.actions;
export default messagesSlice.reducer;
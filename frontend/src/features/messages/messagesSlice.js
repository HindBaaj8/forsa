import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ========== ASYNC THUNKS ==========

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
      // ✅ Normalisation des données
      const data = response.data?.data || response.data;
      return { conversationId, messages: Array.isArray(data) ? data : [] };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/send',
  async ({ conversationId, message, type = 'text' }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/conversations/${conversationId}/messages`, {
        message,
        type,
      });
      const newMessage = response.data?.data || response.data;
      return { conversationId, message: newMessage };
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

// ========== INITIAL STATE ==========
const initialState = {
  conversations: [],
  currentConversation: null,
  messages: {},      // { conversationId: [...] }
  isLoading: false,
  error: null,
  typingUsers: {},   // { conversationId: [userIds] }
};

// ========== SLICE ==========
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    receiveMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      // ✅ Vérifier doublon
      const exists = state.messages[conversationId].some(m => m.id === message.id);
      if (!exists) {
        state.messages[conversationId].push(message);
      }
    },
    
    addTypingUser: (state, action) => {
      const { conversationId, userId, userName } = action.payload;
      
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      
      const exists = state.typingUsers[conversationId].some(u => u.userId === userId);
      if (!exists) {
        state.typingUsers[conversationId].push({ userId, userName });
      }
    },
    
    removeTypingUser: (state, action) => {
      const { conversationId, userId } = action.payload;
      
      if (state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
          u => u.userId !== userId
        );
      }
    },
    
    markAsReadRealtime: (state, action) => {
      const { conversationId, messageId, userId, readAt } = action.payload;
      
      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].map(msg =>
          msg.id === messageId
            ? { ...msg, is_read: true, read_by: userId, read_at: readAt }
            : msg
        );
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // ===== GET CONVERSATIONS =====
      .addCase(getConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload?.data || action.payload || [];
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // ===== GET MESSAGES =====
      .addCase(getMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const { conversationId, messages } = action.payload;
        // ✅ Initialisation correcte
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId] = messages;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // ===== SEND MESSAGE =====
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload;
        // ✅ Vérification avant push
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId].push(message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // ===== MARK AS READ =====
      .addCase(markAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const conversationId = action.payload;
        if (state.messages[conversationId]) {
          state.messages[conversationId] = state.messages[conversationId].map(msg => ({
            ...msg,
            is_read: true,
          }));
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// ========== EXPORTS ==========
export const {
  setCurrentConversation,
  clearError,
  receiveMessage,
  addTypingUser,
  removeTypingUser,
  markAsReadRealtime,
} = messageSlice.actions;

export default messageSlice.reducer;
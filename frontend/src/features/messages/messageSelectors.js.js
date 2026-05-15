export const selectMessagesByConversation = (state, conversationId) => 
  state.messages.messages[conversationId] || [];

export const selectMessagesLoading = (state) => state.messages.isLoading;
export const selectMessagesError = (state) => state.messages.error;

export const selectTypingUsers = (state, conversationId) => 
  state.messages.typingUsers[conversationId] || [];

export const selectOnlineUsers = (state) => state.messages.onlineUsers || [];
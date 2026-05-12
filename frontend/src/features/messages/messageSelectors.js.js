export const selectMessagesByConversation = (state, conversationId) => 
  state.messages.items[conversationId] || [];
export const selectMessagesLoading = (state) => state.messages.isLoading;
export const selectMessagesError = (state) => state.messages.error;
export const selectTypingUsers = (state, conversationId) => 
  state.messages.typingUsers.filter(u => u.startsWith(conversationId)).map(u => u.split('_')[1]);
export const selectOnlineUsers = (state) => state.messages.onlineUsers;
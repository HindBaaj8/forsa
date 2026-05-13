export const selectAllConversations = (state) => state.conversations.conversations;
export const selectCurrentConversation = (state) => state.conversations.currentConversation;
export const selectConversationsLoading = (state) => state.conversations.isLoading;
export const selectConversationsError = (state) => state.conversations.error;
export const selectUnreadCount = (state, conversationId) => 
  state.conversations.unreadCounts[conversationId] || 0;
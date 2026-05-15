// src/features/notifications/notificationsSelectors.js

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state) => state.notifications.isLoading;
export const selectNotificationsError = (state) => state.notifications.error;
export const selectNotificationsPagination = (state) => state.notifications.pagination;
export const selectHasUnreadNotifications = (state) => state.notifications.unreadCount > 0;
export const selectLatestNotification = (state) => state.notifications.items[0] || null;
export const selectNotificationById = (state, id) => state.notifications.items.find(n => n.id === id);
export const selectNotificationsCount = (state) => state.notifications.items.length;
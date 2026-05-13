// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import clientReducer from '../features/client/clientSlice';
import workerReducer from '../features/worker/workerSlice';
import serviceReducer from '../features/services/serviceSlice';
import interestReducer from '../features/interests/interestSlice';
import orderReducer from '../features/orders/orderSlice';
import conversationReducer from '../features/conversations/conversationSlice';
import messageReducer from '../features/messages/messagesSlice';      // ✅ أضف هذا
import notificationReducer from '../features/notifications/notificationsSlice'; // ✅ أضف هذا
import adminReducer from '../features/admin/adminSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    client: clientReducer,
    worker: workerReducer,
    services: serviceReducer,
    interests: interestReducer,
    orders: orderReducer,
    conversations: conversationReducer,
    messages: messageReducer,           // ✅ أضف هذا
    notifications: notificationReducer, // ✅ أضف هذا
    admin: adminReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionPaths: ['payload.timestamp', 'payload.created_at', 'payload.updated_at'],
        ignoredPaths: ['messages.typingUsers', 'notifications.items'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
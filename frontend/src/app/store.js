// src/app/store.js - حذف الـ imports اللي ماعندهاش ملفات
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import clientReducer from '../features/client/clientSlice';
import workerReducer from '../features/worker/workerSlice';
import serviceReducer from '../features/services/serviceSlice';
import interestReducer from '../features/interests/interestSlice';
import orderReducer from '../features/orders/orderSlice';
import conversationReducer from '../features/conversations/conversationSlice';
import adminReducer from '../features/admin/adminSlice';
import uiReducer from '../features/ui/uiSlice';

// ✅ حذف requestSlice, messageSlice, notificationSlice مؤقتاً

export const store = configureStore({
  reducer: {
    auth: authReducer,
    client: clientReducer,
    worker: workerReducer,
    services: serviceReducer,
    interests: interestReducer,
    orders: orderReducer,
    conversations: conversationReducer,
    admin: adminReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
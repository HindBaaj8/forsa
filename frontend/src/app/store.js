// app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import clientReducer from '../features/client/clientSlice';
import workersReducer from '../features/worker/workersSlice';
import workerReducer from '../features/worker/workerSlice';
import messagesReducer from '../features/messages/messagesSlice';
import favoritesReducer from '../features/favorites/favoritesSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';

export const store = configureStore({
  reducer: {
    // Authentication (Client + Worker + Admin)
    auth: authReducer,

    // Client Panel
    client: clientReducer,        // Dashboard, طلباتي, الملف الشخصي, الإعدادات
    workers: workersReducer,      // البحث عن عمال
    
    // Worker Panel
    worker: workerReducer,        // Dashboard, الطلبات, خدماتي, الأرباح, جدول المواعيد, الملف الشخصي, الإعدادات
    
    // Common (Client + Worker)
    messages: messagesReducer,    // المحادثات والرسائل
    favorites: favoritesReducer,  // المفضلة (Client فقط)
    notifications: notificationsReducer, // الإشعارات (Client + Worker)
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
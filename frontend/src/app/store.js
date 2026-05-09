// app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import clientReducer from '../features/client/clientSlice';
import workersReducer from '../features/workers/workersSlice';
import requestsReducer from '../features/requests/requestsSlice';
import messagesReducer from '../features/messages/messagesSlice';
import favoritesReducer from '../features/favorites/favoritesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    client: clientReducer,
    workers: workersReducer,
    requests: requestsReducer,
    messages: messagesReducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
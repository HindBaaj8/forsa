// hooks/useRealtime.js
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import realtimeManager from '../services/realtime';
import { selectIsAuthenticated, selectToken, selectUser } from '../features/auth/authSelectors';

export const useRealtime = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  const initialized = useRef(false);

  useEffect(() => {
    if (isAuthenticated && token && user && !initialized.current) {
      console.log('✅ Initializing realtime connection...');
      try {
        realtimeManager.initialize(user.id, token);
        initialized.current = true;
      } catch (error) {
        console.error('❌ Failed to initialize realtime:', error);
      }
    }

    return () => {
      if (!isAuthenticated && initialized.current) {
        console.log('🔴 Cleaning up realtime connection...');
        realtimeManager.disconnect();
        initialized.current = false;
      }
    };
  }, [isAuthenticated, token, user]);
};

export const useConversationRealtime = (conversationId) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const subscribed = useRef(false);

  useEffect(() => {
    if (isAuthenticated && conversationId && !subscribed.current) {
      console.log('✅ Subscribing to conversation:', conversationId);
      realtimeManager.subscribeToConversation(conversationId);
      subscribed.current = true;
    }

    return () => {
      if (conversationId && subscribed.current) {
        console.log('🔴 Unsubscribing from conversation:', conversationId);
        realtimeManager.unsubscribeFromConversation(conversationId);
        subscribed.current = false;
      }
    };
  }, [isAuthenticated, conversationId]);
};

export const useTyping = (conversationId) => {
  const { user } = useSelector((state) => state.auth);
  
  const startTyping = () => {
    if (!conversationId || !user) return;
    realtimeManager.sendTyping(conversationId, true, user.first_name);
  };
  
  const stopTyping = () => {
    if (!conversationId || !user) return;
    realtimeManager.sendTyping(conversationId, false, user.first_name);
  };
  
  return { startTyping, stopTyping };
};
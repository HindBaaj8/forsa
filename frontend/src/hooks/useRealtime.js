// hooks/useRealtime.js
import { useEffect, useRef } from 'react';  
import { useSelector } from 'react-redux';
import realtimeManager from '../services/realtime';
import { selectIsAuthenticated, selectToken, selectUser } from '../features/auth/authSelectors';

export const useRealtime = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  const initialized = useRef(false);

  useEffect(() => {
    console.log('🔍 useRealtime - isAuthenticated:', isAuthenticated);
    console.log('🔍 useRealtime - token:', token ? 'Yes' : 'No');
    console.log('🔍 useRealtime - user:', user?.id);
    
    if (isAuthenticated && token && user && !initialized.current) {
      console.log('✅ Initializing realtime...');
      realtimeManager.initialize(user.id, token);
      initialized.current = true;
    }
    
    return () => {
      if (!isAuthenticated && initialized.current) {
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
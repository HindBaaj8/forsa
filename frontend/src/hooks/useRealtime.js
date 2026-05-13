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
  }, [isAuthenticated, conversationId]);
};

export const useTyping = (conversationId) => {
  return { 
    startTyping: () => console.log('✍️ Typing started'), 
    stopTyping: () => console.log('✍️ Typing stopped') 
  };
};
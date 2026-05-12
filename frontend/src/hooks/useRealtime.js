// hooks/useRealtime.js
import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import realtimeManager from '../services/realtime';
import { selectIsAuthenticated, selectToken, selectUser } from '../features/auth/authSelectors';

export const useRealtime = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  const initialized = useRef(false);

  useEffect(() => {
    if (isAuthenticated && token && user && !initialized.current) {
      realtimeManager.initialize(user.id, user.role, token);
      initialized.current = true;
    }

    return () => {
      if (initialized.current && !isAuthenticated) {
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
      realtimeManager.subscribeToConversation(conversationId);
      subscribed.current = true;
    }

    return () => {
      if (subscribed.current && conversationId) {
        realtimeManager.unsubscribeFromConversation(conversationId);
        subscribed.current = false;
      }
    };
  }, [isAuthenticated, conversationId]);
};

export const useTyping = (conversationId) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const timeoutRef = useRef(null);
  const dispatch = useDispatch();

  const sendTyping = useCallback((isTyping) => {
    if (isAuthenticated && conversationId) {
      realtimeManager.sendTyping(conversationId, isTyping, user?.full_name);
    }
  }, [isAuthenticated, conversationId, user]);

  const startTyping = useCallback(() => {
    sendTyping(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  }, [sendTyping]);

  const stopTyping = useCallback(() => {
    sendTyping(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [sendTyping]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { startTyping, stopTyping };
};

export const useAdminRealtime = () => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const initialized = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin' && !initialized.current) {
      realtimeManager.setupAdminChannel();
      initialized.current = true;
    }
  }, [isAuthenticated, user]);
};

export const useRealtimeStatus = () => {
  const [isConnected, setIsConnected] = useState(realtimeManager.isConnected());

  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(realtimeManager.isConnected());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { isConnected };
};
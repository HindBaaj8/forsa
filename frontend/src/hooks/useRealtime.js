// hooks/useRealtime.js
import { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectToken, selectUser } from '../features/auth/authSelectors';

export const useRealtime = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  const initialized = useRef(false);
  const intervalRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    
    try {
      // 🔥 استخدم المسار الصحيح للـ API
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📩 Notifications fetched:', data);
      
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('notifications-updated', { detail: data }));
      }
    } catch (error) {
      console.error('Polling error:', error.message);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    console.log('🔍 useRealtime - isAuthenticated:', isAuthenticated);
    console.log('🔍 useRealtime - token:', token ? 'Yes' : 'No');
    console.log('🔍 useRealtime - user:', user?.id);
    console.log('⚠️ WebSocket disabled - using polling mode');
    
    if (isAuthenticated && token && user && !initialized.current) {
      initialized.current = true;
      
      // جلب الإشعارات أول مرة
      fetchNotifications();
      
      // جلب الإشعارات كل 30 ثانية
      intervalRef.current = setInterval(() => {
        fetchNotifications();
      }, 30000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      initialized.current = false;
    };
  }, [isAuthenticated, token, user, fetchNotifications]);
};

export const useConversationRealtime = (conversationId) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const subscribed = useRef(false);
  const intervalRef = useRef(null);
  const token = useSelector(selectToken);

  const fetchMessages = useCallback(async () => {
    if (!isAuthenticated || !conversationId || !token) return;
    
    try {
      // 🔥 استخدم المسار الصحيح
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/messages/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`💬 Messages fetched for ${conversationId}:`, data);
      
      window.dispatchEvent(new CustomEvent('messages-updated', { 
        detail: { conversationId, messages: data } 
      }));
    } catch (error) {
      console.error('Fetch messages error:', error.message);
    }
  }, [isAuthenticated, conversationId, token]);

  useEffect(() => {
    console.log('⚠️ Conversation realtime disabled - using polling mode');
    
    if (isAuthenticated && conversationId && !subscribed.current && token) {
      subscribed.current = true;
      
      fetchMessages();
      
      intervalRef.current = setInterval(() => {
        fetchMessages();
      }, 10000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      subscribed.current = false;
    };
  }, [isAuthenticated, conversationId, token, fetchMessages]);
};

export const useTyping = (conversationId) => {
  const token = useSelector(selectToken);
  
  const startTyping = useCallback(async () => {
    if (!conversationId || !token) return;
    
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/messages/${conversationId}/typing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_typing: true })
      });
    } catch (error) {
      console.error('Start typing error:', error);
    }
  }, [conversationId, token]);
  
  const stopTyping = useCallback(async () => {
    if (!conversationId || !token) return;
    
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/messages/${conversationId}/typing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_typing: false })
      });
    } catch (error) {
      console.error('Stop typing error:', error);
    }
  }, [conversationId, token]);
  
  return { startTyping, stopTyping };
};

export default { useRealtime, useConversationRealtime, useTyping };
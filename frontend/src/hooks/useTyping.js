// hooks/useTyping.js
import { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addTypingUser, removeTypingUser } from '../features/messages/messageSlice';
import realtimeManager from '../services/realtime';

export const useTyping = (conversationId) => {
  const dispatch = useDispatch();
  const timeoutRef = useRef(null);

  const handleTyping = useCallback((isTyping) => {
    // ✅ Timeout هنا في الـ hook
    if (isTyping) {
      dispatch(addTypingUser({ conversationId, userId: realtimeManager.userId }));
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        dispatch(removeTypingUser({ conversationId, userId: realtimeManager.userId }));
      }, 3000);
    } else {
      dispatch(removeTypingUser({ conversationId, userId: realtimeManager.userId }));
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [conversationId, dispatch]);

  return { handleTyping };
};
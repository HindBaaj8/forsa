// hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import io from 'socket.io-client';
import { addNewMessage, updateUnreadCount } from '../features/messages/messagesSlice';

export const useSocket = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketRef.current = io(process.env.REACT_APP_WS_URL || 'http://localhost:6001', {
        auth: { token },
      });

      socketRef.current.on('new_message', (data) => {
        dispatch(addNewMessage(data));
      });

      socketRef.current.on('message_read', (data) => {
        dispatch(updateUnreadCount(data));
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [dispatch]);

  const sendMessage = (conversationId, message) => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', { conversationId, message });
    }
  };

  const markAsRead = (conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('mark_read', { conversationId });
    }
  };

  return { socket: socketRef.current, sendMessage, markAsRead };
};
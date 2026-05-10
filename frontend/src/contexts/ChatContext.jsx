// contexts/ChatContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getEcho } from '../services/echo';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);

  // Load conversations when user changes
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Setup realtime listener for current conversation
  useEffect(() => {
    if (!currentConversation) return;
    
    loadMessages(currentConversation.id);
    
    const echo = getEcho();
    if (!echo) return;
    
    // Listen for new messages
    echo.private(`conversation.${currentConversation.id}`)
      .listen('.message.sent', (data) => {
        setMessages(prev => ({
          ...prev,
          [currentConversation.id]: [...(prev[currentConversation.id] || []), data]
        }));
        
        // Update last message in conversation list
        setConversations(prev => prev.map(conv =>
          conv.id === currentConversation.id
            ? { ...conv, last_message: data.message, last_message_at: data.created_at }
            : conv
        ));
      });
      
    return () => {
      echo.leave(`conversation.${currentConversation.id}`);
    };
  }, [currentConversation]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/conversations');
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`);
      setMessages(prev => ({
        ...prev,
        [conversationId]: response.data.data || []
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (conversationId, messageText) => {
    try {
      const response = await api.post('/messages', {
        conversation_id: conversationId,
        message: messageText
      });
      
      // Add message locally
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), response.data.data]
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const startConversation = async (workerId) => {
    try {
      const response = await api.post('/conversations', { worker_id: workerId });
      const newConversation = response.data.data;
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      return newConversation;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversation,
      messages,
      loading,
      loadConversations,
      loadMessages,
      sendMessage,
      startConversation,
      setCurrentConversation,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
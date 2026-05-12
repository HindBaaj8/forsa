// components/ChatComponent.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useConversationRealtime, useTyping } from '../hooks/useRealtime';
import { sendMessage, getMessages } from '../features/messages/messageSlice';
import { selectMessagesByConversation } from '../features/messages/messageSelectors';

export const ChatComponent = ({ conversationId }) => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // ✅ Subscribe to realtime for this conversation
  useConversationRealtime(conversationId);
  
  // ✅ Typing indicator hook
  const { startTyping, stopTyping } = useTyping(conversationId);
  
  const messages = useSelector(state => selectMessagesByConversation(state, conversationId));
  const typingUsers = useSelector(state => selectTypingUsers(state, conversationId));

  useEffect(() => {
    dispatch(getMessages({ conversationId }));
  }, [conversationId, dispatch]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      await dispatch(sendMessage({
        conversationId,
        message: message.trim(),
        type: 'text',
      }));
      setMessage('');
      stopTyping();
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    startTyping();
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id || msg.temp_id} className={`message ${msg.sending ? 'sending' : ''}`}>
            <p>{msg.message}</p>
            {msg.sending && <span>Sending...</span>}
            {msg.failed && <span>Failed to send</span>}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          Someone is typing...
        </div>
      )}
      
      <div className="input-area">
        <input
          type="text"
          value={message}
          onChange={handleTyping}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};
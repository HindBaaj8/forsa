// components/chat/ChatWindow.jsx
import { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function ChatWindow({ onBack }) {
  const { currentConversation, messages, sendMessage, loadMessages } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentMessages = messages[currentConversation?.id] || [];

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id);
      scrollToBottom();
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(currentConversation.id, newMessage.trim());
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (date) => {
    return format(new Date(date), 'HH:mm', { locale: ar });
  };

  if (!currentConversation) {
    return (
      <div className="chat-window-empty">
        <div className="chat-window-empty-icon">💬</div>
        <p>اختر محادثة للبدء</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <button className="chat-back-btn" onClick={onBack}>
          ←
        </button>
        <div className="chat-participant">
          <div className="chat-participant-avatar">
            {currentConversation.participant?.name?.charAt(0) || '?'}
          </div>
          <div>
            <div className="chat-participant-name">
              {currentConversation.participant?.name}
            </div>
            <div className="chat-participant-role">
              {currentConversation.participant?.role === 'client' ? 'عميل' : 
               currentConversation.participant?.role === 'worker' ? 'مهني' : 'مدير'}
            </div>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {currentMessages.length === 0 ? (
          <div className="chat-messages-empty">
            <p>لا توجد رسائل بعد</p>
            <p className="chat-messages-empty-sub">كن أول من يرسل رسالة</p>
          </div>
        ) : (
          currentMessages.map((msg, index) => {
            const isMine = msg.sender?.id !== currentConversation.participant?.id;
            return (
              <div key={index} className={`chat-message ${isMine ? 'sent' : 'received'}`}>
                <div className="chat-message-bubble">
                  <div className="chat-message-text">{msg.message}</div>
                  <div className="chat-message-time">
                    {formatMessageTime(msg.created_at)}
                    {isMine && msg.is_read && <span className="chat-message-read"> ✓✓</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder="اكتب رسالتك هنا..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="chat-send-btn" disabled={sending || !newMessage.trim()}>
          {sending ? '⏳' : '➤'}
        </button>
      </form>

      <style>{`
        .chat-window {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .chat-window-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--gray200);
          background: var(--white);
        }
        
        .chat-back-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
          transition: background 0.15s;
        }
        
        .chat-back-btn:hover {
          background: var(--gray100);
        }
        
        .chat-participant {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .chat-participant-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--n700), var(--n500));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
        }
        
        .chat-participant-name {
          font-weight: 700;
          font-size: 14px;
          color: var(--text1);
        }
        
        .chat-participant-role {
          font-size: 11px;
          color: var(--text3);
        }
        
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--bg);
        }
        
        .chat-message {
          display: flex;
        }
        
        .chat-message.sent {
          justify-content: flex-end;
        }
        
        .chat-message.received {
          justify-content: flex-start;
        }
        
        .chat-message-bubble {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          position: relative;
        }
        
        .chat-message.sent .chat-message-bubble {
          background: var(--n700);
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .chat-message.received .chat-message-bubble {
          background: var(--white);
          color: var(--text1);
          border: 1px solid var(--gray200);
          border-bottom-left-radius: 4px;
        }
        
        .chat-message-text {
          font-size: 13px;
          line-height: 1.5;
          word-wrap: break-word;
        }
        
        .chat-message-time {
          font-size: 10px;
          margin-top: 4px;
          opacity: 0.7;
          text-align: right;
        }
        
        .chat-message-read {
          margin-left: 2px;
        }
        
        .chat-messages-empty {
          text-align: center;
          padding: 48px 20px;
          color: var(--text3);
        }
        
        .chat-messages-empty-sub {
          font-size: 12px;
          margin-top: 6px;
        }
        
        .chat-window-empty {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text3);
          gap: 12px;
        }
        
        .chat-window-empty-icon {
          font-size: 48px;
        }
        
        .chat-input-form {
          display: flex;
          gap: 10px;
          padding: 12px 16px;
          border-top: 1px solid var(--gray200);
          background: var(--white);
        }
        
        .chat-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid var(--gray200);
          border-radius: 24px;
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
        }
        
        .chat-input:focus {
          border-color: var(--n400);
          box-shadow: 0 0 0 2px rgba(46, 91, 168, 0.1);
        }
        
        .chat-send-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--n700);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        
        .chat-send-btn:hover:not(:disabled) {
          background: var(--n800);
          transform: scale(1.05);
        }
        
        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
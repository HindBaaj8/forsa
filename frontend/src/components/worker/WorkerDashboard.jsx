// components/worker/WorkerMessages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Phone, Video } from 'lucide-react';
import WorkerLayout from '../layout/WorkerLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  markAsRead,
  setCurrentConversation 
} from '../../features/messages/messagesSlice';
import { useConversationRealtime, useTyping } from '../../hooks/useRealtime';
import '../../styles/Dashboard.css';

export default function WorkerMessages() {
  const dispatch = useDispatch();
  
  const {
    conversations = [],
    currentConversation = null,
    messages = {},
    isLoading = false,
  } = useSelector((state) => state.messages || {});
  
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // ✅ Subscribe to realtime for current conversation
  useConversationRealtime(currentConversation?.id);
  const { startTyping, stopTyping } = useTyping(currentConversation?.id);

  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  useEffect(() => {
    if (currentConversation) {
      dispatch(getMessages(currentConversation.id));
      dispatch(markAsRead(currentConversation.id));
    }
  }, [currentConversation, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentConversation]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentConversation || sending) return;
    setSending(true);
    await dispatch(sendMessage({ 
      conversationId: currentConversation.id, 
      message: newMessage.trim() 
    }));
    setNewMessage('');
    stopTyping();
    setSending(false);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (e.target.value.length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleSelectConversation = (conv) => {
    dispatch(setCurrentConversation(conv));
  };

  if (isLoading) return <LoadingSpinner />;

  const currentMessages = messages[currentConversation?.id] || [];

  return (
    <WorkerLayout title="الرسائل">
      <div className="msg-layout">
        {/* Sidebar - Conversations List */}
        <div className="msg-sidebar">
          <div className="msg-sidebar__search">
            <span>🔍</span>
            <input type="text" placeholder="بحث عن محادثة..." />
          </div>
          <div className="msg-list">
            {conversations.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: 48 }}>💬</div>
                <p>لا توجد محادثات بعد</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`msg-conv ${currentConversation?.id === conv.id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="msg-conv__av">
                    {conv.participant?.name?.[0] || '?'}
                    {conv.participant?.online && <span className="msg-conv__online" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <div className="msg-conv__name">{conv.participant?.name}</div>
                      <div className="msg-conv__time">
                        {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                    <div className="msg-conv__last">{conv.last_message || 'بدء محادثة'}</div>
                  </div>
                  {conv.unread_count > 0 && (
                    <div className="msg-conv__badge">{conv.unread_count}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="msg-main">
          {currentConversation ? (
            <>
              <div className="msg-topbar">
                <div className="msg-conv__av">
                  {currentConversation.participant?.name?.[0] || '?'}
                  {currentConversation.participant?.online && <span className="msg-conv__online" />}
                </div>
                <div>
                  <div className="msg-conv__name">
                    {currentConversation.participant?.name}
                  </div>
                  <div className="msg-conv__online-status">
                    {currentConversation.participant?.online ? '● متصل' : '○ غير متصل'}
                  </div>
                </div>
                <div style={{ marginRight: 'auto', display: 'flex', gap: 8 }}>
                  <button className="btn btn--ghost btn--sm"><Phone size={14} /></button>
                  <button className="btn btn--ghost btn--sm"><Video size={14} /></button>
                </div>
              </div>

              <div className="msg-body">
                {currentMessages.length === 0 ? (
                  <div className="empty-state">
                    <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                    <p>لا توجد رسائل بعد</p>
                    <small>كن أول من يرسل رسالة</small>
                  </div>
                ) : (
                  currentMessages.map((msg, idx) => {
                    const isMe = msg.sender_id !== currentConversation.participant?.id;
                    return (
                      <div
                        key={idx}
                        className={`msg-bubble msg-bubble--${isMe ? 'me' : 'them'}`}
                      >
                        <div className={`msg-text msg-text--${isMe ? 'me' : 'them'}`}>
                          {msg.message}
                        </div>
                        <div className={`msg-time msg-time--${isMe ? 'me' : ''}`}>
                          {new Date(msg.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                          {isMe && msg.is_read && <span className="msg-read"> ✓✓</span>}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="msg-input">
                <textarea
                  className="msg-field"
                  placeholder="اكتب رسالتك..."
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  rows={1}
                />
                <button
                  className="msg-send"
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                >
                  {sending ? '⏳' : <Send size={18} />}
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ height: '100%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 48 }}>💬</div>
              <h3>اختر محادثة للبدء</h3>
            </div>
          )}
        </div>
      </div>
    </WorkerLayout>
  );
}
// pages/worker/WorkerMessages.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getConversations, getMessages, sendMessage, markAsRead, setCurrentConversation } from '../../features/messages/messagesSlice';
import WorkerLayout from '../../components/layout/WorkerLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getEcho } from '../../services/echo';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

function ConversationItem({ conv, isActive, onClick }) {
  const getTimeAgo = (date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ar });
  };

  return (
    <div className={`msg-conv ${isActive ? 'active' : ''}`} onClick={() => onClick(conv)}>
      <div className="msg-conv__av">
        {conv.participant?.name?.[0] || '?'}
        {conv.participant?.online && <span className="msg-conv__online" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <div className="msg-conv__name">{conv.participant?.name || 'عميل'}</div>
          <div className="msg-conv__time">{getTimeAgo(conv.last_message_at)}</div>
        </div>
        <div className="msg-conv__last">{conv.last_message || 'بدء محادثة جديدة'}</div>
        {conv.request && (
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
            📋 {conv.request.title}
          </div>
        )}
      </div>
      {conv.unread_count > 0 && (
        <div className="msg-conv__badge">{conv.unread_count}</div>
      )}
    </div>
  );
}

function MessageBubble({ message, isMe }) {
  return (
    <div className={`msg-bubble msg-bubble--${isMe ? 'me' : 'them'}`}>
      <div className={`msg-text msg-text--${isMe ? 'me' : 'them'}`}>
        {message.body}
      </div>
      <div className={`msg-time msg-time--${isMe ? 'me' : ''}`}>
        {new Date(message.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
        {isMe && message.is_read && <span className="msg-read"> ✓✓</span>}
      </div>
    </div>
  );
}

export default function WorkerMessages() {
  const dispatch = useDispatch();
  const { conversations, currentConversation, messages, isLoading } = useSelector((state) => state.messages);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');

  // Load conversations on mount
  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      dispatch(getMessages(currentConversation.id));
      dispatch(markAsRead(currentConversation.id));
    }
  }, [currentConversation, dispatch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentConversation]);

  // Setup real-time listener
  useEffect(() => {
    if (!currentConversation || !token) return;
    
    const echo = getEcho();
    if (!echo) return;
    
    const channel = echo.private(`conversation.${currentConversation.id}`);
    channel.listen('.message.sent', (data) => {
      console.log('New message received:', data);
      dispatch({
        type: 'messages/addMessage',
        payload: {
          conversationId: currentConversation.id,
          message: {
            id: data.id,
            body: data.message,
            is_me: data.sender_id !== currentConversation.participant?.id,
            is_read: false,
            created_at: data.created_at,
          }
        }
      });
    });
    
    return () => {
      echo.leave(`conversation.${currentConversation.id}`);
    };
  }, [currentConversation, token, dispatch]);

  const handleSelectConversation = (conv) => {
    dispatch(setCurrentConversation(conv));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation || sending) return;
    
    setSending(true);
    const messageText = newMessage;
    setNewMessage('');
    
    try {
      await dispatch(sendMessage({ 
        conversationId: currentConversation.id, 
        message: messageText 
      })).unwrap();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading && conversations.length === 0) return <LoadingSpinner />;

  return (
    <WorkerLayout title="الرسائل">
      <div className="page-header">
        <div className="page-header__title">الرسائل</div>
        <div className="page-header__sub">تواصل مع العملاء</div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'calc(100vh - 200px)' }}>
        <div className="msg-layout">
          {/* Sidebar - Conversations List */}
          <div className="msg-sidebar">
            <div className="msg-sidebar__search">
              <span>🔍</span>
              <input type="text" placeholder="بحث عن محادثة..." />
            </div>
            <div className="msg-list">
              {conversations.length === 0 ? (
                <div className="empty-state" style={{ padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                  <div>لا توجد محادثات بعد</div>
                  <div style={{ fontSize: 12, marginTop: 8 }}>
                    ستظهر هنا المحادثات عندما يتواصل العملاء معك
                  </div>
                </div>
              ) : (
                conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    isActive={currentConversation?.id === conv.id}
                    onClick={handleSelectConversation}
                  />
                ))
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          {currentConversation ? (
            <div className="msg-main">
              <div className="msg-topbar">
                <div className="msg-conv__av" style={{ width: 40, height: 40, fontSize: 16 }}>
                  {currentConversation.participant?.name?.[0] || '?'}
                  {currentConversation.participant?.online && <span className="msg-conv__online" />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {currentConversation.participant?.name || 'عميل'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                    ● {currentConversation.participant?.online ? 'متصل الآن' : 'غير متصل'}
                  </div>
                </div>
                <div style={{ marginRight: 'auto', display: 'flex', gap: 8 }}>
                  <Link to={`/worker/orders/${currentConversation.id}`}>
                    <button className="btn btn--ghost btn--sm" title="عرض الطلب">
                      📋
                    </button>
                  </Link>
                  <button className="btn btn--ghost btn--sm" title="اتصال">
                    📞
                  </button>
                </div>
              </div>

              <div className="msg-body">
                {messages[currentConversation.id]?.length === 0 ? (
                  <div className="empty-state" style={{ padding: 40 }}>
                    <div>لا توجد رسائل بعد</div>
                    <div style={{ fontSize: 12, marginTop: 8 }}>كن أول من يرسل رسالة</div>
                  </div>
                ) : (
                  messages[currentConversation.id]?.map((msg, index) => (
                    <MessageBubble
                      key={index}
                      message={msg}
                      isMe={msg.is_me}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="msg-input">
                <textarea
                  className="msg-field"
                  placeholder="اكتب رسالتك هنا..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  rows={1}
                  style={{ resize: 'none', fontFamily: 'Cairo, sans-serif' }}
                  disabled={sending}
                />
                <button
                  className="msg-send"
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                >
                  {sending ? '⏳' : '➤'}
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>اختر محادثة للبدء</div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                من هنا ستتواصل مع عملائك
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkerLayout>
  );
}
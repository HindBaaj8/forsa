// pages/client/ClientMessages.jsx
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getConversations, getMessages, sendMessage, markAsRead, setCurrentConversation } from '../../features/messages/messagesSlice';
import ClientLayout from '../../components/layout/ClientLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getEcho } from '../../services/echo';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import api from '../../services/api';

export default function ClientMessages() {
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
    
    // Listen for new messages
    const channel = echo.private(`conversation.${currentConversation.id}`);
    channel.listen('.message.sent', (data) => {
      console.log('New message received:', data);
      // Add message to Redux store
      dispatch({
        type: 'messages/addMessage',
        payload: {
          conversationId: currentConversation.id,
          message: {
            id: data.id,
            body: data.message,
            is_me: data.sender_id !== currentConversation.participant?.id,
            created_at: data.created_at,
          }
        }
      });
    });
    
    return () => {
      echo.leave(`conversation.${currentConversation.id}`);
    };
  }, [currentConversation, token, dispatch]);

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

  const handleSelectConversation = (conv) => {
    dispatch(setCurrentConversation(conv));
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ar });
  };

  if (isLoading && conversations.length === 0) return <LoadingSpinner />;

  return (
    <ClientLayout title="الرسائل">
      <div className="card" style={{padding: 0, overflow: 'hidden', height: 'calc(100vh - 140px)'}}>
        <div className="msg-layout">
          {/* Sidebar - Conversations List */}
          <div className="msg-sidebar">
            <div className="msg-sidebar__search">
              <span>🔍</span>
              <input type="text" placeholder="بحث عن محادثة..." />
            </div>
            <div className="msg-list">
              {conversations?.length === 0 ? (
                <div className="empty-state" style={{padding: 40}}>
                  <div style={{fontSize: 48, marginBottom: 12}}>💬</div>
                  <div>لا توجد محادثات بعد</div>
                  <div style={{fontSize: 12, marginTop: 8}}>ابدأ محادثة جديدة من صفحة البحث</div>
                </div>
              ) : (
                conversations?.map(conv => (
                  <div 
                    key={conv.id} 
                    className={`msg-conv ${currentConversation?.id === conv.id ? 'active' : ''}`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <div className="msg-conv__av">
                      {conv.participant?.name?.[0] || '?'}
                      {conv.participant?.online && <span className="msg-conv__online" />}
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 2}}>
                        <div className="msg-conv__name">{conv.participant?.name || 'مستخدم'}</div>
                        <div className="msg-conv__time">{getTimeAgo(conv.last_message_at)}</div>
                      </div>
                      <div className="msg-conv__last">{conv.last_message || 'بدء محادثة جديدة'}</div>
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
          {currentConversation ? (
            <div className="msg-main">
              <div className="msg-topbar">
                <div className="msg-conv__av" style={{width: 40, height: 40, fontSize: 16}}>
                  {currentConversation.participant?.name?.[0] || '?'}
                </div>
                <div>
                  <div style={{fontWeight: 700, fontSize: 14}}>
                    {currentConversation.participant?.name || 'مستخدم'}
                  </div>
                  <div style={{fontSize: 12, color: 'var(--success)', fontWeight: 600}}>
                    ● {currentConversation.participant?.online ? 'متصل' : 'غير متصل'}
                  </div>
                </div>
              </div>
              <div className="msg-body">
                {messages[currentConversation.id]?.length === 0 ? (
                  <div className="empty-state" style={{padding: 40}}>
                    <div>لا توجد رسائل بعد</div>
                    <div style={{fontSize: 12, marginTop: 8}}>كن أول من يرسل رسالة</div>
                  </div>
                ) : (
                  messages[currentConversation.id]?.map((msg, i) => (
                    <div key={i} className={`msg-bubble msg-bubble--${msg.is_me ? 'me' : 'them'}`}>
                      <div className={`msg-text msg-text--${msg.is_me ? 'me' : 'them'}`}>
                        {msg.body}
                      </div>
                      <div className={`msg-time msg-time--${msg.is_me ? 'me' : ''}`}>
                        {new Date(msg.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                        {msg.is_me && msg.is_read && <span className="msg-read"> ✓✓</span>}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="msg-input">
                <input 
                  className="msg-field" 
                  placeholder="اكتب رسالة..." 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
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
            <div className="empty-state" style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
              <div style={{fontSize: 48, marginBottom: 16}}>💬</div>
              <div style={{fontWeight: 700, marginBottom: 8}}>اختر محادثة للبدء</div>
              <div style={{fontSize: 13, color: 'var(--text3)'}}>
                من هنا ستتواصل مع المهنيين
              </div>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
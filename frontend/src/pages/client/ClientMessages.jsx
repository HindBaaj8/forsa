// pages/client/ClientMessages.jsx
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getConversations, getMessages, sendMessage, setCurrentConversation } from '../../features/messages/messagesSlice';
import ClientLayout from '../../components/layout/ClientLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useSocket } from '../../hooks/useSocket';

export default function ClientMessages() {
  const dispatch = useDispatch();
  const { conversations, currentConversation, messages, isLoading } = useSelector((state) => state.messages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { sendMessage: sendViaSocket, markAsRead } = useSocket();

  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  useEffect(() => {
    if (currentConversation) {
      dispatch(getMessages(currentConversation.id));
      markAsRead(currentConversation.id);
    }
  }, [currentConversation, dispatch, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;
    
    const messageText = newMessage;
    setNewMessage('');
    
    // Send via WebSocket for real-time
    sendViaSocket(currentConversation.id, messageText);
    
    // Also send via API for persistence
    await dispatch(sendMessage({ 
      conversationId: currentConversation.id, 
      message: messageText 
    }));
  };

  const handleSelectConversation = (conv) => {
    dispatch(setCurrentConversation(conv));
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <ClientLayout title="الرسائل">
      <div className="card" style={{padding: 0, overflow: 'hidden', height: 'calc(100vh - 140px)'}}>
        <div className="msg-layout">
          {/* Sidebar - Conversations List */}
          <div className="msg-sidebar">
            <div className="msg-sidebar__search">🔍 بحث عن محادثة...</div>
            <div className="msg-list">
              {conversations?.map(conv => (
                <div 
                  key={conv.id} 
                  className={`msg-conv${currentConversation?.id === conv.id ? ' active' : ''}`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="msg-conv__av">
                    {conv.worker_name?.[0] || 'م'}
                    {conv.online && <span className="msg-conv__online" />}
                  </div>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 2}}>
                      <div className="msg-conv__name">{conv.worker_name}</div>
                      <div className="msg-conv__time">{conv.last_message_time}</div>
                    </div>
                    <div className="msg-conv__last">{conv.last_message}</div>
                  </div>
                  {conv.unread_count > 0 && (
                    <div className="msg-conv__badge">{conv.unread_count}</div>
                  )}
                </div>
              ))}
              {conversations?.length === 0 && (
                <div className="empty-state" style={{padding: 40}}>
                  لا توجد محادثات بعد
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          {currentConversation ? (
            <div className="msg-main">
              <div className="msg-topbar">
                <div className="msg-conv__av" style={{width: 40, height: 40, fontSize: 16}}>
                  {currentConversation.worker_name?.[0] || 'م'}
                </div>
                <div>
                  <div style={{fontWeight: 700, fontSize: 14}}>{currentConversation.worker_name}</div>
                  <div style={{fontSize: 12, color: 'var(--success)', fontWeight: 600}}>
                    ● {currentConversation.online ? 'متصل' : 'غير متصل'}
                  </div>
                </div>
              </div>
              <div className="msg-body">
                {messages[currentConversation.id]?.map((msg, i) => (
                  <div key={i} className={`msg-bubble msg-bubble--${msg.is_me ? 'me' : 'them'}`}>
                    <div className={`msg-text msg-text--${msg.is_me ? 'me' : 'them'}`}>
                      {msg.body}
                    </div>
                    <div className={`msg-time msg-time--${msg.is_me ? 'me' : ''}`}>
                      {new Date(msg.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="msg-input">
                <input 
                  className="msg-field" 
                  placeholder="اكتب رسالة..." 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="msg-send" onClick={handleSendMessage}>➤</button>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div>اختر محادثة للبدء</div>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
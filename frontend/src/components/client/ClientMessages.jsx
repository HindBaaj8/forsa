import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Paperclip, Phone, Video } from 'lucide-react';
import ClientLayout from '../layout/ClientLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import { getConversations, getMessages, sendMessage, markAsRead } from '../../features/messages/messagesSlice';
import '../../styles/Client.css'; // فقط إذا styles داخل components
export default function ClientMessages() {
  const dispatch = useDispatch();
  const { conversations, currentConversation, messages, isLoading } = useSelector((state) => state.messages);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

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
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentConversation || sending) return;
    setSending(true);
    await dispatch(sendMessage({ conversationId: currentConversation.id, message: newMessage }));
    setNewMessage('');
    setSending(false);
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'الآن';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return new Date(date).toLocaleDateString('ar-MA');
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <ClientLayout title="الرسائل">
      <div className="msg-layout">
        <div className="msg-sidebar">
          <div className="msg-sidebar__search"><span>🔍</span><input type="text" placeholder="بحث عن محادثة..." /></div>
          <div className="msg-list">
            {conversations?.length === 0 ? (
              <div className="empty-state"><div style={{ fontSize: 48 }}>💬</div><p>لا توجد محادثات بعد</p></div>
            ) : (
              conversations?.map(conv => (
                <div key={conv.id} className={`msg-conv ${currentConversation?.id === conv.id ? 'active' : ''}`} onClick={() => dispatch({ type: 'messages/setCurrentConversation', payload: conv })}>
                  <div className="msg-conv__av">{conv.participant?.name?.[0] || '?'}</div>
                  <div><div className="msg-conv__name">{conv.participant?.name}</div><div className="msg-conv__last">{conv.last_message || 'بدء محادثة'}</div></div>
                  {conv.unread_count > 0 && <div className="msg-conv__badge">{conv.unread_count}</div>}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="msg-main">
          {currentConversation ? (
            <>
              <div className="msg-topbar">
                <div className="msg-conv__av">{currentConversation.participant?.name?.[0] || '?'}</div>
                <div><div className="msg-conv__name">{currentConversation.participant?.name}</div><div className="msg-conv__online">● متصل</div></div>
                <div style={{ marginRight: 'auto', display: 'flex', gap: 8 }}><button className="btn btn--ghost btn--sm"><Phone size={14} /></button><button className="btn btn--ghost btn--sm"><Video size={14} /></button></div>
              </div>
              <div className="msg-body">
                {messages[currentConversation.id]?.map((msg, i) => (
                  <div key={i} className={`msg-bubble msg-bubble--${msg.is_me ? 'me' : 'them'}`}>
                    <div className={`msg-text msg-text--${msg.is_me ? 'me' : 'them'}`}>{msg.body}</div>
                    <div className={`msg-time msg-time--${msg.is_me ? 'me' : ''}`}>{new Date(msg.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="msg-input">
                <textarea className="msg-field" placeholder="اكتب رسالتك..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()} />
                <button className="msg-send" onClick={handleSend} disabled={sending || !newMessage.trim()}><Send size={18} /></button>
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ height: '100%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}><div style={{ fontSize: 48 }}>💬</div><h3>اختر محادثة للبدء</h3></div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
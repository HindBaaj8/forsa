// components/admin/AdminMessages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Phone, Video, ArrowRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  markAsRead,
  setCurrentConversation 
} from '../../features/messages/messagesSlice';
import { toast } from 'react-hot-toast';

export default function AdminMessages() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    conversations = [],
    currentConversation = null,
    messages = {},
    isLoading = false,
  } = useSelector((state) => state.messages || {});
  
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
  }, [messages, currentConversation]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentConversation || sending) return;
    setSending(true);
    try {
      await dispatch(sendMessage({ 
        conversationId: currentConversation.id, 
        message: newMessage.trim() 
      })).unwrap();
      setNewMessage('');
    } catch (error) {
      toast.error('فشل إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectConversation = (conv) => {
    dispatch(setCurrentConversation(conv));
  };

  const filteredConversations = conversations.filter(conv => 
    conv.participant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner />;

  const currentMessages = messages[currentConversation?.id] || [];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ 
        background: '#2c3e50', 
        padding: '15px 20px', 
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        flexShrink: 0
      }}>
        <button 
          onClick={() => navigate('/admin/dashboard')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px'
          }}
        >
          <ArrowRight size={18} /> رجوع
        </button>
        <h2 style={{ margin: 0, color: 'white' }}>الرسائل - لوحة التحكم</h2>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: '320px', background: 'white', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '15px', borderBottom: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0f0f0', borderRadius: '20px', padding: '5px 15px' }}>
              <Search size={18} color="#999" />
              <input type="text" placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, border: 'none', background: 'none', outline: 'none', padding: '8px 0' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}><div style={{ fontSize: 48 }}>💬</div><p>لا توجد محادثات</p></div>
            ) : (
              filteredConversations.map((conv) => (
                <div key={conv.id} onClick={() => handleSelectConversation(conv)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', cursor: 'pointer', background: currentConversation?.id === conv.id ? '#e8f4fd' : 'white', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px', flexShrink: 0 }}>{conv.participant?.name?.[0] || '?'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontWeight: 'bold' }}>{conv.participant?.name}</span><span style={{ fontSize: '11px', color: '#999' }}>{conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' }) : ''}</span></div>
                    <div style={{ fontSize: '13px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.last_message || 'بدء محادثة'}</div>
                  </div>
                  {conv.unread_count > 0 && <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#e74c3c', color: 'white', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{conv.unread_count}</div>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
          {currentConversation ? (
            <>
              <div style={{ background: 'white', padding: '15px 20px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>{currentConversation.participant?.name?.[0] || '?'}</div>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 'bold' }}>{currentConversation.participant?.name}</div><div style={{ fontSize: '12px', color: '#999' }}>{currentConversation.participant?.role === 'client' ? 'عميل' : 'عامل'}</div></div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', marginTop: '50px' }}><div style={{ fontSize: 48 }}>💬</div><p>لا توجد رسائل بعد</p></div>
                ) : (
                  currentMessages.map((msg, idx) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>
                        <div style={{ maxWidth: '70%', padding: '10px 15px', borderRadius: '18px', background: isMe ? '#3498db' : 'white', color: isMe ? 'white' : '#333', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                          <div>{msg.message}</div>
                          <div style={{ fontSize: '10px', marginTop: '4px', textAlign: 'right', color: isMe ? 'rgba(255,255,255,0.7)' : '#999' }}>{new Date(msg.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ background: 'white', padding: '15px 20px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '12px', alignItems: 'flex-end', flexShrink: 0 }}>
                <textarea placeholder="اكتب رسالتك..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown} rows={1} style={{ flex: 1, padding: '10px 15px', border: '1px solid #e0e0e0', borderRadius: '20px', resize: 'none', fontFamily: 'inherit', fontSize: '14px', outline: 'none' }} />
                <button onClick={handleSend} disabled={sending || !newMessage.trim()} style={{ width: '40px', height: '40px', borderRadius: '50%', background: (!newMessage.trim() || sending) ? '#ccc' : '#3498db', border: 'none', color: 'white', cursor: (!newMessage.trim() || sending) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sending ? '⏳' : <Send size={18} />}</button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '100px' }}><div style={{ fontSize: 64 }}>💬</div><h3>اختر محادثة للبدء</h3></div>
          )}
        </div>
      </div>
    </div>
  );
}
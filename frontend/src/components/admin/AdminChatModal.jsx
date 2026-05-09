// src/pages/admin/AdminMessages.jsx
import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';

// Mock data for conversations
const MOCK_CONVERSATIONS = [
  {
    id: 1,
    user_id: 101,
    user_name: 'أحمد العلوي',
    user_avatar: 'أ',
    user_role: 'client',
    last_message: 'شكراً جزيلاً على المساعدة',
    last_message_time: 'قبل 5 دقائق',
    unread_count: 2,
    online: true,
    request_id: '#1054',
    request_title: 'إصلاح تسرب مياه',
  },
  {
    id: 2,
    user_id: 102,
    user_name: 'فاطمة الزهراء',
    user_avatar: 'ف',
    user_role: 'client',
    last_message: 'متى سيتم حل المشكلة؟',
    last_message_time: 'قبل ساعة',
    unread_count: 1,
    online: false,
    request_id: '#1053',
    request_title: 'تركيب لوحة كهربائية',
  },
  {
    id: 3,
    user_id: 103,
    user_name: 'كريم السوسي',
    user_avatar: 'ك',
    user_role: 'worker',
    last_message: 'تم إنجاز الطلب بنجاح',
    last_message_time: 'أمس',
    unread_count: 0,
    online: true,
    request_id: '#1052',
    request_title: 'دهان صالون وغرفتين',
  },
  {
    id: 4,
    user_id: 104,
    user_name: 'سارة بناني',
    user_avatar: 'س',
    user_role: 'client',
    last_message: 'هل يمكنك مساعدتي؟',
    last_message_time: 'منذ يومين',
    unread_count: 0,
    online: false,
    request_id: '#1051',
    request_title: 'تنسيق حديقة منزلية',
  },
];

// Mock messages for each conversation
const MOCK_MESSAGES = {
  1: [
    { id: 1, sender: 'user', text: 'السلام عليكم، عندي مشكلة في الطلب', time: '10:30', is_from_admin: false },
    { id: 2, sender: 'admin', text: 'وعليكم السلام. كيف يمكنني مساعدتك؟', time: '10:32', is_from_admin: true },
    { id: 3, sender: 'user', text: 'العامل لم يحضر في الوقت المحدد', time: '10:33', is_from_admin: false },
    { id: 4, sender: 'admin', text: 'سأتصل بالعامل حالياً لحل المشكلة', time: '10:35', is_from_admin: true },
    { id: 5, sender: 'user', text: 'شكراً جزيلاً على المساعدة', time: '10:36', is_from_admin: false },
    { id: 6, sender: 'admin', text: 'العفو، تحت أمرك. تم حل المشكلة', time: '10:38', is_from_admin: true },
  ],
  2: [
    { id: 1, sender: 'user', text: 'متى سيتم حل المشكلة؟', time: '14:20', is_from_admin: false },
    { id: 2, sender: 'admin', text: 'جاري التواصل مع العامل', time: '14:22', is_from_admin: true },
  ],
  3: [
    { id: 1, sender: 'user', text: 'تم إنجاز الطلب بنجاح', time: '09:15', is_from_admin: false },
    { id: 2, sender: 'admin', text: 'ممتاز! شكراً لك', time: '09:18', is_from_admin: true },
  ],
  4: [
    { id: 1, sender: 'user', text: 'هل يمكنك مساعدتي؟', time: '16:00', is_from_admin: false },
  ],
};

function ConversationItem({ conv, isActive, onClick }) {
  const getRoleLabel = (role) => {
    return role === 'client' ? 'عميل' : 'عامل';
  };

  const getRoleColor = (role) => {
    return role === 'client' ? 'var(--g500)' : 'var(--n500)';
  };

  return (
    <div className={`msg-conv ${isActive ? 'active' : ''}`} onClick={() => onClick(conv)}>
      <div className="msg-conv__av" style={{ background: `linear-gradient(135deg, ${getRoleColor(conv.user_role)}, ${getRoleColor(conv.user_role)}80)` }}>
        {conv.user_avatar}
        {conv.online && <span className="msg-conv__online" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <div className="msg-conv__name">
            {conv.user_name}
            <span style={{ fontSize: 10, color: 'var(--text3)', marginRight: 6 }}>
              ({getRoleLabel(conv.user_role)})
            </span>
          </div>
          <div className="msg-conv__time">{conv.last_message_time}</div>
        </div>
        <div className="msg-conv__last">{conv.last_message}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
          📋 {conv.request_title}
        </div>
      </div>
      {conv.unread_count > 0 && (
        <div className="msg-conv__badge">{conv.unread_count}</div>
      )}
    </div>
  );
}

function MessageBubble({ message, isAdmin }) {
  return (
    <div className={`msg-bubble msg-bubble--${isAdmin ? 'me' : 'them'}`}>
      <div className={`msg-text msg-text--${isAdmin ? 'me' : 'them'}`}>
        {message.text}
      </div>
      <div className={`msg-time msg-time--${isAdmin ? 'me' : ''}`}>
        {message.time}
      </div>
    </div>
  );
}

export default function AdminMessages({ page, setPageState, usersCount, pendingRequestsCount, pendingWorkersCount }) {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  useEffect(() => {
    if (MOCK_CONVERSATIONS.length > 0) {
      setActiveConversation(MOCK_CONVERSATIONS[0]);
      setMessages(MOCK_MESSAGES[1] || []);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setMessages(MOCK_MESSAGES[conv.id] || []);
    
    // Mark as read
    setConversations(prev =>
      prev.map(c =>
        c.id === conv.id ? { ...c, unread_count: 0 } : c
      )
    );
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    const newMsg = {
      id: Date.now(),
      sender: 'admin',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' }),
      is_from_admin: true,
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    
    // Update last message in conversation list
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversation.id
          ? { ...c, last_message: newMessage.trim(), last_message_time: 'الآن' }
          : c
      )
    );
    
    showToast('✅ تم إرسال الرسالة', 'success');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  return (
    <AdminLayout 
      title={`الرسائل ${totalUnread > 0 ? `(${totalUnread})` : ''}`} 
      page={page} 
      setPage={setPageState}
      usersCount={usersCount}
      pendingRequestsCount={pendingRequestsCount}
      pendingWorkersCount={pendingWorkersCount}
    >
      <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'calc(100vh - 140px)' }}>
        <div className="msg-layout">
          {/* Sidebar - Conversations List */}
          <div className="msg-sidebar">
            <div className="msg-sidebar__search">
              🔍 بحث عن محادثة...
            </div>
            <div className="msg-list">
              {conversations.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={activeConversation?.id === conv.id}
                  onClick={handleSelectConversation}
                />
              ))}
              {conversations.length === 0 && (
                <div className="empty-state" style={{ padding: 40 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                  <div>لا توجد محادثات</div>
                  <div style={{ fontSize: 12, marginTop: 8, color: 'var(--text3)' }}>
                    ستظهر هنا المحادثات عندما يتواصل المستخدمون مع الدعم
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          {activeConversation ? (
            <div className="msg-main">
              <div className="msg-topbar">
                <div className="msg-conv__av" style={{ width: 40, height: 40 }}>
                  {activeConversation.user_avatar}
                  {activeConversation.online && <span className="msg-conv__online" />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {activeConversation.user_name}
                    <span style={{ fontSize: 11, color: 'var(--text3)', marginRight: 8 }}>
                      ({activeConversation.user_role === 'client' ? 'عميل' : 'عامل'})
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: activeConversation.online ? 'var(--success)' : 'var(--text3)', fontWeight: 600 }}>
                    {activeConversation.online ? '● متصل الآن' : '● غير متصل'}
                  </div>
                </div>
                <div style={{ marginRight: 'auto', display: 'flex', gap: 8 }}>
                  <button className="btn btn--ghost btn--sm" title="عرض الطلب">
                    📋 {activeConversation.request_id}
                  </button>
                </div>
              </div>

              <div className="msg-body">
                {messages.map((msg, index) => (
                  <MessageBubble
                    key={index}
                    message={msg}
                    isAdmin={msg.is_from_admin}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="msg-input">
                <textarea
                  className="msg-field"
                  placeholder="اكتب رسالتك هنا... (Enter للإرسال)"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  rows={1}
                  style={{ resize: 'none', fontFamily: 'Cairo, sans-serif' }}
                />
                <button
                  className="msg-send"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  ➤
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>اختر محادثة للبدء</div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                من هنا ستتواصل مع المستخدمين
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <AdminToast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
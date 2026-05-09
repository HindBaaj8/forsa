// pages/worker/WorkerMessages.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import WorkerLayout from '../../components/layout/WorkerLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

// Mock data for conversations
const MOCK_CONVERSATIONS = [
  {
    id: 1,
    client_name: 'أحمد العلوي',
    client_avatar: 'أ',
    client_id: 101,
    last_message: 'متى تقدر تجي تصلح المكيف؟',
    last_message_time: 'قبل 5 دقائق',
    unread_count: 2,
    online: true,
    service: 'تركيب مكيف هواء',
  },
  {
    id: 2,
    client_name: 'فاطمة الزهراء',
    client_avatar: 'ف',
    client_id: 102,
    last_message: 'شكراً على الخدمة الممتازة',
    last_message_time: 'قبل ساعة',
    unread_count: 0,
    online: false,
    service: 'إصلاح تسريب ماء',
  },
  {
    id: 3,
    client_name: 'محمد العمري',
    client_avatar: 'م',
    client_id: 103,
    last_message: 'هل يمكنك الحضور غداً؟',
    last_message_time: 'أمس',
    unread_count: 1,
    online: true,
    service: 'طلاء المنزل',
  },
  {
    id: 4,
    client_name: 'سارة بناني',
    client_avatar: 'س',
    client_id: 104,
    last_message: 'تم استلام الطلب، شكراً',
    last_message_time: 'منذ يومين',
    unread_count: 0,
    online: false,
    service: 'تركيب مطبخ',
  },
];

// Mock messages for each conversation
const MOCK_MESSAGES = {
  1: [
    { id: 1, sender: 'client', text: 'السلام عليكم، عندي مكيف ما كيبرش مزيان', time: '10:30', date: '2024-01-15' },
    { id: 2, sender: 'worker', text: 'وعليكم السلام. واش نوع المكيف؟', time: '10:32', date: '2024-01-15' },
    { id: 3, sender: 'client', text: 'سبليط 18000 وحدة', time: '10:33', date: '2024-01-15' },
    { id: 4, sender: 'worker', text: 'ممتاز. متى تقدر نجي نشوفو؟', time: '10:35', date: '2024-01-15' },
    { id: 5, sender: 'client', text: 'ممكن غداً العصر؟', time: '10:36', date: '2024-01-15' },
    { id: 6, sender: 'worker', text: 'حاضر، غادي نكون عندك الساعة 3', time: '10:38', date: '2024-01-15' },
  ],
  2: [
    { id: 1, sender: 'client', text: 'شكراً جزيلاً على الخدمة', time: '14:20', date: '2024-01-14' },
    { id: 2, sender: 'worker', text: 'العفو، تحت أمرك في أي وقت', time: '14:22', date: '2024-01-14' },
    { id: 3, sender: 'client', text: 'راح ننصح بيك لأصحابي', time: '14:25', date: '2024-01-14' },
  ],
  3: [
    { id: 1, sender: 'client', text: 'هل يمكنك الحضور غداً صباحاً؟', time: '09:15', date: '2024-01-13' },
    { id: 2, sender: 'worker', text: 'نعم ممكن، شنو الساعة المناسبة؟', time: '09:18', date: '2024-01-13' },
    { id: 3, sender: 'client', text: 'الساعة 10 صباحاً', time: '09:20', date: '2024-01-13' },
  ],
  4: [
    { id: 1, sender: 'client', text: 'تم استلام الطلب، شكراً', time: '16:00', date: '2024-01-12' },
    { id: 2, sender: 'worker', text: 'شكراً لك، نتمنى تكون راضي', time: '16:05', date: '2024-01-12' },
  ],
};

function ConversationItem({ conv, isActive, onClick }) {
  return (
    <div className={`msg-conv ${isActive ? 'active' : ''}`} onClick={() => onClick(conv)}>
      <div className="msg-conv__av">
        {conv.client_avatar}
        {conv.online && <span className="msg-conv__online" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <div className="msg-conv__name">{conv.client_name}</div>
          <div className="msg-conv__time">{conv.last_message_time}</div>
        </div>
        <div className="msg-conv__last">{conv.last_message}</div>
        <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>
          📋 {conv.service}
        </div>
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
        {message.text}
      </div>
      <div className={`msg-time msg-time--${isMe ? 'me' : ''}`}>
        {message.time}
      </div>
    </div>
  );
}

export default function WorkerMessages() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Load conversations
    const loadConversations = async () => {
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 800));
      setConversations(MOCK_CONVERSATIONS);
      if (MOCK_CONVERSATIONS.length > 0) {
        setActiveConversation(MOCK_CONVERSATIONS[0]);
        setMessages(MOCK_MESSAGES[1] || []);
      }
      setIsLoading(false);
    };
    loadConversations();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    setIsSending(true);
    
    const newMsg = {
      id: Date.now(),
      sender: 'worker',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
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
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 500));
    
    // Simulate worker response (for demo)
    if (newMessage.trim().includes('شكرا') || newMessage.trim().includes('مشكور')) {
      setTimeout(() => {
        const autoReply = {
          id: Date.now() + 1,
          sender: 'client',
          text: 'العفو، تحت أمرك دائماً 🤝',
          time: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toISOString().split('T')[0],
        };
        setMessages(prev => [...prev, autoReply]);
        toast.success('تم استلام رد من العميل');
      }, 1000);
    }
    
    setIsSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) return <LoadingSpinner />;

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
                  <div>لا توجد محادثات بعد</div>
                  <div style={{ fontSize: 12, marginTop: 8 }}>
                    ستظهر هنا المحادثات عندما تتواصل مع العملاء
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          {activeConversation ? (
            <div className="msg-main">
              <div className="msg-topbar">
                <div className="msg-conv__av" style={{ width: 40, height: 40, fontSize: 16 }}>
                  {activeConversation.client_avatar}
                  {activeConversation.online && <span className="msg-conv__online" />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {activeConversation.client_name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                    ● {activeConversation.online ? 'متصل الآن' : 'غير متصل'}
                  </div>
                </div>
                <div style={{ marginRight: 'auto', display: 'flex', gap: 8 }}>
                  <Link to={`/worker/orders/${activeConversation.id}`}>
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
                {messages.map((msg, index) => (
                  <MessageBubble
                    key={index}
                    message={msg}
                    isMe={msg.sender === 'worker'}
                  />
                ))}
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
                />
                <button
                  className="msg-send"
                  onClick={handleSendMessage}
                  disabled={isSending || !newMessage.trim()}
                >
                  {isSending ? '⏳' : '➤'}
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>اختر محادثة للبدء</div>
              <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
                من هنا ستتواصل مع عملائك
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkerLayout>
  );
}
import React, { useState } from 'react';
import { X, Send, User } from 'lucide-react';
import Modal from '../common/Modal';

export default function AdminChatModal({ isOpen, onClose, user }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'مرحباً! أنا من فريق دعم فرصة عمل. كيف يمكنني مساعدتك؟', isAdmin: true, time: '10:30' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    const newMessage = { id: Date.now(), text: message, isAdmin: true, time: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' }) };
    setMessages([...messages, newMessage]);
    setMessage('');
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="محادثة مع العميل" size="lg">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-user">
            <div className="chat-avatar">{user?.client_name?.[0] || user?.name?.[0] || 'م'}</div>
            <div>
              <div className="chat-user-name">{user?.client_name || user?.name || 'المستخدم'}</div>
              <div className="chat-user-role">عميل</div>
            </div>
          </div>
        </div>
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-message ${msg.isAdmin ? 'admin' : 'user'}`}>
              <div className="chat-bubble">{msg.text}</div>
              <div className="chat-time">{msg.time}</div>
            </div>
          ))}
          {loading && <div className="chat-typing">جاري الكتابة...</div>}
        </div>
        <div className="chat-input">
          <textarea className="chat-textarea" placeholder="اكتب رسالتك هنا..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()} />
          <button className="chat-send" onClick={handleSend} disabled={!message.trim()}><Send size={18} /></button>
        </div>
      </div>
    </Modal>
  );
}
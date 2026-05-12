// src/components/admin/AdminChatModal.jsx
import { useState } from 'react';

export default function AdminChatModal({ user, onClose, onSend }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    await onSend(message, user);
    setMessage('');
    setLoading(false);  // ✅ تصحيح الخطأ
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal chat-modal" onClick={e => e.stopPropagation()} style={{maxWidth: 500}}>
        <div className="modal-head">
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <div className="chat-avatar" style={{
              width: 48, height: 48, borderRadius: 50,
              background: 'linear-gradient(135deg, var(--g500), var(--g400))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 'bold', color: 'var(--n900)'
            }}>
              {user?.name?.charAt(0) || user?.user_name?.charAt(0) || 'م'}
            </div>
            <div>
              <div style={{fontWeight: 800, fontSize: 16, color: 'var(--text1)'}}>
                {user?.name || user?.user_name || 'المستخدم'}
              </div>
              <div style={{fontSize: 12, color: 'var(--text3)'}}>
                {user?.role === 'client' ? 'عميل' : user?.role === 'worker' ? 'عامل' : 'مستخدم'}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="chat-info" style={{
          background: 'var(--n50)', borderRadius: 12, padding: 12, marginBottom: 20
        }}>
          <div style={{fontSize: 12, color: 'var(--text3)', marginBottom: 4}}>📋 الطلب المرتبط:</div>
          <div style={{fontWeight: 700, color: 'var(--n700)'}}>{user?.requestTitle || 'لا يوجد طلب محدد'}</div>
          {user?.requestId && (
            <div style={{fontSize: 11, color: 'var(--text3)', marginTop: 4}}>رقم الطلب: {user.requestId}</div>
          )}
        </div>

        <div className="chat-messages" style={{
          maxHeight: 300, overflowY: 'auto', marginBottom: 16,
          background: 'var(--bg)', borderRadius: 12, padding: 12
        }}>
          <div className="chat-message admin" style={{
            display: 'flex', justifyContent: 'flex-start', marginBottom: 12
          }}>
            <div style={{
              background: 'var(--n700)', color: '#fff', padding: '8px 12px',
              borderRadius: 12, maxWidth: '80%', fontSize: 13
            }}>
              مرحباً! أنا من فريق الدعم في منصة فرصة عمل. كيف يمكنني مساعدتك اليوم؟
            </div>
          </div>
        </div>

        <div className="chat-input-area" style={{display: 'flex', gap: 10}}>
          <textarea
            className="form-input"
            rows="2"
            placeholder="اكتب رسالتك هنا..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            style={{flex: 1, resize: 'none'}}
          />
          <button
            className="btn btn-navy"
            onClick={handleSend}
            disabled={loading || !message.trim()}
            style={{alignSelf: 'flex-end'}}
          >
            {loading ? '⏳' : 'إرسال →'}
          </button>
        </div>

        <div className="modal-actions" style={{marginTop: 16, justifyContent: 'center'}}>
          <div style={{fontSize: 11, color: 'var(--text3)', textAlign: 'center'}}>
            ✉️ سيتم إرسال الرسالة من فريق دعم فرصة عمل
          </div>
        </div>
      </div>
    </div>
  );
}
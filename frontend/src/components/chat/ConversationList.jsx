// components/chat/ConversationList.jsx
import { useEffect, useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function ConversationList({ onSelect }) {
  const { conversations, loadConversations, setCurrentConversation, loading } = useChat();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const filteredConversations = conversations.filter(conv =>
    conv.participant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectConversation = (conversation) => {
    setCurrentConversation(conversation);
    onSelect();
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      <div className="conversation-search">
        <input
          type="text"
          placeholder="🔍 بحث في المحادثات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="conversations">
        {filteredConversations.length === 0 ? (
          <div className="no-conversations">
            <div className="no-conversations-icon">💬</div>
            <p>لا توجد محادثات</p>
            <p className="no-conversations-sub">ابدأ محادثة جديدة مع عامل</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className="conversation-item"
              onClick={() => handleSelectConversation(conv)}
            >
              <div className="conversation-avatar">
                {conv.participant?.name?.charAt(0) || '?'}
                {conv.unread_count > 0 && <span className="unread-dot" />}
              </div>
              <div className="conversation-info">
                <div className="conversation-name">
                  {conv.participant?.name}
                  {conv.unread_count > 0 && (
                    <span className="unread-badge">{conv.unread_count}</span>
                  )}
                </div>
                <div className="conversation-last-message">
                  {conv.last_message?.substring(0, 40) || 'بدء محادثة جديدة'}
                </div>
              </div>
              <div className="conversation-time">
                {conv.last_message_at && formatDistanceToNow(new Date(conv.last_message_at), {
                  addSuffix: true,
                  locale: ar,
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .conversation-list {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .conversation-search {
          padding: 12px;
          border-bottom: 1px solid var(--gray200);
        }
        
        .conversation-search input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--gray200);
          border-radius: 24px;
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
        }
        
        .conversation-search input:focus {
          border-color: var(--n400);
          box-shadow: 0 0 0 2px rgba(46, 91, 168, 0.1);
        }
        
        .conversations {
          flex: 1;
          overflow-y: auto;
        }
        
        .conversation-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          cursor: pointer;
          transition: background 0.15s;
          border-bottom: 1px solid var(--gray100);
        }
        
        .conversation-item:hover {
          background: var(--n50);
        }
        
        .conversation-avatar {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--n700), var(--n500));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          flex-shrink: 0;
        }
        
        .unread-dot {
          position: absolute;
          top: 0;
          right: 0;
          width: 12px;
          height: 12px;
          background: var(--error);
          border-radius: 50%;
          border: 2px solid white;
        }
        
        .conversation-info {
          flex: 1;
          min-width: 0;
        }
        
        .conversation-name {
          font-weight: 700;
          font-size: 14px;
          color: var(--text1);
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        
        .unread-badge {
          background: var(--n700);
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
        }
        
        .conversation-last-message {
          font-size: 12px;
          color: var(--text3);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .conversation-time {
          font-size: 10px;
          color: var(--text3);
          white-space: nowrap;
        }
        
        .chat-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 12px;
          color: var(--text3);
        }
        
        .no-conversations {
          text-align: center;
          padding: 48px 20px;
          color: var(--text3);
        }
        
        .no-conversations-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }
        
        .no-conversations-sub {
          font-size: 12px;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
}
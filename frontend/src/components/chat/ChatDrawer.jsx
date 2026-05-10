// components/chat/ChatDrawer.jsx
import { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';

export default function ChatDrawer({ isOpen, onClose, user }) {
  const [activeView, setActiveView] = useState('list'); // 'list' or 'chat'
  const { currentConversation, setCurrentConversation } = useChat();

  useEffect(() => {
    if (!isOpen) {
      setActiveView('list');
      setCurrentConversation(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="chat-drawer-overlay" onClick={onClose}>
      <div className="chat-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="chat-drawer-header">
          <h3>{activeView === 'list' ? 'المحادثات' : currentConversation?.participant?.name}</h3>
          <button className="chat-drawer-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="chat-drawer-content">
          {activeView === 'list' ? (
            <ConversationList onSelect={() => setActiveView('chat')} />
          ) : (
            <ChatWindow onBack={() => setActiveView('list')} />
          )}
        </div>
      </div>

      <style>{`
        .chat-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.2s ease;
        }
        
        .chat-drawer {
          width: 380px;
          height: 100vh;
          background: var(--white);
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s ease;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
        }
        
        .chat-drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--gray200);
          background: var(--n700);
          color: white;
        }
        
        .chat-drawer-header h3 {
          margin: 0;
          font-size: 16px;
        }
        
        .chat-drawer-close {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
        }
        
        .chat-drawer-content {
          flex: 1;
          overflow-y: auto;
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @media (max-width: 768px) {
          .chat-drawer {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
// components/layout/Topbar.jsx
import { useSelector } from 'react-redux';
import NotificationDropdown from '../common/NotificationDropdown';

export default function Topbar({ title, onChatToggle }) {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="topbar">
      <div className="topbar__title">{title}</div>
      <div className="topbar__right">
        <div className="topbar__search">
          <span>🔍</span>
          <input type="text" placeholder="بحث..." />
        </div>
        
        <button className="topbar__chat" onClick={onChatToggle}>
          💬
        </button>
        
        <NotificationDropdown />
        
        <div className="topbar__user">
          <div className="sidebar__avatar" style={{width: 36, height: 36, fontSize: 13}}>
            {user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}` : '??'}
          </div>
          <div className="topbar__user-info">
            <span className="topbar__user-name">
              {user ? `${user.first_name || ''} ${user.last_name || ''}` : 'مرحباً'}
            </span>
            <span className="topbar__user-role">
              {user?.role === 'client' ? 'عميل' : user?.role === 'worker' ? 'مهني' : 'مستخدم'}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .topbar__chat {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1.5px solid var(--gray200);
          background: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .topbar__chat:hover {
          background: var(--n50);
          border-color: var(--n300);
        }
      `}</style>
    </header>
  );
}
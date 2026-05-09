// components/layout/Topbar.jsx
import { useSelector } from 'react-redux';
import NotificationDropdown from '../common/NotificationDropdown';

export default function Topbar({ title }) {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="topbar">
      <div className="topbar__title">{title}</div>
      <div className="topbar__right">
        <div className="topbar__search">
          <span>🔍</span>
          <input type="text" placeholder="بحث..." />
        </div>
        
        {/* Use the NotificationDropdown component */}
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
    </header>
  );
}
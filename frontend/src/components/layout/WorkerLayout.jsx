// components/layout/WorkerLayout.jsx - Version avec NotificationDropdown et lien sidebar
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { logout } from '../../features/auth/authSlice';
import NotificationDropdown from '../common/NotificationDropdown';

export default function WorkerLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // State for badges
  const [pendingOrders, setPendingOrders] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(3);
  const [unreadNotifications, setUnreadNotifications] = useState(5); // ← ZID HADI (Mock)
  
  useEffect(() => {
    setPendingOrders(2);
    setUnreadMessages(3);
    setUnreadNotifications(5); // ← ZID HADI
  }, []);

  const NAV = [
    { icon: '🏠', label: 'الرئيسية', to: '/worker' },
    { icon: '🛠️', label: 'خدماتي', to: '/worker/services' },
    { icon: '📦', label: 'الطلبات', to: '/worker/orders', badge: pendingOrders, badgeRed: true },
    { icon: '📅', label: 'جدول المواعيد', to: '/worker/schedule' },
    { icon: '💬', label: 'الرسائل', to: '/worker/messages', badge: unreadMessages, badgeRed: true },
    { icon: '🔔', label: 'الإشعارات', to: '/notifications', badge: unreadNotifications, badgeRed: true }, // ← ZID HADI
    { icon: '💰', label: 'الأرباح', to: '/worker/earnings' },
    { icon: '👤', label: 'الملف الشخصي', to: '/worker/profile' },
    { icon: '⚙️', label: 'الإعدادات', to: '/worker/settings' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth?mode=login');
  };

  return (
    <div className="worker-layout">
      <aside className="sidebar worker-sidebar">
        <div className="sidebar__brand" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <div className="sidebar__brand-icon">🔍</div>
          <div>
            <div className="sidebar__brand-name">فرصة عمل</div>
            <div className="sidebar__brand-sub">صاحب مهنة</div>
          </div>
        </div>

        <nav className="sidebar__nav">
          <div className="sidebar__label">القائمة</div>
          {NAV.map(n => (
            <Link 
              key={n.to} 
              to={n.to}
              className={`sidebar__item${location.pathname === n.to ? ' active' : ''}`}
            >
              <span className="sidebar__item-icon">{n.icon}</span>
              {n.label}
              {n.badge > 0 && (
                <span className={`sidebar__badge${n.badgeRed ? ' sidebar__badge--red' : ''}`}>
                  {n.badge > 99 ? '99+' : n.badge}
                </span>
              )}
            </Link>
          ))}
          <div className="sidebar__divider" />
          <button className="sidebar__item" onClick={handleLogout}>
            <span className="sidebar__item-icon">🚪</span>
            تسجيل الخروج
          </button>
        </nav>

        <div className="sidebar__user">
          <div className="sidebar__avatar">
            {user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}` : '??'}
          </div>
          <div>
            <div className="sidebar__user-name">
              {user ? `${user.first_name || ''} ${user.last_name || ''}` : 'مرحباً'}
            </div>
            <div className="sidebar__user-role">
              <span className="worker-badge">مهني</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="worker-main">
        <header className="topbar worker-topbar">
          <div className="topbar__title">{title}</div>
          <div className="topbar__right">
            <div className="topbar__search">🔍 بحث...</div>
            
            {/* Notification Dropdown */}
            <NotificationDropdown />
            
            <div className="sidebar__avatar" style={{width: 36, height: 36, fontSize: 13}}>
              {user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}` : '??'}
            </div>
          </div>
        </header>
        <div className="page-content worker-content">{children}</div>
      </main>
    </div>
  );
}
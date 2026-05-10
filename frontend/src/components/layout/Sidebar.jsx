// components/layout/Sidebar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { conversations } = useSelector((state) => state.messages);
  const requests = useSelector((state) => state.client?.requests || []);
  const unreadMessages = conversations?.reduce((sum, c) => sum + (c.unread_count || 0), 0) || 0;
  const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;

  // روابط العميل (Client)
  const clientNav = [
    { icon: '🏠', label: 'الرئيسية', to: '/client' },
    { icon: '🔍', label: 'البحث عن خدمة', to: '/client/search' },
    { icon: '📋', label: 'طلباتي', to: '/client/requests', badge: pendingRequests },
    { icon: '💬', label: 'الرسائل', to: '/client/messages', badge: unreadMessages, badgeRed: true },
    { icon: '❤️', label: 'المفضلة', to: '/client/favorites' },
    { icon: '⚙️', label: 'الإعدادات', to: '/client/settings' },
  ];

  // روابط العامل (Worker)
  const workerNav = [
    { icon: '🏠', label: 'الرئيسية', to: '/worker' },
    { icon: '🛠️', label: 'خدماتي', to: '/worker/services' },
    { icon: '📦', label: 'الطلبات', to: '/worker/orders', badge: pendingRequests, badgeRed: true },
    { icon: '💬', label: 'الرسائل', to: '/worker/messages', badge: unreadMessages, badgeRed: true },
    { icon: '📅', label: 'جدول المواعيد', to: '/worker/schedule' },
    { icon: '💰', label: 'الأرباح', to: '/worker/earnings' },
    { icon: '👤', label: 'الملف الشخصي', to: '/worker/profile' },
    { icon: '⚙️', label: 'الإعدادات', to: '/worker/settings' },
  ];

  const NAV = user?.role === 'client' ? clientNav : workerNav;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth?mode=login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
        <div className="sidebar__brand-icon">🔍</div>
        <div>
          <div className="sidebar__brand-name">فرصة عمل</div>
          <div className="sidebar__brand-sub">فرص الشغل بين يديك</div>
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
            {user?.role === 'client' ? 'عميل' : user?.role === 'worker' ? 'مهني' : 'مستخدم'}
          </div>
        </div>
      </div>
    </aside>
  );
}
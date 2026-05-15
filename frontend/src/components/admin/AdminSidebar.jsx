// components/admin/AdminSidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Briefcase, 
  Tags, 
  DollarSign, 
  Bell, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { logout } from '../../features/auth/authSlice';

// components/admin/AdminSidebar.jsx
const menuItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { path: '/admin/users', icon: Users, label: 'المستخدمين' },
  { path: '/admin/requests', icon: ClipboardList, label: 'الطلبات' },
  { path: '/admin/workers', icon: Briefcase, label: 'العمال' },
  { path: '/admin/settings', icon: Settings, label: 'الإعدادات' },
  { path: '/admin/messages', icon: MessageCircle, label: 'الرسائل' },
];

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ نستعمل useLocation مباشرة
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getInitials = () => {
    if (!user) return 'أ';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'أ';
  };

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className={`sb-nav ${!sidebarOpen ? 'collapsed' : ''}`}>
      <div className="sb-brand">
        <div className="sb-brand-icon">👑</div>
        {sidebarOpen && (
          <div className="sb-brand-info">
            <div className="sb-brand-name">Admin Panel</div>
            <div className="sb-brand-sub">فرصة عمل</div>
          </div>
        )}
        <button className="sb-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '←' : '→'}
        </button>
      </div>

      <div className="sb-section-label">الرئيسية</div>
      {menuItems.map(item => {
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            className={`sb-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <Icon size={18} className="sb-icon" />
            {sidebarOpen && <span>{item.label}</span>}
          </button>
        );
      })}
      
      <div className="sb-divider" />
      
      <button className="sb-item" onClick={handleLogout}>
        <LogOut size={18} className="sb-icon" />
        {sidebarOpen && <span>تسجيل الخروج</span>}
      </button>

      {sidebarOpen && (
        <div className="sb-user">
          <div className="sb-user-av">{getInitials()}</div>
          <div>
            <div className="sb-user-name">{user?.first_name} {user?.last_name}</div>
            <div className="sb-user-role">مدير النظام</div>
          </div>
        </div>
      )}
    </div>
  );
}
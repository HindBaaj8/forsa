import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  ClipboardList, 
  MessageCircle, 
  Heart, 
  Search, 
  Settings, 
  LogOut,
  Briefcase,
  DollarSign,
  Calendar,
  User,
  ShoppingBag,
  Package,
  BarChart3,
  Tags,
  Bell
} from 'lucide-react';
import { logout } from '../../features/auth/authSlice';
import { selectUser } from '../../features/auth/authSelectors';

export default function Sidebar({ role, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const clientMenus = [
    { path: '/client', icon: LayoutDashboard, label: 'الرئيسية' },
    { path: '/client/requests', icon: ClipboardList, label: 'طلباتي' },
    { path: '/client/messages', icon: MessageCircle, label: 'الرسائل' },
    { path: '/client/favorites', icon: Heart, label: 'المفضلة' },
    { path: '/client/search', icon: Search, label: 'بحث عن خدمة' },
    { path: '/client/settings', icon: Settings, label: 'الإعدادات' },
  ];

  const workerMenus = [
    { path: '/worker', icon: LayoutDashboard, label: 'الرئيسية' },
    { path: '/worker/services', icon: ShoppingBag, label: 'خدماتي' },
    { path: '/worker/orders', icon: Package, label: 'الطلبات' },
    { path: '/worker/messages', icon: MessageCircle, label: 'الرسائل' },
    { path: '/worker/earnings', icon: DollarSign, label: 'الأرباح' },
    { path: '/worker/schedule', icon: Calendar, label: 'جدول المواعيد' },
    { path: '/worker/profile', icon: User, label: 'الملف الشخصي' },
    { path: '/worker/settings', icon: Settings, label: 'الإعدادات' },
  ];

  const adminMenus = [
    { path: '/admin', icon: BarChart3, label: 'لوحة التحكم' },
    { path: '/admin/users', icon: User, label: 'المستخدمين' },
    { path: '/admin/requests', icon: ClipboardList, label: 'الطلبات' },
    { path: '/admin/workers', icon: Briefcase, label: 'العمال' },
    { path: '/admin/categories', icon: Tags, label: 'الفئات' },
    { path: '/admin/finance', icon: DollarSign, label: 'المالية' },
    { path: '/admin/alerts', icon: Bell, label: 'الإشعارات' },
    { path: '/admin/settings', icon: Settings, label: 'الإعدادات' },
  ];

  const menus = role === 'client' ? clientMenus : role === 'worker' ? workerMenus : adminMenus;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    if (onClose) onClose();
  };

  const getInitials = () => {
    if (!user) return 'م';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'م';
  };

  const getRoleName = () => {
    if (role === 'client') return 'عميل';
    if (role === 'worker') return 'مهني';
    return 'مدير';
  };

  return (
    <div className="sidebar">
      <div className="sidebar__brand" onClick={() => { navigate('/'); if (onClose) onClose(); }}>
        <div className="sidebar__brand-icon">🔍</div>
        <div>
          <div className="sidebar__brand-name">فرصة عمل</div>
          <div className="sidebar__brand-sub">لتقديم الخدمات</div>
        </div>
      </div>

      <div className="sidebar__nav">
        <div className="sidebar__label">القائمة الرئيسية</div>
        {menus.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar__item ${isActive ? 'active' : ''}`}
              onClick={() => onClose && onClose()}
            >
              <Icon size={18} className="sidebar__item-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="sidebar__user">
        <div className="sidebar__avatar">{getInitials()}</div>
        <div>
          <div className="sidebar__user-name">{user?.first_name} {user?.last_name}</div>
          <div className="sidebar__user-role">{getRoleName()}</div>
        </div>
      </div>

      <div className="sidebar__divider" />
      
      <button className="sidebar__item" onClick={handleLogout}>
        <LogOut size={18} className="sidebar__item-icon" />
        <span>تسجيل الخروج</span>
      </button>
    </div>
  );
}
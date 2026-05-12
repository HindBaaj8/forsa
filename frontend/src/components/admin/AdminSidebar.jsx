import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
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

const menuItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { path: '/admin/users', icon: Users, label: 'المستخدمين' },
  { path: '/admin/requests', icon: ClipboardList, label: 'الطلبات' },
  { path: '/admin/workers', icon: Briefcase, label: 'العمال' },
  { path: '/admin/categories', icon: Tags, label: 'الفئات' },
  { path: '/admin/finance', icon: DollarSign, label: 'المالية' },
  { path: '/admin/alerts', icon: Bell, label: 'الإشعارات' },
  { path: '/admin/settings', icon: Settings, label: 'الإعدادات' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="sb-nav">
      <div className="sb-section-label">الرئيسية</div>
      {menuItems.map(item => {
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            className={`sb-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <Icon size={18} className="sb-icon" />
            <span>{item.label}</span>
          </button>
        );
      })}
      <div className="sb-divider" />
      <button className="sb-item" onClick={handleLogout}>
        <LogOut size={18} className="sb-icon" />
        <span>تسجيل الخروج</span>
      </button>
    </div>
  );
}
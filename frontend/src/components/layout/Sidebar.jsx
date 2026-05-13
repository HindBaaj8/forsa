import React, { useState, useEffect } from 'react';
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
  Bell,
  Home,
  Star,
  CreditCard
} from 'lucide-react';
import { logout } from '../../features/auth/authSlice';
import { selectUser } from '../../features/auth/authSelectors';

export default function Sidebar({ role, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  // 🔥 أضف حالة محلية للمستخدم
  const [currentUser, setCurrentUser] = useState(user);

  // 🔥 تحديث المستخدم المحلي عندما يتغير user في Redux
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // 🔥 استمع للتغييرات في localStorage (إذا حدث تحديث من مكان آخر)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  // ✅ تحسين عرض الحروف الأولى (يستخدم currentUser بدل user)
  const getInitials = () => {
    if (!currentUser) return 'م';
    const firstInitial = currentUser.first_name?.[0] || '';
    const lastInitial = currentUser.last_name?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase() || 'م';
  };

  const getRoleName = () => {
    if (role === 'client') return 'عميل';
    if (role === 'worker') return 'مهني';
    return 'مدير';
  };

  // ✅ الحصول على الصورة الرمزية (يستخدم currentUser)
  const getAvatar = () => {
    if (currentUser?.avatar) {
      return currentUser.avatar;
    }
    return null;
  };

  // ✅ الحصول على الاسم الكامل
  const getFullName = () => {
    if (!currentUser) return 'مرحباً';
    return `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 'مستخدم';
  };

  return (
    <div className="sidebar">
      {/* Brand Section */}
      <div className="sidebar__brand" onClick={() => { navigate('/'); if (onClose) onClose(); }}>
        <div className="sidebar__brand-icon">🔍</div>
        <div>
          <div className="sidebar__brand-name">فرصة <span className="brand-gold">عمل</span></div>
          <div className="sidebar__brand-sub">لتقديم الخدمات</div>
        </div>
      </div>

      {/* Navigation Section */}
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

      {/* User Section - 🔥 يتغير تلقائياً عند التعديل */}
      <div className="sidebar__user">
        <div className="sidebar__avatar">
          {getAvatar() ? (
            <img src={getAvatar()} alt="Avatar" className="sidebar__avatar-img" />
          ) : (
            getInitials()
          )}
        </div>
        <div>
          <div className="sidebar__user-name">
            {getFullName()}
          </div>
          <div className="sidebar__user-role">{getRoleName()}</div>
        </div>
      </div>

      <div className="sidebar__divider" />
      
      {/* Logout Button */}
      <button className="sidebar__item" onClick={handleLogout}>
        <LogOut size={18} className="sidebar__item-icon" />
        <span>تسجيل الخروج</span>
      </button>

      <style>{`
        .brand-gold {
          color: var(--g500);
        }
        
        .sidebar__avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 14px;
          object-fit: cover;
        }
        
        .sidebar__user-name {
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 4px;
        }
        
        .sidebar__user-role {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
        }
        
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(100%);
            transition: transform 0.3s ease;
          }
          
          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
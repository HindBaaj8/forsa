import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';

export default function AdminTopbar({ title, onMenuClick, user }) {
  const navigate = useNavigate();

  const getInitials = () => {
    if (!user) return 'أ';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'أ';
  };

  return (
    <div className="admin-topbar">
      <div className="admin-topbar-title">{title}</div>
      <div className="admin-topbar-right">
        <div className="admin-topbar-search">
          <Search size={16} />
          <input type="text" placeholder="بحث..." />
        </div>
        <div className="admin-topbar-notif" onClick={() => navigate('/notifications')}>
          <Bell size={18} />
          <div className="notif-dot" />
        </div>
        <div className="sb-user">
          <div className="sb-user-av">{getInitials()}</div>
          <div>
            <div className="sb-user-name">{user?.first_name} {user?.last_name}</div>
            <div className="sb-user-role">مدير النظام</div>
          </div>
        </div>
        <button className="admin-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
      </div>
    </div>
  );
}
// components/admin/AdminTopbar.jsx
import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminTopbar({ title, user, onMenuClick }) {
  const navigate = useNavigate();

  const getInitials = () => {
    if (!user) return 'أ';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'أ';
  };

  return (
    <div className="admin-topbar">
      <div className="admin-topbar-left">
        <button className="admin-topbar-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div className="admin-topbar-title">{title}</div>
      </div>

      <div className="admin-topbar-right">
        <div className="admin-topbar-search">
          <span>🔍</span>
          <input type="text" placeholder="بحث..." />
        </div>
        
        <div className="admin-topbar-notif" onClick={() => navigate('/admin/alerts')}>
          <Bell size={18} />
          <div className="notif-dot" />
        </div>

        <div className="sb-user">
          <div className="sb-user-av">{getInitials()}</div>
          <div className="sb-user-info">
            <div className="sb-user-name">{user?.first_name} {user?.last_name}</div>
            <div className="sb-user-role">مدير النظام</div>
          </div>
        </div>
      </div>
    </div>
  );
}
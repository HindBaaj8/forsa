import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';

export default function Topbar({ title, onMenuClick, notificationCount = 0 }) {
  const navigate = useNavigate();

  return (
    <div className="topbar">
      <div className="topbar__title">{title}</div>
      <div className="topbar__right">
        <div className="topbar__search">
          <Search size={16} />
          <input type="text" placeholder="بحث..." />
        </div>
        <div className="topbar__notif" onClick={() => navigate('/notifications')}>
          <Bell size={18} />
          {notificationCount > 0 && <div className="topbar__notif-dot" />}
        </div>
        <button className="topbar__menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
      </div>
    </div>
  );
}
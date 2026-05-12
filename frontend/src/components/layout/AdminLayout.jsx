import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import AdminSidebar from '../admin/AdminSidebar';
import AdminTopbar from '../admin/AdminTopbar';
import { selectUser } from '../../features/auth/authSelectors';

export default function AdminLayout({ children, title }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useSelector(selectUser);

  return (
    <div className="admin-layout">
      <div className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <AdminSidebar />
      </div>
      <div className="admin-main">
        <AdminTopbar title={title} onMenuClick={() => setMobileOpen(!mobileOpen)} user={user} />
        <div className="admin-page">{children}</div>
      </div>
    </div>
  );
}
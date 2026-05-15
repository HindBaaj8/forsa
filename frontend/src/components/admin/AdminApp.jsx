// components/layout/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../admin/AdminSidebar';
import AdminTopbar from '../admin/AdminTopbar';

export default function AdminLayout({ children, title }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <div style={{ flex: 1 }}>
        <AdminTopbar title={title} />
        <div style={{ padding: '20px' }}>
          {children || <Outlet />}  {/* ✅ مهم جداً */}
        </div>
      </div>
    </div>
  );
}
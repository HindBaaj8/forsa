// components/layout/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../admin/AdminSidebar';
import AdminTopbar from '../admin/AdminTopbar';

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <div style={{ flex: 1, background: '#f5f5f5' }}>
        <AdminTopbar />
        <div style={{ padding: '20px' }}>
          <Outlet />  {/* ✅ هذا هو الحل */}
        </div>
      </div>
    </div>
  );
}
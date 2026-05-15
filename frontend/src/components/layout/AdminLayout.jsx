// src/components/layout/AdminLayout.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import AdminSidebar from '../admin/AdminSidebar';
import AdminTopbar from '../admin/AdminTopbar';

export default function AdminLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = useSelector((state) => state.auth.user);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar - ثابت على اليمين */}
      <div style={{
        width: sidebarOpen ? '260px' : '70px',
        backgroundColor: '#1f2937',
        color: 'white',
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100vh',
        transition: 'width 0.3s',
        zIndex: 100
      }}>
        <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Main Content - بجانب الـ sidebar */}
      <div style={{
        flex: 1,
        marginRight: sidebarOpen ? '260px' : '70px',  // ✅ نفس عرض الـ sidebar
        transition: 'margin-right 0.3s',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        <AdminTopbar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          user={user} 
        />
        <div style={{
          padding: '24px',
          backgroundColor: '#f3f4f6',
          flex: 1
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
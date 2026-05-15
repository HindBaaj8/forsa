// src/pages/AdminApp.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

// Import pages
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminUsers from '../components/admin/AdminUsers';
import AdminWorkers from '../components/admin/AdminWorkers';
import AdminRequests from '../components/admin/AdminRequests';
import AdminSettings from '../components/admin/AdminSettings';

import '../styles/Admin.css';

const AdminApp = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('ليس لديك صلاحية الوصول');
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="workers" element={<AdminWorkers />} />
      <Route path="requests" element={<AdminRequests />} />
      <Route path="settings" element={<AdminSettings />} />
    </Routes>
  );
};

export default AdminApp;
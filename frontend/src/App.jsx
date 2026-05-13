import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from './features/auth/authSelectors';
import { useRealtime } from './hooks/useRealtime';

import './styles/global.css';
import './styles/variables.css';
import './styles/Dashboard.css';
import './styles/Auth.css';
import './styles/Navbar.css';

// Pages
import Home from './pages/Home';
import Auth from './components/auth/Auth';
import NotificationsPage from './pages/NotificationsPage';

// Admin
import AdminApp from './pages/AdminApp';

// Client
import ClientDashboard from './components/client/ClientDashboard';
import ClientRequests from './components/client/ClientRequests';
import ClientMessages from './components/client/ClientMessages';
import ClientFavorites from './components/client/ClientFavorites';
import ClientSettings from './components/client/ClientSettings';
import ClientSearch from './components/client/ClientSearch';
import ChangePassword from './components/client/ChangePassword';
import PaymentMethods from './components/client/PaymentMethods';

// Worker
import WorkerDashboard from './components/worker/WorkerDashboard';
import WorkerServices from './components/worker/WorkerServices';
import WorkerOrders from './components/worker/WorkerOrders';
import WorkerMessages from './components/worker/WorkerMessages';
import WorkerEarnings from './components/worker/WorkerEarnings';
import WorkerSchedule from './components/worker/WorkerSchedule';
import WorkerProfile from './components/worker/WorkerProfile';
import WorkerSettings from './components/worker/WorkerSettings';
import WorkerChangePassword from './components/worker/WorkerChangePassword';
import WorkerPaymentMethods from './components/worker/WorkerPaymentMethods';

// Route Guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  if (!isAuthenticated) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  useRealtime();
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/notifications" element={<NotificationsPage />} />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminApp />
        </ProtectedRoute>
      } />

      {/* Client Routes */}
      <Route path="/client" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ClientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/client/requests" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ClientRequests />
        </ProtectedRoute>
      } />
      <Route path="/client/messages" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ClientMessages />
        </ProtectedRoute>
      } />
      <Route path="/client/favorites" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ClientFavorites />
        </ProtectedRoute>
      } />
      <Route path="/client/settings" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ClientSettings />
        </ProtectedRoute>
      } />
      <Route path="/client/search" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ClientSearch />
        </ProtectedRoute>
      } />
      <Route path="/client/change-password" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ChangePassword />
        </ProtectedRoute>
      } />
      <Route path="/client/payment-methods" element={
        <ProtectedRoute allowedRoles={['client']}>
          <PaymentMethods />
        </ProtectedRoute>
      } />

      {/* Worker Routes */}
      <Route path="/worker" element={
        <ProtectedRoute allowedRoles={['worker']}>
          <WorkerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/worker/services" element={
        <ProtectedRoute allowedRoles={['worker']}>
          <WorkerServices />
        </ProtectedRoute>
      } />
      <Route path="/worker/orders" element={
        <ProtectedRoute allowedRoles={['worker']}>
          <WorkerOrders />
        </ProtectedRoute>
      } />
      <Route path="/worker/messages" element={
        <ProtectedRoute allowedRoles={['worker']}>
          <WorkerMessages />
        </ProtectedRoute>
      } />
      <Route path="/worker/earnings" element={
        <ProtectedRoute allowedRoles={['worker']}>
          <WorkerEarnings />
        </ProtectedRoute>
      } />
      <Route path="/worker/schedule" element={
        <ProtectedRoute allowedRoles={['worker']}>
          <WorkerSchedule />
        </ProtectedRoute>
      } />
      <Route path="/worker/profile" element={
        <ProtectedRoute allowedRoles={['worker']}>
          <WorkerProfile />
        </ProtectedRoute>
      } />
      <Route path="/worker/settings" element={
        <ProtectedRoute allowedRoles={['worker']}>
          <WorkerSettings />
        </ProtectedRoute>
      } />
      
      {/* ✅ Worker Extra Routes */}
      <Route path="/worker/change-password" element={
        <ProtectedRoute allowedRoles={['worker']}>
          <WorkerChangePassword />
        </ProtectedRoute>
      } />
      <Route path="/worker/payment-methods" element={
        <ProtectedRoute allowedRoles={['worker']}>
          <WorkerPaymentMethods />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
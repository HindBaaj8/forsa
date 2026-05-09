// App.jsx - Version complète avec Client, Worker et Admin
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';

// Styles
import './styles/global.css';
import './styles/Dashboard.css';
import './styles/Auth.css';
import './styles/Home.css';
import './styles/Navbar.css';
import './styles/Admin.css';

// Pages publiques
import Home from './pages/Home';
import Auth from './pages/Auth';

// ==================== PAGES CLIENT ====================
import ClientDashboard from './pages/client/ClientDashboard';
import ClientSearch from './pages/client/ClientSearch';
import ClientRequests from './pages/client/ClientRequests';
import ClientMessages from './pages/client/ClientMessages';
import ClientFavorites from './pages/client/ClientFavorites';
import ClientSettings from './pages/client/ClientSettings';
import ChangePassword from './pages/client/ChangePassword';
import PaymentMethods from './pages/client/PaymentMethods';

// ==================== PAGES WORKER ====================
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerOrders from './pages/worker/WorkerOrders';
import WorkerServices from './pages/worker/WorkerServices';
import WorkerSchedule from './pages/worker/WorkerSchedule';
import WorkerEarnings from './pages/worker/WorkerEarnings';
import WorkerProfile from './pages/worker/WorkerProfile';
import WorkerSettings from './pages/worker/WorkerSettings';
import WorkerMessages from './pages/worker/WorkerMessages';

import NotificationsPage from './pages/NotificationsPage';


// ==================== PAGES ADMIN ====================
import AdminApp from './pages/admin/AdminApp';

// Composant Protected Route
function Protected({ children, allowedRoles = [] }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/auth?mode=login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Composant 404
function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Cairo, sans-serif',
      direction: 'rtl',
      flexDirection: 'column',
      gap: 16
    }}>
      <div style={{ fontSize: 72, fontWeight: 900, color: '#1e3a6e' }}>٤٠٤</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#334155' }}>الصفحة غير موجودة</div>
      <a href="/" style={{
        padding: '10px 24px',
        background: '#1e3a6e',
        color: '#fff',
        borderRadius: 12,
        fontWeight: 700,
        fontSize: 14,
        textDecoration: 'none'
      }}>
        العودة للرئيسية
      </a>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster 
          position="top-center" 
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Cairo, sans-serif',
              fontSize: '14px',
            },
          }}
        />
        <Routes>
          {/* ==================== ROUTES PUBLIQUES ==================== */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
          <Route path="/register" element={<Navigate to="/auth?mode=register" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/auth?mode=forgot" replace />} />

          {/* ==================== ROUTES CLIENT ==================== */}
          <Route path="/client" element={
            <Protected allowedRoles={['client']}>
              <ClientDashboard />
            </Protected>
          } />
          <Route path="/client/search" element={
            <Protected allowedRoles={['client']}>
              <ClientSearch />
            </Protected>
          } />
          <Route path="/client/requests" element={
            <Protected allowedRoles={['client']}>
              <ClientRequests />
            </Protected>
          } />
          <Route path="/client/messages" element={
            <Protected allowedRoles={['client']}>
              <ClientMessages />
            </Protected>
          } />
          <Route path="/client/favorites" element={
            <Protected allowedRoles={['client']}>
              <ClientFavorites />
            </Protected>
          } />
          <Route path="/client/settings" element={
            <Protected allowedRoles={['client']}>
              <ClientSettings />
            </Protected>
          } />
          <Route path="/client/change-password" element={
            <Protected allowedRoles={['client']}>
              <ChangePassword />
            </Protected>
          } />
          <Route path="/client/payment-methods" element={
            <Protected allowedRoles={['client']}>
              <PaymentMethods />
            </Protected>
          } />

          {/* ==================== ROUTES WORKER ==================== */}
          <Route path="/worker" element={
            <Protected allowedRoles={['worker']}>
              <WorkerDashboard />
            </Protected>
          } />
          <Route path="/worker/orders" element={
            <Protected allowedRoles={['worker']}>
              <WorkerOrders />
            </Protected>
          } />
          <Route path="/worker/services" element={
            <Protected allowedRoles={['worker']}>
              <WorkerServices />
            </Protected>
          } />
          <Route path="/worker/messages" element={
            <Protected allowedRoles={['worker']}>
              <WorkerMessages />
            </Protected>
          } />
          <Route path="/worker/schedule" element={
            <Protected allowedRoles={['worker']}>
              <WorkerSchedule />
            </Protected>
          } />
          <Route path="/worker/earnings" element={
            <Protected allowedRoles={['worker']}>
              <WorkerEarnings />
            </Protected>
          } />
          <Route path="/worker/profile" element={
            <Protected allowedRoles={['worker']}>
              <WorkerProfile />
            </Protected>
          } />
          <Route path="/worker/settings" element={
            <Protected allowedRoles={['worker']}>
              <WorkerSettings />
            </Protected>
          } />

          {/* ==================== ROUTES ADMIN ==================== */}
          <Route path="/admin/*" element={
            <Protected allowedRoles={['admin']}>
              <AdminApp />
            </Protected>
          } />
          <Route path="/notifications" element={
  <Protected allowedRoles={['client', 'worker']}>
    <NotificationsPage />
  </Protected>
} />

          {/* ==================== 404 ==================== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
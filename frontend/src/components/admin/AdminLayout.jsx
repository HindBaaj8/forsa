// components/admin/AdminLayout.jsx
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import NotificationDropdown from '../common/NotificationDropdown'; // ← ZID HADI

export default function AdminLayout({ children, title, page, setPage, usersCount, pendingRequestsCount, pendingWorkersCount }) {
  return (
    <div className="admin-layout">
      <AdminSidebar 
        page={page} 
        setPage={setPage}
        usersCount={usersCount}
        pendingRequestsCount={pendingRequestsCount}
        pendingWorkersCount={pendingWorkersCount}
      />
      <main className="admin-main">
        <AdminTopbar title={title} page={page} />
        
        {/* ← ZID HADI - Notification Dropdown after AdminTopbar */}
        {/* Note: If you want notifications inside AdminTopbar, modify AdminTopbar.jsx instead */}
        
        <div className="admin-page">
          {children}
        </div>
      </main>
    </div>
  );
}
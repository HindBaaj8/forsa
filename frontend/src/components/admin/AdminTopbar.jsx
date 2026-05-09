// components/admin/AdminTopbar.jsx
import NotificationDropdown from '../common/NotificationDropdown'; // ← ZID HADI

export default function AdminTopbar({ title, page }) {
  return (
    <div className="admin-topbar">
      <div className="admin-topbar-title">{title}</div>
      <div className="admin-topbar-right">
        <div className="admin-topbar-search">
          <span>🔍</span>
          <input type="text" placeholder="البحث في النظام..." />
        </div>
        
        {/* ← ZID HADI - Notification Dropdown (moderne) */}
        <NotificationDropdown />
        
        {/* ← HADI TALET - L'ancienne notification (optionnel, tu peux la garder ou la supprimer) */}
        {/* <div className="admin-topbar-notif">
          🔔
          <div className="notif-dot"></div>
        </div> */}
      </div>
    </div>
  );
}
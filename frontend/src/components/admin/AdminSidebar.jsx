// src/components/admin/AdminSidebar.jsx
export default function AdminSidebar({ page, setPage, usersCount, pendingRequestsCount, pendingWorkersCount }) {
  const navItems = [
    { section:"الرئيسية", items:[
      { key:"dashboard", icon:"📊", label:"لوحة التحكم" },
      { key:"users", icon:"👥", label:"المستخدمون", badge:usersCount },
    ]},
    { section:"الإدارة", items:[
      { key:"requests", icon:"📋", label:"الطلبات", badge:pendingRequestsCount, badgeClass:"sb-badge-gold" },
      { key:"workers", icon:"🔧", label:"العمال", badge:pendingWorkersCount, badgeClass:"sb-badge-gold" },
      { key:"categories", icon:"🏷️", label:"الفئات" },
    ]},
    { section:"المالية", items:[
      { key:"finance", icon:"💰", label:"المالية" },
    ]},
    { section:"الإعدادات", items:[
      { key:"settings", icon:"⚙️", label:"الإعدادات" },
      { key:"alerts", icon:"🔔", label:"الإشعارات", badge:3, badgeClass:"sb-badge-red" },
    ]},
  ];

  return (
    <div className="admin-sidebar">  {/* ← CHANGÉ: sidebar → admin-sidebar */}
      <div className="sb-brand">
        <div className="sb-brand-icon">🛡</div>
        <div>
          <div className="sb-brand-name">خدمة</div>
          <div className="sb-brand-sub">لوحة الإدارة</div>
        </div>
      </div>

      <div className="sb-nav">
        {navItems.map(group => (
          <div key={group.section}>
            <div className="sb-section-label">{group.section}</div>
            {group.items.map(item => (
              <button key={item.key} className={`sb-item${page===item.key?" active":""}`} onClick={()=>setPage(item.key)}>
                <span className="sb-icon">{item.icon}</span>
                {item.label}
                {item.badge > 0 && <span className={`sb-badge ${item.badgeClass||""}`}>{item.badge}</span>}
              </button>
            ))}
            <div className="sb-divider" />
          </div>
        ))}
      </div>

      <div className="sb-user">
        <div className="sb-user-av">أح</div>
        <div>
          <div className="sb-user-name">أحمد المدير</div>
          <div className="sb-user-role">Super Admin</div>
        </div>
      </div>
    </div>
  );
}
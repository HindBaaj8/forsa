// src/pages/admin/AdminWorkers.jsx
import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminToast from '../../components/admin/AdminToast';
import { WORKERS } from '../../hooks/useAdminData';

export default function AdminWorkers({ page, setPageState, usersCount, pendingRequestsCount, pendingWorkersCount }) {
  const [workers, setWorkers] = useState(WORKERS);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type="success") => setToast({ msg, type });

  const filtered = filter === "all" ? workers : workers.filter(w => w.status === filter);

  const toggleBlock = (id) => {
    setWorkers(prev => prev.map(w => w.id===id ? {...w, status: w.status==="blocked"?"active":"blocked"} : w));
    showToast("تم تغيير حالة العامل", "info");
  };

  const approve = (id) => {
    setWorkers(prev => prev.map(w => w.id===id ? {...w, status:"active"} : w));
    showToast("✅ تم قبول العامل", "success");
  };

  return (
    <AdminLayout 
      title="العمال" 
      page={page} 
      setPage={setPageState}
      usersCount={usersCount}
      pendingRequestsCount={pendingRequestsCount}
      pendingWorkersCount={pendingWorkersCount}
    >
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {["all","active","pending","blocked"].map(f => (
          <button key={f} className="btn" onClick={()=>setFilter(f)}
            style={{padding:"8px 18px",borderRadius:50,fontSize:13,fontWeight:700,
              background: filter===f ? "var(--n700)" : "var(--white)",
              color: filter===f ? "#fff" : "var(--text2)",
              border: `1.5px solid ${filter===f?"var(--n700)":"var(--gray200)"}`,
            }}>
            {f==="all"?"الكل":f==="active"?"نشط":f==="pending"?"معلق":"محظور"}
          </button>
        ))}
        <button className="btn btn-navy" style={{marginRight:"auto"}}>+ إضافة عامل</button>
      </div>

      <div className="grid-3">
        {filtered.map(w => (
          <div className="worker-card" key={w.id}>
            <div className="wk-header">
              <div className="wk-av" style={{background:w.color}}>{w.initials}</div>
              <div style={{flex:1}}>
                <div className="wk-name">{w.name}</div>
                <div className="wk-specialty">{w.specialty} • {w.city}</div>
                {w.rating > 0 && (
                  <div className="wk-stars">{"⭐".repeat(Math.floor(w.rating))} <span style={{fontSize:11,color:"var(--text3)",fontWeight:700}}>{w.rating}</span></div>
                )}
              </div>
              <AdminBadge type={w.status} />
            </div>
            <div className="wk-stats">
              <div className="wk-stat"><div className="wk-stat-num">{w.orders}</div><div className="wk-stat-label">طلب</div></div>
              <div className="wk-stat"><div className="wk-stat-num" style={{fontSize:12}}>{w.earnings}</div><div className="wk-stat-label">أرباح</div></div>
              <div className="wk-stat"><div className="wk-stat-num">{w.rating || "—"}</div><div className="wk-stat-label">تقييم</div></div>
            </div>
            <div className="wk-actions">
              {w.status === "pending" && (
                <button className="btn btn-success btn-sm" style={{flex:1}} onClick={()=>approve(w.id)}>✓ قبول</button>
              )}
              <button className={`btn btn-sm ${w.status==="blocked"?"btn-success":"btn-danger"}`} style={{flex:1}} onClick={()=>toggleBlock(w.id)}>
                {w.status==="blocked" ? "رفع الحظر" : "حظر"}
              </button>
              <button className="btn btn-ghost btn-sm">✏️</button>
            </div>
          </div>
        ))}
      </div>
      {toast && <AdminToast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
    </AdminLayout>
  );
}
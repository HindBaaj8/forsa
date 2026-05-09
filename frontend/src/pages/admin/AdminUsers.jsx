// src/pages/admin/AdminUsers.jsx
import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminModal from '../../components/admin/AdminModal';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';
import AdminToast from '../../components/admin/AdminToast';

const roleLabel = { client:"عميل", worker:"عامل", admin:"مشرف" };
const roleClass = { client:"client", worker:"worker", admin:"admin" };

export default function AdminUsers({ users, setUsers, page, setPageState, usersCount, pendingRequestsCount, pendingWorkersCount }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 8;

  const showToast = (msg, type="success") => setToast({ msg, type });

  const filtered = users.filter(u => {
    const matchSearch = u.name.includes(search) || u.email.includes(search) || u.phone.includes(search);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((currentPage-1)*PER_PAGE, currentPage*PER_PAGE);

  const handleSave = (u) => {
    setUsers(prev => prev.find(x=>x.id===u.id) ? prev.map(x=>x.id===u.id?u:x) : [...prev, u]);
    showToast(u.id ? "✅ تم تحديث المستخدم" : "✅ تم إضافة المستخدم", "success");
  };

  const handleDelete = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    showToast("🗑 تم حذف المستخدم", "error");
  };

  const toggleBlock = (id) => {
    setUsers(prev => prev.map(u => u.id===id ? {...u, status: u.status==="blocked"?"active":"blocked"} : u));
    showToast("تم تغيير حالة المستخدم", "info");
  };

  return (
    <AdminLayout 
      title="إدارة المستخدمين" 
      page={page} 
      setPage={setPageState}
      usersCount={usersCount}
      pendingRequestsCount={pendingRequestsCount}
      pendingWorkersCount={pendingWorkersCount}
    >
      <div className="mini-stats">
        {[
          { icon:"👥", num:users.length, label:"الكل", cls:"sc-icon-blue" },
          { icon:"✅", num:users.filter(u=>u.status==="active").length, label:"نشط", cls:"sc-icon-green" },
          { icon:"⏳", num:users.filter(u=>u.status==="pending").length, label:"معلق", cls:"sc-icon-gold" },
          { icon:"🚫", num:users.filter(u=>u.status==="blocked").length, label:"محظور", cls:"sc-icon-red" },
          { icon:"🔧", num:users.filter(u=>u.role==="worker").length, label:"عمال", cls:"sc-icon-blue" },
        ].map((s,i) => (
          <div className="mini-stat" key={i}>
            <div className={`mini-stat-icon ${s.cls}`}>{s.icon}</div>
            <div><div className="mini-stat-num">{s.num}</div><div className="mini-stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="users-toolbar">
        <div className="filters-row">
          <div className="search-wrap">
            <input className="search-inp" value={search} onChange={e=>{setSearch(e.target.value);setCurrentPage(1);}} placeholder="ابحث بالاسم، البريد، الهاتف..." />
            <span className="search-icon-abs">🔍</span>
          </div>
          <select className="select-filter" value={roleFilter} onChange={e=>{setRoleFilter(e.target.value);setCurrentPage(1);}}>
            <option value="all">كل الأدوار</option>
            <option value="client">عميل</option>
            <option value="worker">عامل</option>
            <option value="admin">مشرف</option>
          </select>
          <select className="select-filter" value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setCurrentPage(1);}}>
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="pending">معلق</option>
            <option value="blocked">محظور</option>
          </select>
        </div>
        <button className="btn btn-navy" onClick={()=>setModal("add")}>+ إضافة مستخدم</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>المستخدم</th><th>الهاتف</th><th>المدينة</th><th>الدور</th><th>الحالة</th><th>الانضمام</th><th>الطلبات</th><th>الإجراءات</th></tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} style={{textAlign:"center",padding:40,color:"var(--text3)"}}>لا توجد نتائج</td></tr>
              ) : paginated.map(u => (
                <tr key={u.id}>
                  <td><div className="td-user"><div className="td-av" style={{background:u.color}}>{u.name.slice(0,2)}</div><div><div className="td-name">{u.name}</div><div className="td-sub">{u.email}</div></div></div></td>
                  <td style={{fontSize:12,color:"var(--text2)"}}>{u.phone}</td>
                  <td style={{fontSize:12,color:"var(--text2)"}}>{u.city}</td>
                  <td><AdminBadge type={roleClass[u.role]} label={roleLabel[u.role]} /></td>
                  <td><AdminBadge type={u.status} /></td>
                  <td style={{fontSize:12,color:"var(--text3)"}}>{u.date}</td>
                  <td style={{fontWeight:800,textAlign:"center"}}>{u.orders}</td>
                  <td>
                    <div style={{display:"flex",gap:6}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>setModal(u)}>✏️</button>
                      <button className={`btn btn-sm ${u.status==="blocked"?"btn-success":"btn-danger"}`} onClick={()=>toggleBlock(u.id)}>
                        {u.status==="blocked" ? "رفع الحظر" : "حظر"}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={()=>setConfirm(u.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,paddingTop:14,borderTop:"1px solid var(--gray100)"}}>
          <div style={{fontSize:12,color:"var(--text3)"}}>عرض <strong>{Math.min(paginated.length, PER_PAGE)}</strong> من <strong>{filtered.length}</strong> نتيجة</div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button className="btn btn-ghost btn-sm" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)}>→ السابق</button>
            {Array.from({length:pages},(_, i)=>(
              <button key={i} className={`btn btn-sm ${currentPage===i+1?"btn-navy":"btn-ghost"}`} onClick={()=>setCurrentPage(i+1)}>{i+1}</button>
            ))}
            <button className="btn btn-ghost btn-sm" disabled={currentPage===pages||pages===0} onClick={()=>setCurrentPage(p=>p+1)}>التالي ←</button>
          </div>
        </div>
      </div>

      {modal && <AdminModal user={modal==="add"?null:modal} onClose={()=>setModal(null)} onSave={handleSave} />}
      {confirm && <AdminConfirmModal message="هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء." onConfirm={()=>handleDelete(confirm)} onClose={()=>setConfirm(null)} />}
      {toast && <AdminToast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
    </AdminLayout>
  );
}
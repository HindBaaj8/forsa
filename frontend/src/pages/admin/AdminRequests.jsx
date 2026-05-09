// src/pages/admin/AdminRequests.jsx
import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminToast from '../../components/admin/AdminToast';
import AdminChatModal from '../../components/admin/AdminChatModal';

export default function AdminRequests({ requests, setRequests, page, setPageState, usersCount, pendingRequestsCount, pendingWorkersCount }) {
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const [chatUser, setChatUser] = useState(null); // User to chat with

  const showToast = (msg, type="success") => setToast({ msg, type });

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  const updateStatus = (id, status) => {
    setRequests(prev => prev.map(r => r.id===id ? {...r, status} : r));
    showToast("✅ تم تحديث حالة الطلب", "success");
  };

  const openChat = (request) => {
    setChatUser({
      id: request.clientId || request.id,
      name: request.client,
      role: 'client',
      requestId: request.id,
      requestTitle: request.title,
      email: request.clientEmail || `${request.client}@example.com`,
    });
  };

  const closeChat = () => {
    setChatUser(null);
  };

  const sendMessageToUser = async (message, user) => {
    // Simulate sending message (replace with actual API call)
    await new Promise(r => setTimeout(r, 800));
    
    console.log(`📧 Message sent to ${user.name} (${user.email}):`, message);
    console.log(`📋 Request ID: ${user.requestId}`);
    console.log(`👤 From: فريق فرصة عمل (support@forsaoumal.ma)`);
    
    showToast(`✅ تم إرسال رسالتك إلى ${user.name}`, "success");
    
    // Here you would make an API call to your backend
    // await api.post('/admin/send-message', { userId: user.id, message, requestId: user.requestId });
  };

  const statusTabs = [
    { key:"all", label:"الكل", count:requests.length },
    { key:"active", label:"نشط", count:requests.filter(r=>r.status==="active").length },
    { key:"pending", label:"معلق", count:requests.filter(r=>r.status==="pending").length },
    { key:"progress", label:"جاري", count:requests.filter(r=>r.status==="progress").length },
    { key:"done", label:"مكتمل", count:requests.filter(r=>r.status==="done").length },
  ];

  return (
    <AdminLayout 
      title="الطلبات" 
      page={page} 
      setPage={setPageState}
      usersCount={usersCount}
      pendingRequestsCount={pendingRequestsCount}
      pendingWorkersCount={pendingWorkersCount}
    >
      {/* Status Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:20,borderBottom:"1px solid var(--gray200)",paddingBottom:12,flexWrap:"wrap"}}>
        {statusTabs.map(t => (
          <button key={t.key} onClick={()=>setFilter(t.key)}
            className="btn"
            style={{padding:"7px 16px",borderRadius:50,fontSize:13,fontWeight:700,
              background: filter===t.key ? "var(--n700)" : "none",
              color: filter===t.key ? "#fff" : "var(--text3)",
            }}>
            {t.label} <span style={{background:filter===t.key?"rgba(255,255,255,.2)":"var(--gray200)",padding:"1px 7px",borderRadius:50,fontSize:11,marginRight:4,fontWeight:800,color:filter===t.key?"#fff":"var(--text2)"}}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filtered.length === 0 ? (
        <div className="card" style={{textAlign:"center",padding:60,color:"var(--text3)"}}>
          <div style={{fontSize:48,marginBottom:12}}>📋</div>
          <div style={{fontSize:15,fontWeight:700}}>لا توجد طلبات</div>
        </div>
      ) : filtered.map(r => (
        <div className="req-card" key={r.id}>
          <div className="req-card-head">
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:11,fontWeight:800,color:"var(--text3)",background:"var(--gray100)",padding:"3px 10px",borderRadius:50}}>{r.id}</div>
              <div className="req-title">{r.title}</div>
              <span style={{background:"var(--n50)",color:"var(--n700)",padding:"3px 10px",borderRadius:50,fontSize:11,fontWeight:800}}>{r.category}</span>
            </div>
            <AdminBadge type={r.status} />
          </div>
          <p style={{fontSize:13,color:"var(--text2)",lineHeight:1.6,marginBottom:12}}>{r.desc}</p>
          <div className="req-meta">
            <div className="req-meta-item">👤 {r.client}</div>
            <div className="req-meta-item">📍 {r.city}</div>
            <div className="req-meta-item">📅 {r.date}</div>
            <div className="req-meta-item" style={{color:"var(--n700)",fontWeight:800}}>💰 {r.price}</div>
          </div>
          <div className="req-worker">
            <div className="req-worker-av">{r.worker.slice(0,2)}</div>
            <div>
              <div className="req-worker-name">{r.worker}</div>
              <div className="req-worker-price">العامل المكلف • {r.price}</div>
            </div>
          </div>
          <div className="req-actions">
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => openChat(r)}
              style={{display: 'flex', alignItems: 'center', gap: 6}}
            >
              💬 مراسلة {r.client}
            </button>
            <button className="btn btn-danger btn-sm" onClick={()=>{setRequests(prev=>prev.filter(x=>x.id!==r.id));showToast("تم حذف الطلب","error");}}>🗑 حذف</button>
          </div>
        </div>
      ))}

      {/* Chat Modal */}
      {chatUser && (
        <AdminChatModal 
          user={chatUser}
          onClose={closeChat}
          onSend={sendMessageToUser}
        />
      )}

      {toast && <AdminToast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
    </AdminLayout>
  );
}
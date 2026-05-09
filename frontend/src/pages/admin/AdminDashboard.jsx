// src/pages/admin/AdminDashboard.jsx
import AdminLayout from '../../components/admin/AdminLayout';
import AdminBadge from '../../components/admin/AdminBadge';
import { CHART_DATA } from '../../hooks/useAdminData';

export default function AdminDashboard({ users, requests, setPage, page, setPageState, usersCount, pendingRequestsCount, pendingWorkersCount }) {
  const active = requests.filter(r => r.status === "active").length;
  const maxVal = Math.max(...CHART_DATA.map(d => d.val));

  return (
    <AdminLayout 
      title="لوحة التحكم" 
      page={page} 
      setPage={setPageState}
      usersCount={usersCount}
      pendingRequestsCount={pendingRequestsCount}
      pendingWorkersCount={pendingWorkersCount}
    >
      {/* Welcome */}
      <div className="welcome-card">
        <div>
          <div className="wc-title">مرحباً، أحمد 👋</div>
          <div className="wc-sub">إليك ملخص النشاط اليومي للمنصة</div>
        </div>
        <div className="wc-stats">
          <div className="wc-stat"><span className="wc-stat-num">{users.length}</span><span className="wc-stat-label">مستخدم</span></div>
          <div className="wc-stat"><span className="wc-stat-num">{users.filter(u=>u.role==="worker").length}</span><span className="wc-stat-label">عامل</span></div>
          <div className="wc-stat"><span className="wc-stat-num">{requests.length}</span><span className="wc-stat-label">طلب</span></div>
          <div className="wc-stat"><span className="wc-stat-num">98.2%</span><span className="wc-stat-label">رضا</span></div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="sc-top"><div className="sc-label">إجمالي المستخدمين</div><div className="sc-icon sc-icon-blue">👥</div></div>
          <div className="sc-num">{users.length}</div>
          <div className="sc-trend sc-up">↑ +12.5% هذا الشهر</div>
        </div>
        <div className="stat-card">
          <div className="sc-top"><div className="sc-label">الطلبات النشطة</div><div className="sc-icon sc-icon-gold">📋</div></div>
          <div className="sc-num">{active}</div>
          <div className="sc-trend sc-up">↑ +8.3% هذا الأسبوع</div>
        </div>
        <div className="stat-card">
          <div className="sc-top"><div className="sc-label">الإيرادات الشهرية</div><div className="sc-icon sc-icon-green">💰</div></div>
          <div className="sc-num">48,920</div>
          <div className="sc-trend sc-up">↑ +22% الشهر الماضي</div>
        </div>
        <div className="stat-card">
          <div className="sc-top"><div className="sc-label">المستخدمون المحظورون</div><div className="sc-icon sc-icon-red">🚫</div></div>
          <div className="sc-num">{users.filter(u=>u.status==="blocked").length}</div>
          <div className="sc-trend sc-down">↓ مراجعة مطلوبة</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-main">
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-head">
              <span className="card-title">نشاط الطلبات — هذا الأسبوع</span>
              <button className="card-link" onClick={()=>setPageState("requests")}>عرض التقارير</button>
            </div>
            <div className="chart-bars">
              {CHART_DATA.map((d,i) => (
                <div className="bar-col" key={i}>
                  <div className="bar" style={{height:`${Math.round((d.val/maxVal)*110)}px`,background:i===5?"var(--n700)":"var(--n300)"}}></div>
                  <div className="bar-lbl">{d.day}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <span className="card-title">آخر الطلبات</span>
              <button className="card-link" onClick={()=>setPageState("requests")}>عرض الكل</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>العميل</th><th>الخدمة</th><th>العامل</th><th>الحالة</th><th>السعر</th></tr>
                </thead>
                <tbody>
                  {requests.slice(0,5).map(r => (
                    <tr key={r.id}>
                      <td><div className="td-user"><div className="td-av" style={{background:"var(--n700)"}}>{r.client.slice(0,2)}</div><div><div className="td-name">{r.client}</div><div className="td-sub">{r.category}</div></div></div></td>
                      <td>{r.title}</td>
                      <td style={{fontSize:12,color:"var(--text2)"}}>{r.worker}</td>
                      <td><AdminBadge type={r.status} /></td>
                      <td style={{fontWeight:800,color:"var(--n700)"}}>{r.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-head"><span className="card-title">النشاط الأخير</span></div>
            {[
              { dot:"act-blue", icon:"👤", text:"مستخدم جديد سجّل في المنصة", time:"منذ 5 دقائق" },
              { dot:"act-green", icon:"✅", text:`طلب ${requests[0]?.id||"#1054"} اكتمل بنجاح`, time:"منذ 18 دقيقة" },
              { dot:"act-gold", icon:"💰", text:"دفعة جديدة 580 درهم", time:"منذ 32 دقيقة" },
              { dot:"act-red", icon:"🚫", text:"بلاغ على عامل — مراجعة", time:"منذ 1 ساعة" },
            ].map((a,i) => (
              <div className="act-item" key={i}>
                <div className={`act-dot ${a.dot}`}>{a.icon}</div>
                <div><div className="act-text">{a.text}</div><div className="act-time">{a.time}</div></div>
              </div>
            ))}
          </div>

          <div className="card" style={{background:"linear-gradient(135deg,var(--n900),var(--n700))",border:"none"}}>
            <div style={{fontSize:14,fontWeight:800,color:"#fff",marginBottom:10}}>⚡ إجراءات سريعة</div>
            {[
              { icon:"👥", label:"إدارة المستخدمين", page:"users" },
              { icon:"📋", label:"مراجعة الطلبات المعلقة", page:"requests" },
              { icon:"🔧", label:"العمال المنتظرين", page:"workers" },
              { icon:"📈", label:"التقارير الشهرية", page:"finance" },
            ].map((a,i) => (
              <button key={i} className="btn" onClick={()=>setPageState(a.page)}
                style={{background:"rgba(255,255,255,.1)",color:"#fff",padding:"10px 14px",borderRadius:12,fontSize:12,textAlign:"right",justifyContent:"flex-start",width:"100%",marginBottom:6}}>
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
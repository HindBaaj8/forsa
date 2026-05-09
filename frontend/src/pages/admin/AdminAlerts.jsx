// src/pages/admin/AdminAlerts.jsx
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminAlerts({ page, setPageState, usersCount, pendingRequestsCount, pendingWorkersCount }) {
  return (
    <AdminLayout 
      title="الإشعارات" 
      page={page} 
      setPage={setPageState}
      usersCount={usersCount}
      pendingRequestsCount={pendingRequestsCount}
      pendingWorkersCount={pendingWorkersCount}
    >
      <div className="card" style={{textAlign:"center",padding:60}}>
        <div style={{fontSize:48,marginBottom:12}}>🔔</div>
        <div style={{fontSize:16,fontWeight:800}}>الإشعارات</div>
        <div style={{fontSize:13,color:"var(--text3)",marginTop:6}}>3 إشعارات جديدة غير مقروءة</div>
        <div style={{marginTop:20}}>
          <div className="act-item">
            <div className="act-dot act-blue">📋</div>
            <div><div className="act-text">طلب جديد #1055 بحاجة للمراجعة</div><div className="act-time">منذ 5 دقائق</div></div>
          </div>
          <div className="act-item">
            <div className="act-dot act-green">✅</div>
            <div><div className="act-text">تم قبول عامل جديد: سمير حداد</div><div className="act-time">منذ 32 دقيقة</div></div>
          </div>
          <div className="act-item">
            <div className="act-dot act-gold">💰</div>
            <div><div className="act-text">تم استلام دفعة جديدة بقيمة 450 درهم</div><div className="act-time">منذ ساعة</div></div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
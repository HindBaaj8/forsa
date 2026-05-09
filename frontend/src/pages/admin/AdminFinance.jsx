// src/pages/admin/AdminFinance.jsx
import AdminLayout from '../../components/admin/AdminLayout';
import { transactions } from '../../hooks/useAdminData';

export default function AdminFinance({ page, setPageState, usersCount, pendingRequestsCount, pendingWorkersCount }) {
  return (
    <AdminLayout 
      title="الإدارة المالية" 
      page={page} 
      setPage={setPageState}
      usersCount={usersCount}
      pendingRequestsCount={pendingRequestsCount}
      pendingWorkersCount={pendingWorkersCount}
    >
      <div className="stats-grid" style={{marginBottom:20}}>
        <div className="stat-card">
          <div className="sc-top"><div className="sc-label">إجمالي الإيرادات</div><div className="sc-icon sc-icon-green">💰</div></div>
          <div className="sc-num" style={{color:"var(--success)"}}>48,920 د</div>
          <div className="sc-trend sc-up">↑ +22% هذا الشهر</div>
        </div>
        <div className="stat-card">
          <div className="sc-top"><div className="sc-label">المدفوعات للعمال</div><div className="sc-icon sc-icon-gold">💸</div></div>
          <div className="sc-num">12,450 د</div>
          <div className="sc-trend sc-up">↑ +15% هذا الشهر</div>
        </div>
        <div className="stat-card">
          <div className="sc-top"><div className="sc-label">صافي الأرباح</div><div className="sc-icon sc-icon-blue">📊</div></div>
          <div className="sc-num">36,470 د</div>
          <div className="sc-trend sc-up">↑ +25% هذا الشهر</div>
        </div>
        <div className="stat-card">
          <div className="sc-top"><div className="sc-label">معاملات اليوم</div><div className="sc-icon sc-icon-green">⚡</div></div>
          <div className="sc-num">24</div>
          <div className="sc-trend sc-up">↑ +8 عن أمس</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">سجل المعاملات</span>
          <button className="btn btn-ghost btn-sm">📥 تصدير CSV</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>رقم المعاملة</th><th>الوصف</th><th>المبلغ</th><th>طريقة الدفع</th><th>التاريخ</th></tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td style={{fontSize:12,fontWeight:800,color:"var(--text3)"}}>{t.id}</td>
                  <td>{t.desc}</td>
                  <td><span className={t.type==="in" ? "finance-amount-in" : "finance-amount-out"}>{t.amount}</span></td>
                  <td style={{fontSize:12,color:"var(--text3)"}}>{t.method}</td>
                  <td style={{fontSize:12,color:"var(--text3)"}}>{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
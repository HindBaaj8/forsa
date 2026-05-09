// pages/worker/WorkerEarnings.jsx
import WorkerLayout from '../../components/layout/WorkerLayout';

export default function WorkerEarnings() {
  return (
    <WorkerLayout title="الأرباح">
      <div className="page-header">
        <div className="page-header__title">الأرباح</div>
        <div className="page-header__sub">إحصائيات أرباحك</div>
      </div>
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card__label">إجمالي الأرباح</div>
          <div className="stat-card__num" style={{ fontSize: 28 }}>12,500 درهم</div>
          <div className="stat-card__trend stat-card__trend--up">+15% هذا الشهر</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">هذا الشهر</div>
          <div className="stat-card__num" style={{ fontSize: 28 }}>2,300 درهم</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">الطلبات المكتملة</div>
          <div className="stat-card__num" style={{ fontSize: 28 }}>42</div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">سجل الأرباح</div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>الخدمة</th>
                <th>العميل</th>
                <th>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2024-01-15</td>
                <td>تركيب مكيف</td>
                <td>أحمد العلوي</td>
                <td>350 درهم</td>
              </tr>
              <tr>
                <td>2024-01-14</td>
                <td>إصلاح تسريب</td>
                <td>فاطمة الزهراء</td>
                <td>200 درهم</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </WorkerLayout>
  );
}
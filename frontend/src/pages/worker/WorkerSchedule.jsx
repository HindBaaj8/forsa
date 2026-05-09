// pages/worker/WorkerSchedule.jsx
import WorkerLayout from '../../components/layout/WorkerLayout';

export default function WorkerSchedule() {
  return (
    <WorkerLayout title="جدول المواعيد">
      <div className="page-header">
        <div className="page-header__title">جدول المواعيد</div>
        <div className="page-header__sub">مواعيدك القادمة مع العملاء</div>
      </div>
      <div className="card">
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>لا توجد مواعيد</div>
          <div style={{ color: 'var(--text3)' }}>ستظهر هنا المواعيد بعد قبول الطلبات</div>
        </div>
      </div>
    </WorkerLayout>
  );
}
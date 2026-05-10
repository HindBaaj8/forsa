// pages/worker/WorkerEarnings.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWorkerEarnings } from '../../features/worker/workerSlice';
import WorkerLayout from '../../components/layout/WorkerLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function WorkerEarnings() {
  const dispatch = useDispatch();
  const { earnings, isLoading } = useSelector((state) => state.worker);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getWorkerEarnings());
  }, [dispatch]);

  if (isLoading) return <LoadingSpinner />;

  const stats = earnings?.stats || {
    totalEarnings: 0,
    monthlyEarnings: 0,
    completedOrders: 0,
    percentageChange: 0,
  };

  const transactions = earnings?.transactions || [];

  return (
    <WorkerLayout title="الأرباح">
      <div className="page-header">
        <div className="page-header__title">الأرباح</div>
        <div className="page-header__sub">إحصائيات أرباحك</div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card__label">إجمالي الأرباح</div>
          <div className="stat-card__num" style={{ fontSize: 28 }}>
            {stats.totalEarnings.toLocaleString()} درهم
          </div>
          {stats.percentageChange !== 0 && (
            <div className={`stat-card__trend stat-card__trend--${stats.percentageChange > 0 ? 'up' : 'down'}`}>
              {stats.percentageChange > 0 ? '+' : ''}{stats.percentageChange}% هذا الشهر
            </div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-card__label">هذا الشهر</div>
          <div className="stat-card__num" style={{ fontSize: 28 }}>
            {stats.monthlyEarnings.toLocaleString()} درهم
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">الطلبات المكتملة</div>
          <div className="stat-card__num" style={{ fontSize: 28 }}>
            {stats.completedOrders}
          </div>
        </div>
      </div>

      {/* Transactions History */}
      <div className="card">
        <div className="card-title">
          سجل الأرباح
          <button 
            className="btn btn--ghost btn--sm"
            onClick={() => dispatch(getWorkerEarnings())}
          >
            🔄 تحديث
          </button>
        </div>
        
        {transactions.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
            <div style={{ fontWeight: 700 }}>لا توجد معاملات بعد</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 8 }}>
              ستظهر هنا أرباحك عندما تكمل طلباتك
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الخدمة</th>
                  <th>العميل</th>
                  <th>المبلغ</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={transaction.id || index}>
                    <td>{transaction.date || transaction.created_at?.split('T')[0]}</td>
                    <td>{transaction.service_name || transaction.service}</td>
                    <td>{transaction.client_name}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                      +{transaction.amount} درهم
                    </td>
                    <td>
                      <span className={`badge badge--${transaction.status || 'completed'}`}>
                        {transaction.status === 'pending' ? 'قيد المراجعة' : 'مكتمل'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </WorkerLayout>
  );
}
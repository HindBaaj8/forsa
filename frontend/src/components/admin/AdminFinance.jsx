import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Download, RefreshCw, DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import AdminToast from './AdminToast';
import { getFinanceStats } from '../../features/admin/adminSlice';

function StatCard({ title, value, icon: Icon, color, trend }) {
  return (
    <div className="finance-stat">
      <div className="finance-stat__icon" style={{ background: color + '15', color }}>
        <Icon size={24} />
      </div>
      <div>
        <div className="finance-stat__label">{title}</div>
        <div className="finance-stat__value">{value?.toLocaleString()} درهم</div>
        {trend && <div className={`finance-stat__trend ${trend > 0 ? 'up' : 'down'}`}>{trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(trend)}%</div>}
      </div>
    </div>
  );
}

export default function AdminFinance() {
  const dispatch = useDispatch();
  const { finance, isLoading } = useSelector((state) => state.admin);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    dispatch(getFinanceStats());
  }, [dispatch]);

  const handleExport = () => {
    // Export logic
    showToast('تم تصدير البيانات', 'success');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <AdminLayout title="المالية">
      <div className="page-header">
        <h1 className="page-header__title">الإدارة المالية</h1>
        <p className="page-header__sub">إحصائيات المعاملات والأرباح</p>
      </div>

      <div className="finance-stats">
        <StatCard title="إجمالي الإيرادات" value={finance?.totalRevenue} icon={DollarSign} color="#10b981" trend={12} />
        <StatCard title="المدفوعات للعمال" value={finance?.paidToWorkers} icon={Wallet} color="#f59e0b" trend={8} />
        <StatCard title="صافي الأرباح" value={finance?.netProfit} icon={TrendingUp} color="#3b82f6" trend={15} />
      </div>

      <div className="card">
        <div className="card-title">
          سجل المعاملات
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--ghost btn--sm" onClick={handleExport}><Download size={14} /> تصدير</button>
            <button className="btn btn--ghost btn--sm" onClick={() => dispatch(getFinanceStats())}><RefreshCw size={14} /> تحديث</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>رقم المعاملة</th>
                <th>الوصف</th>
                <th>العميل</th>
                <th>العامل</th>
                <th>المبلغ</th>
                <th>طريقة الدفع</th>
                <th>التاريخ</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {finance?.transactions?.map(t => (
                <tr key={t.id}>
                  <td>#{t.id}</td>
                  <td>{t.description}</td>
                  <td>{t.client_name}</td>
                  <td>{t.worker_name}</td>
                  <td className={t.type === 'in' ? 'finance-amount-in' : 'finance-amount-out'}>{t.type === 'in' ? '+' : '-'}{t.amount} درهم</td>
                  <td>{t.method}</td>
                  <td>{t.date}</td>
                  <td><span className={`badge badge--${t.status}`}>{t.status === 'completed' ? 'مكتمل' : 'قيد المراجعة'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
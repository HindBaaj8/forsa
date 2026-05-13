import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DollarSign, TrendingUp, Calendar, Wallet } from 'lucide-react';
import WorkerLayout from '../layout/WorkerLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import { getWorkerEarnings } from '../../features/worker/workerSlice';
import '../../styles/Dashboard.css';

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card__top"><div className="stat-card__label">{title}</div><div className={`stat-card__icon stat-card__icon--${color}`}><Icon size={20} /></div></div>
      <div className="stat-card__num">{value?.toLocaleString() || 0}</div>
    </div>
  );
}

export default function WorkerEarnings() {
  const dispatch = useDispatch();
  const { earnings, isLoading } = useSelector((state) => state.worker);

  useEffect(() => {
    dispatch(getWorkerEarnings());
  }, [dispatch]);

  if (isLoading) return <LoadingSpinner />;

  const stats = earnings?.stats || {};
  const transactions = earnings?.transactions || [];

  return (
    <WorkerLayout title="الأرباح">
      <div className="page-header"><h1 className="page-header__title">الأرباح</h1><p className="page-header__sub">إحصائيات أرباحك</p></div>

      <div className="stats-grid">
        <StatCard title="إجمالي الأرباح" value={stats.totalEarnings} icon={DollarSign} color="gold" />
        <StatCard title="هذا الشهر" value={stats.monthlyEarnings} icon={Calendar} color="navy" />
        <StatCard title="الطلبات المكتملة" value={stats.completedOrders} icon={Wallet} color="green" />
        <StatCard title="المتبقي" value={stats.pendingAmount} icon={TrendingUp} color="yellow" />
      </div>

      <div className="card"><div className="card-title">سجل الأرباح</div>
        {transactions.length === 0 ? (<div className="empty-state"><DollarSign size={48} /><p>لا توجد معاملات بعد</p></div>) : (
          <div className="table-wrap"><table className="table"><thead><tr><th>التاريخ</th><th>الخدمة</th><th>العميل</th><th>المبلغ</th><th>الحالة</th></tr></thead><tbody>
            {transactions.map(t => (<tr key={t.id}><td>{t.date}</td><td>{t.service_name}</td><td>{t.client_name}</td><td className="finance-amount-in">+{t.amount} درهم</td><td><span className={`badge badge--${t.status}`}>{t.status === 'completed' ? 'مكتمل' : 'قيد المراجعة'}</span></td></tr>))}
          </tbody></table></div>
        )}
      </div>
    </WorkerLayout>
  );
}
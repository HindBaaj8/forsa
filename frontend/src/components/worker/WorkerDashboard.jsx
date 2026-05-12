import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Package, Star, TrendingUp, Calendar, MessageCircle } from 'lucide-react';
import WorkerLayout from '../layout/WorkerLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import { getWorkerDashboard } from '../../features/worker/workerSlice';

function StatCard({ title, value, icon: Icon, color, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card__top">
        <div className="stat-card__label">{title}</div>
        <div className={`stat-card__icon stat-card__icon--${color}`}><Icon size={20} /></div>
      </div>
      <div className="stat-card__num">{value?.toLocaleString() || 0}</div>
      {trend && <div className={`stat-card__trend stat-card__trend--${trend > 0 ? 'up' : 'down'}`}><TrendingUp size={12} /> {Math.abs(trend)}%</div>}
    </div>
  );
}

export default function WorkerDashboard() {
  const dispatch = useDispatch();
  const { dashboard, isLoading } = useSelector((state) => state.worker);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getWorkerDashboard());
  }, [dispatch]);

  if (isLoading) return <LoadingSpinner fullPage />;

  const stats = dashboard?.stats || {};

  return (
    <WorkerLayout title="الرئيسية">
      <div className="welcome-section">
        <div>
          <h1 className="welcome-section__title">مرحباً بعودتك, {user?.first_name} 👋</h1>
          <p className="welcome-section__subtitle">هذه نظرة عامة على نشاطك وأرباحك</p>
        </div>
        <Link to="/worker/services/new"><button className="btn btn--gold">➕ إضافة خدمة جديدة</button></Link>
      </div>

      <div className="stats-grid">
        <StatCard title="إجمالي الأرباح" value={stats.totalEarnings} icon={DollarSign} color="gold" trend={15} />
        <StatCard title="الخدمات المنشورة" value={stats.totalServices} icon={ShoppingBag} color="navy" />
        <StatCard title="الطلبات المكتملة" value={stats.completedOrders} icon={Package} color="green" />
        <StatCard title="التقييم" value={`${stats.rating} ★`} icon={Star} color="yellow" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">الطلبات الأخيرة <Link to="/worker/orders" className="card-link">عرض الكل →</Link></div>
          {dashboard?.recentOrders?.length === 0 ? (
            <div className="empty-state"><Package size={48} /><p>لا توجد طلبات بعد</p></div>
          ) : (
            dashboard?.recentOrders?.slice(0, 5).map(order => (
              <div key={order.id} className="order-item">
                <div className="order-item__client">{order.client_name}</div>
                <div className="order-item__service">{order.service_name}</div>
                <div className="order-item__price">{order.price} درهم</div>
                <span className={`badge badge--${order.status}`}>{order.status === 'pending' ? 'معلق' : order.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}</span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-title">جدول المواعيد <Link to="/worker/schedule" className="card-link">عرض الكل →</Link></div>
          {dashboard?.upcomingAppointments?.length === 0 ? (
            <div className="empty-state"><Calendar size={48} /><p>لا توجد مواعيد قادمة</p></div>
          ) : (
            dashboard?.upcomingAppointments?.slice(0, 5).map(app => (
              <div key={app.id} className="appointment-item">
                <div><div className="appointment-item__client">{app.client_name}</div><div className="appointment-item__time">{app.date} • {app.time}</div></div>
                <Link to={`/worker/messages?client=${app.client_id}`}><button className="btn btn--ghost btn--sm"><MessageCircle size={14} /></button></Link>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="tips-card">
        <div className="tips-card__icon">💡</div>
        <div><div className="tips-card__title">نصائح لزيادة أرباحك</div><div className="tips-card__desc">تفاعل بسرعة مع طلبات العملاء لتحصل على تقييمات إيجابية</div></div>
        <Link to="/worker/profile"><button className="btn btn--outline btn--sm">تطوير حسابي →</button></Link>
      </div>
    </WorkerLayout>
  );
}
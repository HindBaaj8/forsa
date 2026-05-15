// components/worker/WorkerDashboard.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, CheckCircle, Star, Briefcase, MessageCircle, Calendar } from 'lucide-react';
import WorkerLayout from '../layout/WorkerLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import { getWorkerDashboard } from '../../features/worker/workerSlice';
import '../../styles/Dashboard.css';

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card__top">
        <div className="stat-card__label">{title}</div>
        <div className={`stat-card__icon stat-card__icon--${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="stat-card__num">{value}</div>
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
      {/* Welcome Section */}
      <div className="welcome-section">
        <div>
          <h1 className="welcome-section__title">مرحباً, {user?.first_name} 👋</h1>
          <p className="welcome-section__subtitle">استعد لتقديم أفضل الخدمات لعملائك</p>
        </div>
        <Link to="/worker/services">
          <button className="btn btn--gold">➕ إضافة خدمة جديدة</button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard 
          title="إجمالي الأرباح" 
          value={`${stats.totalEarnings || 0} درهم`} 
          icon={DollarSign} 
          color="gold" 
        />
        <StatCard 
          title="خدماتي" 
          value={stats.totalServices || 0} 
          icon={ShoppingBag} 
          color="navy" 
        />
        <StatCard 
          title="طلبات مكتملة" 
          value={stats.completedOrders || 0} 
          icon={CheckCircle} 
          color="green" 
        />
        <StatCard 
          title="التقييم" 
          value={stats.rating || 0} 
          icon={Star} 
          color="yellow" 
        />
      </div>

      {/* Two Columns */}
      <div className="grid-2">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-title">
            آخر الطلبات
            <Link to="/worker/orders" className="card-link">عرض الكل →</Link>
          </div>
          {dashboard?.recentOrders?.length === 0 ? (
            <div className="empty-state">
              <Briefcase size={48} />
              <p>لا توجد طلبات بعد</p>
              <Link to="/worker/orders">
                <button className="btn btn--navy btn--sm">عرض الطلبات</button>
              </Link>
            </div>
          ) : (
            dashboard?.recentOrders?.slice(0, 5).map(order => (
              <div key={order.id} className="job-item">
                <div className="job-av">{order.service?.title?.[0] || '📋'}</div>
                <div>
                  <div className="job-item__name">{order.service?.title}</div>
                  <div className="job-item__meta">{order.client?.first_name} {order.client?.last_name} • {order.status}</div>
                </div>
                <div className="job-item__price">{order.agreed_price || order.price} درهم</div>
              </div>
            ))
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="card-title">
            المواعيد القادمة
            <Link to="/worker/schedule" className="card-link">عرض الكل →</Link>
          </div>
          {dashboard?.upcomingAppointments?.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <p>لا توجد مواعيد قادمة</p>
              <Link to="/worker/orders">
                <button className="btn btn--navy btn--sm">استعرض الطلبات</button>
              </Link>
            </div>
          ) : (
            dashboard?.upcomingAppointments?.slice(0, 5).map(app => (
              <div key={app.id} className="job-item">
                <div className="job-av">📅</div>
                <div>
                  <div className="job-item__name">{app.service?.title}</div>
                  <div className="job-item__meta">{app.client?.first_name} {app.client?.last_name}</div>
                </div>
                <div className="job-item__price">{app.status === 'accepted' ? 'قيد الانتظار' : 'قيد التنفيذ'}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="tips-card">
        <div className="tips-card__icon">💡</div>
        <div>
          <div className="tips-card__title">نصائح لزيادة أرباحك</div>
          <div className="tips-card__desc">أضف خدمات جديدة، حافظ على تقييم عالي، واستجب بسرعة لطلبات العملاء</div>
        </div>
        <Link to="/worker/services">
          <button className="btn btn--outline btn--sm">إضافة خدمة →</button>
        </Link>
      </div>
    </WorkerLayout>
  );
}
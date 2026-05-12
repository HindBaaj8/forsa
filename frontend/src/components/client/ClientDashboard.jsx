import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ClipboardList, MessageCircle, Heart, Search, Clock, CheckCircle, Calendar } from 'lucide-react';
import ClientLayout from '../layout/ClientLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import { getClientDashboard } from '../../features/client/clientSlice';

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card__top">
        <div className="stat-card__label">{title}</div>
        <div className={`stat-card__icon stat-card__icon--${color}`}><Icon size={20} /></div>
      </div>
      <div className="stat-card__num">{value}</div>
    </div>
  );
}

export default function ClientDashboard() {
  const dispatch = useDispatch();
  const { dashboard, isLoading } = useSelector((state) => state.client);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getClientDashboard());
  }, [dispatch]);

  if (isLoading) return <LoadingSpinner fullPage />;

  const stats = dashboard?.stats || {};

  return (
    <ClientLayout title="الرئيسية">
      <div className="welcome-section">
        <div>
          <h1 className="welcome-section__title">مرحباً, {user?.first_name} 👋</h1>
          <p className="welcome-section__subtitle">استعد للعثور على أفضل الخدمات</p>
        </div>
        <Link to="/client/requests/new"><button className="btn btn--gold">+ طلب جديد</button></Link>
      </div>

      <div className="stats-grid">
        <StatCard title="طلباتي النشطة" value={stats.activeRequests} icon={ClipboardList} color="navy" />
        <StatCard title="طلبات مكتملة" value={stats.completedRequests} icon={CheckCircle} color="green" />
        <StatCard title="المبلغ المصروف" value={`${stats.totalSpent} درهم`} icon={Calendar} color="gold" />
        <StatCard title="المفضلين" value={stats.favorites} icon={Heart} color="red" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">آخر طلباتي <Link to="/client/requests" className="card-link">عرض الكل →</Link></div>
          {dashboard?.recentRequests?.length === 0 ? (
            <div className="empty-state"><ClipboardList size={48} /><p>لا توجد طلبات بعد</p><Link to="/client/requests/new"><button className="btn btn--navy btn--sm">أنشئ طلبك الأول</button></Link></div>
          ) : (
            dashboard?.recentRequests?.slice(0, 5).map(req => (
              <div key={req.id} className="job-item">
                <div className="job-av">{req.title?.[0]}</div>
                <div><div className="job-item__name">{req.title}</div><div className="job-item__meta">{req.city} • {req.date}</div></div>
                <div className="job-item__price">{req.budget} درهم</div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-title">خدمات مقترحة <Link to="/client/search" className="card-link">استكشاف →</Link></div>
          {dashboard?.featuredServices?.length === 0 ? (
            <div className="empty-state"><Search size={48} /><p>ابحث عن خدمات</p></div>
          ) : (
            dashboard?.featuredServices?.slice(0, 5).map(service => (
              <div key={service.id} className="job-item">
                <div className="job-av">{service.icon || '🔧'}</div>
                <div><div className="job-item__name">{service.title}</div><div className="job-item__meta">{service.category} • {service.city}</div></div>
                <div className="job-item__price">{service.price} درهم</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="tips-card">
        <div className="tips-card__icon">💡</div>
        <div><div className="tips-card__title">نصائح للحصول على أفضل العروض</div><div className="tips-card__desc">وصف دقيق للخدمة التي تحتاجها يساعدك في الحصول على عروض أفضل من المهنيين</div></div>
        <Link to="/client/search"><button className="btn btn--outline btn--sm">ابحث عن خدمة →</button></Link>
      </div>
    </ClientLayout>
  );
}
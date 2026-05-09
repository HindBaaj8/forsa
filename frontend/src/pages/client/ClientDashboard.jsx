// pages/client/ClientDashboard.jsx - VERSION CORRIGÉE
import { useEffect } from 'react';
import { Link } from 'react-router-dom';  // ← TRÈS IMPORTANT: mettre ça au début
import { useDispatch, useSelector } from 'react-redux';
import { getDashboard } from '../../features/client/clientSlice';
import ClientLayout from '../../components/layout/ClientLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
function StatCard({ label, num, trend, up, icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card__top">
        <div className="stat-card__label">{label}</div>
        <div className={`stat-card__icon stat-card__icon--${color}`}>{icon}</div>
      </div>
      <div className="stat-card__num">{num}</div>
      <div className={`stat-card__trend stat-card__trend--${up ? 'up' : 'down'}`}>{trend}</div>
    </div>
  );
}

export default function ClientDashboard() {
  const dispatch = useDispatch();
  const { dashboard, isLoading } = useSelector((state) => state.client);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getDashboard());
  }, [dispatch]);

  if (isLoading) return <LoadingSpinner />;

  const stats = [
    { label: 'طلبات نشطة', num: dashboard.stats?.activeRequests || 0, trend: '+١ هذا الأسبوع', up: true, icon: '📋', color: 'navy' },
    { label: 'طلبات مكتملة', num: dashboard.stats?.completedRequests || 0, trend: 'منذ انضمامك', up: true, icon: '✅', color: 'green' },
    { label: 'الإنفاق الكلي', num: `${dashboard.stats?.totalSpent || 0} دم`, trend: '+٢٠٪ هذا الشهر', up: false, icon: '💰', color: 'gold' },
    { label: 'المهنيون المفضلون', num: dashboard.stats?.favorites || 0, trend: 'مهنيون موثوقون', up: true, icon: '❤️', color: 'navy' },
  ];

  return (
    <ClientLayout title="الرئيسية">
      <div className="page-header">
        <div className="page-header__title">مرحباً بك, {user?.first_name} 👋</div>
        <div className="page-header__sub">هذا ملخص نشاطك على منصة فرصة عمل</div>
      </div>

      <div className="stats-grid">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">
            طلباتي الأخيرة
            <Link to="/client/requests" className="card-link">عرض الكل</Link>
          </div>
          {dashboard.recentRequests?.map((req, i) => (
            <div key={i} className="job-item">
              <div className="job-av">{req.worker_name?.[0] || 'م'}</div>
              <div style={{flex: 1}}>
                <div className="job-item__name">{req.service_name}</div>
                <div className="job-item__meta">📍 {req.city} · {req.time_ago}</div>
              </div>
              <div style={{textAlign: 'left'}}>
                <div className="job-item__price">{req.price} دم</div>
                <span className={`badge badge--${req.status}`}>
                  {req.status === 'active' ? '● جارٍ' : req.status === 'pending' ? '● بانتظار' : '● مكتمل'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="card cta-card">
            <div style={{fontSize: 28, marginBottom: 12}}>💡</div>
            <div className="cta-card-title">انشر طلبك الآن</div>
            <div className="cta-card-desc">صف ما تحتاجه وسيتواصل معك أفضل المهنيين القريبين منك</div>
            <Link to="/client/search">
              <button className="btn btn--gold btn--full">ابحث عن مهني →</button>
            </Link>
          </div>
          <div className="card">
            <div className="card-title">مهنيون مميزون</div>
            {dashboard.featuredWorkers?.map((worker, i) => (
              <div key={i} className="job-item">
                <div className="job-av">{worker.name?.[0] || 'م'}</div>
                <div style={{flex: 1}}>
                  <div className="job-item__name">{worker.name}</div>
                  <div className="job-item__meta">{worker.role} · 📍 {worker.city}</div>
                </div>
                <div style={{color: 'var(--g500)', fontWeight: 700, fontSize: 13}}>{worker.rating}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
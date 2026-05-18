// components/worker/WorkerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, CheckCircle, Star, Briefcase, MessageCircle, Calendar, Crown, TrendingUp, Clock } from 'lucide-react';
import WorkerLayout from '../layout/WorkerLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import { getWorkerDashboard } from '../../features/worker/workerSlice';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
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

// ✅ Premium Analytics Component
function PremiumAnalytics({ analytics }) {
  if (!analytics) return null;
  
  return (
    <div className="premium-analytics-card">
      <div className="premium-analytics-header">
        <Crown size={20} className="premium-icon" />
        <span>تحليلات متقدمة (Premium)</span>
      </div>
      <div className="premium-analytics-grid">
        <div className="analytics-item">
          <div className="analytics-value">{analytics.monthly_growth || 0}%</div>
          <div className="analytics-label">نمو شهري</div>
        </div>
        <div className="analytics-item">
          <div className="analytics-value">{analytics.response_time_avg || 0} د</div>
          <div className="analytics-label">متوسط وقت الرد</div>
        </div>
        <div className="analytics-item">
          <div className="analytics-value">{analytics.completion_rate || 0}%</div>
          <div className="analytics-label">نسبة الإنجاز</div>
        </div>
        <div className="analytics-item">
          <div className="analytics-value">{analytics.total_views || 0}</div>
          <div className="analytics-label">عدد المشاهدات</div>
        </div>
      </div>
    </div>
  );
}

// ✅ Premium Features Badge
function PremiumBadge({ isPremium, premiumUntil }) {
  if (!isPremium) return null;
  
  return (
    <div className="premium-badge-container">
      <div className="premium-badge-large">
        <Crown size={18} />
        <span>عضوية Premium</span>
      </div>
      {premiumUntil && (
        <div className="premium-expiry">
          <Clock size={12} />
          <span>حتى {new Date(premiumUntil).toLocaleDateString('ar')}</span>
        </div>
      )}
    </div>
  );
}

export default function WorkerDashboard() {
  const dispatch = useDispatch();
  const { dashboard, isLoading } = useSelector((state) => state.worker);
  const { user } = useSelector((state) => state.auth);
  const [premiumAnalytics, setPremiumAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [unlimitedRequestsCount, setUnlimitedRequestsCount] = useState(0);

  // ✅ جلب التحليلات للبريميوم
  const fetchPremiumAnalytics = async () => {
    if (!user?.is_premium) return;
    
    setLoadingAnalytics(true);
    try {
      const response = await api.get('/premium/worker/analytics');
      setPremiumAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching premium analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // ✅ جلب عدد الطلبات غير المحدودة
  const fetchUnlimitedRequests = async () => {
    if (!user?.is_premium) return;
    
    try {
      const response = await api.get('/premium/worker/unlimited-requests');
      setUnlimitedRequestsCount(response.data?.data?.length || 0);
    } catch (error) {
      console.error('Error fetching unlimited requests:', error);
    }
  };

  useEffect(() => {
    dispatch(getWorkerDashboard());
    if (user?.is_premium) {
      fetchPremiumAnalytics();
      fetchUnlimitedRequests();
    }
  }, [dispatch, user?.is_premium]);

  if (isLoading) return <LoadingSpinner fullPage />;

  const stats = dashboard?.stats || {};

  return (
    <WorkerLayout title="الرئيسية">
      <div className="welcome-section">
        <div>
          <h1 className="welcome-section__title">مرحباً, {user?.first_name} 👋</h1>
          <p className="welcome-section__subtitle">استعد لتقديم أفضل الخدمات لعملائك</p>
        </div>
        <div className="welcome-actions">
          {/* ✅ Premium Badge */}
          <PremiumBadge isPremium={user?.is_premium} premiumUntil={user?.premium_until} />
          <Link to="/worker/services">
            <button className="btn btn--gold">➕ إضافة خدمة جديدة</button>
          </Link>
        </div>
      </div>

      {/* ✅ Stats Grid */}
      <div className="stats-grid">
        <StatCard title="إجمالي الأرباح" value={`${stats.totalEarnings || 0} درهم`} icon={DollarSign} color="gold" />
        <StatCard title="خدماتي" value={stats.totalServices || 0} icon={ShoppingBag} color="navy" />
        <StatCard title="طلبات مكتملة" value={stats.completedOrders || 0} icon={CheckCircle} color="green" />
        <StatCard title="التقييم" value={stats.rating || 0} icon={Star} color="yellow" />
      </div>

      {/* ✅ Premium Analytics (فقط للبريميوم) */}
      {user?.is_premium && premiumAnalytics && !loadingAnalytics && (
        <PremiumAnalytics analytics={premiumAnalytics} />
      )}

      {/* ✅ Premium Feature: Unlimited Requests */}
      {user?.is_premium && (
        <div className="premium-feature-card">
          <div className="premium-feature-header">
            <Crown size={20} />
            <span>ميزة البريميوم</span>
          </div>
          <div className="premium-feature-content">
            <div className="feature-item">
              <TrendingUp size={18} />
              <span>طلبات غير محدودة: {unlimitedRequestsCount}+ طلب متاح</span>
            </div>
            <Link to="/worker/requests">
              <button className="btn btn--gold btn--sm">استعراض جميع الطلبات →</button>
            </Link>
          </div>
        </div>
      )}

      {/* آخر الطلبات (Orders) */}
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
                <div className="job-item__meta">{order.client?.first_name} {order.client?.last_name} • {order.status === 'completed' ? 'مكتمل' : order.status === 'accepted' ? 'مقبول' : 'قيد التنفيذ'}</div>
              </div>
              <div className="job-item__price">{order.agreed_price || order.price} درهم</div>
            </div>
          ))
        )}
      </div>

      {/* المواعيد القادمة */}
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

      {/* نصائح */}
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
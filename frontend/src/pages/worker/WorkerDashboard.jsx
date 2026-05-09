// pages/worker/WorkerDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import WorkerLayout from '../../components/layout/WorkerLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
//import { getWorkerStats, getRecentOrders } from '../../features/worker/workerSlice';

// Mock data for testing
const MOCK_STATS = {
  totalEarnings: 12500,
  completedOrders: 42,
  pendingOrders: 8,
  rating: 4.8,
  totalReviews: 156,
};

const MOCK_RECENT_ORDERS = [
  {
    id: 1,
    client_name: 'أحمد العلوي',
    client_avatar: 'أ',
    service: 'تركيب مكيف',
    date: '2024-01-15',
    price: 350,
    status: 'completed',
  },
  {
    id: 2,
    client_name: 'فاطمة الزهراء',
    client_avatar: 'ف',
    service: 'إصلاح تسريب ماء',
    date: '2024-01-14',
    price: 200,
    status: 'completed',
  },
  {
    id: 3,
    client_name: 'محمد العمري',
    client_avatar: 'م',
    service: 'طلاء المنزل',
    date: '2024-01-16',
    price: 800,
    status: 'in_progress',
  },
  {
    id: 4,
    client_name: 'سارة بناني',
    client_avatar: 'س',
    service: 'تركيب مطبخ',
    date: '2024-01-17',
    price: 1200,
    status: 'pending',
  },
];

function StatCard({ icon, label, value, color, trend }) {
  return (
    <div className="stat-card worker-stat">
      <div className="stat-card__icon-wrapper" style={{ background: color }}>
        <span className="stat-card__icon">{icon}</span>
      </div>
      <div className="stat-card__info">
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__label">{label}</div>
        {trend && <div className="stat-card__trend">{trend}</div>}
      </div>
    </div>
  );
}

export default function WorkerDashboard() {
  const [stats, setStats] = useState(MOCK_STATS);
  const [recentOrders, setRecentOrders] = useState(MOCK_RECENT_ORDERS);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 800));
      setStats(MOCK_STATS);
      setRecentOrders(MOCK_RECENT_ORDERS);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) return <LoadingSpinner />;

  return (
    <WorkerLayout title="الرئيسية">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-section__content">
          <h1 className="welcome-section__title">
            مرحباً بعودتك, {user?.first_name || 'عزيزي'} المهني 👋
          </h1>
          <p className="welcome-section__subtitle">
            هذه نظرة عامة على نشاطك وأرباحك
          </p>
        </div>
        <div className="welcome-section__actions">
          <Link to="/worker/services">
            <button className="btn btn--gold">➕ إضافة خدمة جديدة</button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid worker-stats">
        <StatCard 
          icon="💰" 
          label="إجمالي الأرباح" 
          value={`${stats.totalEarnings} درهم`}
          color="linear-gradient(135deg, #d4a017, #f0b429)"
          trend="+15% هذا الشهر"
        />
        <StatCard 
          icon="✅" 
          label="طلبات مكتملة" 
          value={stats.completedOrders}
          color="linear-gradient(135deg, #059669, #10b981)"
        />
        <StatCard 
          icon="⏳" 
          label="طلبات معلقة" 
          value={stats.pendingOrders}
          color="linear-gradient(135deg, #d97706, #f59e0b)"
        />
        <StatCard 
          icon="⭐" 
          label="التقييم" 
          value={`${stats.rating} ★`}
          color="linear-gradient(135deg, #7c3aed, #8b5cf6)"
          trend={`${stats.totalReviews} تقييم`}
        />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-title">
          آخر الطلبات
          <Link to="/worker/orders" className="card-link">عرض الكل →</Link>
        </div>
        <div className="orders-table">
          <table className="table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>الخدمة</th>
                <th>التاريخ</th>
                <th>السعر</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td>
                    <div className="orders-table__client">
                      <div className="orders-table__avatar">{order.client_avatar}</div>
                      {order.client_name}
                    </div>
                  </td>
                  <td>{order.service}</td>
                  <td>{order.date}</td>
                  <td>{order.price} درهم</td>
                  <td>
                    <span className={`badge badge--${order.status}`}>
                      {order.status === 'completed' ? 'مكتمل' : 
                       order.status === 'in_progress' ? 'قيد التنفيذ' : 'بانتظار التأكيد'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/worker/orders/${order.id}`}>
                      <button className="btn btn--ghost btn--sm">تفاصيل</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="tips-card">
        <div className="tips-card__icon">💡</div>
        <div className="tips-card__content">
          <div className="tips-card__title">نصائح لزيادة أرباحك</div>
          <div className="tips-card__desc">
            تفاعل بسرعة مع طلبات العملاء لتحصل على تقييمات إيجابية ومزيد من الثقة
          </div>
        </div>
        <Link to="/worker/profile">
          <button className="btn btn--outline btn--sm">تطوير حسابي →</button>
        </Link>
      </div>
    </WorkerLayout>
  );
}
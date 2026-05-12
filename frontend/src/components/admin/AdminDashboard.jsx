import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  ClipboardList, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import { getAdminDashboard } from '../../features/admin/adminSlice';

function StatCard({ title, value, icon: Icon, color, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card__top">
        <div className="stat-card__label">{title}</div>
        <div className={`stat-card__icon stat-card__icon--${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="stat-card__num">{value?.toLocaleString() || 0}</div>
      {trend && <div className={`stat-card__trend stat-card__trend--${trend > 0 ? 'up' : 'down'}`}>
        <TrendingUp size={12} /> {Math.abs(trend)}% هذا الشهر
      </div>}
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { dashboard, isLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAdminDashboard());
  }, [dispatch]);

  if (isLoading) return <LoadingSpinner fullPage />;

  const stats = dashboard?.stats || {};

  return (
    <AdminLayout title="لوحة التحكم">
      <div className="page-header">
        <h1 className="page-header__title">مرحباً بك في لوحة التحكم</h1>
        <p className="page-header__sub">نظرة عامة على أداء المنصة</p>
      </div>

      <div className="stats-grid">
        <StatCard title="إجمالي المستخدمين" value={stats.totalUsers} icon={Users} color="navy" />
        <StatCard title="المهنيين" value={stats.totalWorkers} icon={Briefcase} color="gold" />
        <StatCard title="الطلبات" value={stats.totalRequests} icon={ClipboardList} color="blue" />
        <StatCard title="الإيرادات" value={stats.totalRevenue} icon={DollarSign} color="green" trend={12} />
      </div>

      <div className="grid-2">
        {/* Recent Users */}
        <div className="card">
          <div className="card-title">
            آخر المستخدمين
            <Link to="/admin/users" className="card-link">عرض الكل →</Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>المستخدم</th>
                  <th>البريد</th>
                  <th>الدور</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentUsers?.slice(0, 5).map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="td-user">
                        <div className="td-av">{user.name?.[0] || user.first_name?.[0]}</div>
                        <div className="td-name">{user.name || `${user.first_name} ${user.last_name}`}</div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td><span className={`badge badge--${user.role}`}>{user.role === 'client' ? 'عميل' : user.role === 'worker' ? 'مهني' : 'مدير'}</span></td>
                    <td>{user.created_at?.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="card">
          <div className="card-title">
            آخر الطلبات
            <Link to="/admin/requests" className="card-link">عرض الكل →</Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>الطلب</th>
                  <th>العميل</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentRequests?.slice(0, 5).map(req => (
                  <tr key={req.id}>
                    <td>{req.title}</td>
                    <td>{req.client_name}</td>
                    <td><span className={`badge badge--${req.status}`}>{req.status === 'pending' ? 'معلق' : req.status === 'completed' ? 'مكتمل' : 'نشط'}</span></td>
                    <td>{req.created_at?.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
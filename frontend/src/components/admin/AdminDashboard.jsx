// src/components/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Briefcase, ClipboardList, DollarSign, 
  TrendingUp, TrendingDown, Calendar, UserCheck, 
  UserX, Clock, RefreshCw, Eye, ArrowLeft, ArrowRight 
} from 'lucide-react';
import { getDashboardStats } from '../../features/admin/adminSlice';
import AdminLayout from '../layout/AdminLayout';

// Component للبطاقة الإحصائية مع حركة
const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, delay }) => {
  return (
    <motion.div 
      className="admin-stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="admin-stat-card__top">
        <div className="admin-stat-card__label">{title}</div>
        <div className={`admin-stat-card__icon admin-stat-card__icon--${color}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="admin-stat-card__value">{value?.toLocaleString() || 0}</div>
      {trend && (
        <div className={`admin-stat-card__trend ${trend > 0 ? 'up' : 'down'}`}>
          {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(trend)}%</span>
          <span className="trend-text">منذ الشهر الماضي</span>
        </div>
      )}
    </motion.div>
  );
};

// Component للصفحة الرئيسية
export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { dashboardStats, isLoading } = useSelector((state) => state.admin);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    dispatch(getDashboardStats());
    // تحديث كل 30 ثانية
    const interval = setInterval(() => {
      dispatch(getDashboardStats());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  if (isLoading && !dashboardStats) {
    return (
      <AdminLayout title="لوحة التحكم">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </AdminLayout>
    );
  }

  const stats = dashboardStats?.stats || {};
  const recentUsers = dashboardStats?.recentUsers || [];
  const recentRequests = dashboardStats?.recentRequests || [];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = recentUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(recentUsers.length / itemsPerPage);

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': return { text: 'مدير', class: 'badge--admin', icon: '👑' };
      case 'worker': return { text: 'مهني', class: 'badge--worker', icon: '🔧' };
      default: return { text: 'عميل', class: 'badge--client', icon: '👤' };
    }
  };

  return (
    <AdminLayout title="لوحة التحكم">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="dashboard-header">
          <div className="page-header">
            <motion.h1 
              className="page-header__title"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              📊 لوحة التحكم
            </motion.h1>
            <motion.p 
              className="page-header__sub"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              مرحباً بك في لوحة تحكم المدير
            </motion.p>
          </div>
          
          <motion.button 
            className="refresh-dashboard"
            onClick={() => dispatch(getDashboardStats())}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            <RefreshCw size={18} />
            تحديث
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <StatCard 
            title="إجمالي المستخدمين" 
            value={stats.totalUsers} 
            icon={Users} 
            color="navy" 
            trend={12}
            delay={0.1}
          />
          <StatCard 
            title="المهنيين" 
            value={stats.totalWorkers} 
            icon={Briefcase} 
            color="gold" 
            trend={8}
            delay={0.2}
          />
          <StatCard 
            title="الطلبات" 
            value={stats.totalRequests} 
            icon={ClipboardList} 
            color="blue" 
            trend={15}
            delay={0.3}
          />
          <StatCard 
            title="الإيرادات" 
            value={stats.totalRevenue} 
            icon={DollarSign} 
            color="green" 
            trend={22}
            delay={0.4}
          />
        </div>

        {/* Quick Stats Row */}
        <motion.div 
          className="quick-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="quick-stat">
            <div className="quick-stat__icon quick-stat__icon--primary">
              <UserCheck size={20} />
            </div>
            <div className="quick-stat__info">
              <div className="quick-stat__value">{stats.activeUsers || stats.totalUsers || 0}</div>
              <div className="quick-stat__label">مستخدم نشط</div>
            </div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat__icon quick-stat__icon--warning">
              <Clock size={20} />
            </div>
            <div className="quick-stat__info">
              <div className="quick-stat__value">{stats.pendingRequests || 0}</div>
              <div className="quick-stat__label">طلبات معلقة</div>
            </div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat__icon quick-stat__icon--success">
              <DollarSign size={20} />
            </div>
            <div className="quick-stat__info">
              <div className="quick-stat__value">{stats.completedOrders || 0}</div>
              <div className="quick-stat__label">طلبات مكتملة</div>
            </div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat__icon quick-stat__icon--danger">
              <UserX size={20} />
            </div>
            <div className="quick-stat__info">
              <div className="quick-stat__value">{stats.blockedUsers || 0}</div>
              <div className="quick-stat__label">مستخدم محظور</div>
            </div>
          </div>
        </motion.div>

        {/* Recent Users Table */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="card-title">
            <span>👥 آخر المستخدمين</span>
            <span className="users-count">{recentUsers.length} مستخدم جديد</span>
          </div>
          
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>المستخدم</th>
                  <th>البريد</th>
                  <th>الدور</th>
                  <th>تاريخ التسجيل</th>
                  <th>عرض</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {currentUsers.map((user, index) => {
                    const roleBadge = getRoleBadge(user.role);
                    return (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                      >
                        <td>
                          <div className="td-user">
                            <div className="td-av">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </div>
                            <div>
                              <div className="td-name">{user.first_name} {user.last_name}</div>
                              <div className="td-sub">{user.city || 'مدينة غير محددة'}</div>
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${roleBadge.class}`}>
                            {roleBadge.icon} {roleBadge.text}
                          </span>
                        </td>
                        <td>
                          <span className="date-badge">
                            <Calendar size={12} />
                            {user.created_at?.split('T')[0]}
                          </span>
                        </td>
                        <td>
                          <button className="view-btn" title="عرض التفاصيل">
                            <Eye size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ArrowRight size={16} /> السابق
              </button>
              <span className="pagination-info">
                الصفحة {currentPage} من {totalPages}
              </span>
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                التالي <ArrowLeft size={16} />
              </button>
            </div>
          )}
        </motion.div>

        {/* Recent Requests Section */}
        {recentRequests.length > 0 && (
          <motion.div 
            className="card recent-requests"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="card-title">
              <span>📋 آخر الطلبات</span>
              <button className="card-link">عرض الكل →</button>
            </div>
            <div className="requests-list">
              {recentRequests.slice(0, 3).map((request, index) => (
                <motion.div 
                  key={request.id}
                  className="request-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + (index * 0.1) }}
                >
                  <div className="request-info">
                    <div className="request-title">{request.title}</div>
                    <div className="request-client">👤 {request.client_name}</div>
                  </div>
                  <div className="request-budget">{request.budget} د.م</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AdminLayout>
  );
}
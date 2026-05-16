// src/pages/NotificationsPage.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ClientLayout from '../components/layout/ClientLayout';
import WorkerLayout from '../components/layout/WorkerLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead 
} from '../features/notifications/notificationsSlice';
import { toast } from 'react-hot-toast';
import '../styles/Dashboard.css';

// Helper functions
const getNotificationIcon = (type) => {
  const icons = {
    new_request: '📋',
    request_accepted: '✅',
    request_completed: '🎉',
    new_message: '💬',
    payment_received: '💰',
    worker_applied: '🔧',
    order_status: '📦',
    review_received: '⭐',
    profile_verified: '✓',
  };
  return icons[type] || '🔔';
};

const getNotificationColor = (type) => {
  const colors = {
    new_request: '#2f57ad',
    request_accepted: '#16a34a',
    request_completed: '#16a34a',
    new_message: '#3b82f6',
    payment_received: '#d4a017',
    worker_applied: '#f59e0b',
    order_status: '#3f6bc5',
    review_received: '#d4a017',
    profile_verified: '#16a34a',
  };
  return colors[type] || '#64748b';
};

const getTimeAgo = (date) => {
  if (!date) return 'الآن';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'الآن';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  if (days < 30) return `منذ ${Math.floor(days / 7)} أسبوع`;
  if (days < 365) return `منذ ${Math.floor(days / 30)} شهر`;
  return `منذ ${Math.floor(days / 365)} سنة`;
};

function NotificationFilter({ activeFilter, onFilterChange, counts }) {
  const filters = [
    { key: 'all', label: 'الكل', icon: '📋' },
    { key: 'unread', label: 'غير مقروءة', icon: '🔔', badge: counts.unread },
    { key: 'requests', label: 'الطلبات', icon: '📦' },
    { key: 'messages', label: 'الرسائل', icon: '💬' },
    { key: 'payments', label: 'المدفوعات', icon: '💰' },
  ];

  return (
    <div className="notifications-filters">
      {filters.map(filter => (
        <button
          key={filter.key}
          className={`filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.key)}
        >
          <span className="filter-icon">{filter.icon}</span>
          <span className="filter-label">{filter.label}</span>
          {/* 🔥 اصلاح: التأكد من أن badge رقم وليس كائن */}
          {typeof filter.badge === 'number' && filter.badge > 0 && (
            <span className="filter-badge">{filter.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}

function NotificationCard({ notification, onMarkAsRead, onDelete }) {
  let notificationData = {};
  try {
    notificationData = notification.data 
      ? (typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data)
      : {};
  } catch (e) {
    notificationData = {};
  }
  
  const isRead = !!notification.read_at;
  
  return (
    <div className={`notification-card ${!isRead ? 'unread' : ''}`}>
      <div 
        className="notification-card-icon"
        style={{ background: `${getNotificationColor(notification.type)}15` }}
      >
        <span style={{ color: getNotificationColor(notification.type) }}>
          {getNotificationIcon(notification.type)}
        </span>
      </div>
      
      <div className="notification-card-content">
        <div className="notification-card-header">
          <div className="notification-card-title">{notification.title}</div>
          <div className="notification-card-time">{getTimeAgo(notification.created_at)}</div>
        </div>
        <div className="notification-card-message">{notification.message}</div>
        
        {notification.type === 'worker_applied' && notificationData && (
          <div className="offer-details">
            {notificationData.price && (
              <div className="offer-price">💰 السعر المقترح: {notificationData.price} درهم</div>
            )}
            {notificationData.duration && (
              <div className="offer-duration">⏱️ المدة: {notificationData.duration}</div>
            )}
            {notificationData.message && (
              <div className="offer-message">💬 الرسالة: {notificationData.message}</div>
            )}
          </div>
        )}
        
        {notification.link && (
          <Link 
            to={notification.link} 
            className="notification-card-link" 
            onClick={() => onMarkAsRead(notification.id)}
          >
            عرض التفاصيل ←
          </Link>
        )}
      </div>
      
      <div className="notification-card-actions">
        {!isRead && (
          <button
            className="notification-action-btn mark-read"
            onClick={() => onMarkAsRead(notification.id)}
            title="تحديد كمقروء"
          >
            ✓
          </button>
        )}
        <button
          className="notification-action-btn delete"
          onClick={() => onDelete(notification.id)}
          title="حذف"
        >
          🗑
        </button>
      </div>
      
      {!isRead && <div className="notification-card-dot" />}
    </div>
  );
}

function NotificationsContent() {
  const dispatch = useDispatch();
  const { items: notifications, unreadCount, isLoading, pagination } = useSelector(
    (state) => state.notifications
  );
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getNotifications(page));
    dispatch(getUnreadCount());
  }, [dispatch, page]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(getUnreadCount());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const getFilteredNotifications = () => {
    let filtered = notifications;
    
    switch (filter) {
      case 'unread':
        filtered = notifications.filter(n => !n.read_at);
        break;
      case 'requests':
        filtered = notifications.filter(n => 
          ['new_request', 'request_accepted', 'request_completed', 'order_status', 'worker_applied'].includes(n.type)
        );
        break;
      case 'messages':
        filtered = notifications.filter(n => n.type === 'new_message');
        break;
      case 'payments':
        filtered = notifications.filter(n => n.type === 'payment_received');
        break;
      default:
        break;
    }
    return filtered;
  };

  // 🔥 التأكد من أن counts كلها أرقام
  const counts = {
    total: notifications.length || 0,
    unread: typeof unreadCount === 'number' ? unreadCount : (unreadCount?.count || 0),
    requests: notifications.filter(n => 
      ['new_request', 'request_accepted', 'request_completed', 'order_status', 'worker_applied'].includes(n.type)
    ).length || 0,
    messages: notifications.filter(n => n.type === 'new_message').length || 0,
    payments: notifications.filter(n => n.type === 'payment_received').length || 0,
  };

  const filteredNotifications = getFilteredNotifications();

  const handleMarkAsRead = async (id) => {
    try {
      await dispatch(markAsRead(id)).unwrap();
      await dispatch(getUnreadCount());
      toast.success('تم تحديد الإشعار كمقروء');
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      await dispatch(getUnreadCount());
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleDelete = (id) => {
    toast.success('تم حذف الإشعار');
  };

  if (isLoading && page === 1) return <LoadingSpinner />;

  return (
    <div className="notifications-page">
      <div className="notifications-page-header">
        <div>
          <h1 className="notifications-page-title">الإشعارات</h1>
          <p className="notifications-page-subtitle">
            لديك {counts.unread} إشعار غير مقروء
          </p>
        </div>
        <div className="notifications-page-actions">
          {counts.unread > 0 && (
            <button className="btn-mark-all-read" onClick={handleMarkAllAsRead}>
              تحديد الكل كمقروء
            </button>
          )}
        </div>
      </div>

      <NotificationFilter 
        activeFilter={filter} 
        onFilterChange={setFilter}
        counts={counts}
      />

      {filteredNotifications.length === 0 ? (
        <div className="notifications-empty">
          <div className="notifications-empty-icon">🔔</div>
          <div className="notifications-empty-title">لا توجد إشعارات</div>
          <div className="notifications-empty-subtitle">
            {filter === 'unread' ? 'ليس لديك إشعارات غير مقروءة' :
             filter === 'requests' ? 'لا توجد إشعارات متعلقة بالطلبات' :
             filter === 'messages' ? 'لا توجد رسائل جديدة' :
             filter === 'payments' ? 'لا توجد إشعارات دفع' :
             'ستظهر هنا جميع إشعاراتك'}
          </div>
        </div>
      ) : (
        <>
          <div className="notifications-list">
            {filteredNotifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
          
          {pagination && pagination.last_page > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← السابق
              </button>
              <span className="pagination-info">
                صفحة {page} من {pagination.last_page}
              </span>
              <button 
                className="pagination-btn"
                onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                disabled={page === pagination.last_page}
              >
                التالي →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  if (role === 'client') {
    return (
      <ClientLayout title="الإشعارات">
        <NotificationsContent />
      </ClientLayout>
    );
  } else if (role === 'worker') {
    return (
      <WorkerLayout title="الإشعارات">
        <NotificationsContent />
      </WorkerLayout>
    );
  }

  return <NotificationsContent />;
}
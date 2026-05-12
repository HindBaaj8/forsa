// pages/NotificationsPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ClientLayout from '../components/layout/ClientLayout';
import WorkerLayout from '../components/layout/WorkerLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
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

// Mock data
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'new_request',
    title: 'طلب جديد',
    message: '📋 طلب جديد: تركيب مكيف هواء من أحمد العلوي',
    read: false,
    created_at: new Date().toISOString(),
    link: '/client/requests',
  },
  {
    id: 2,
    type: 'new_message',
    title: 'رسالة جديدة',
    message: '💬 رسالة جديدة من محمد أمين: "متى تقدر تجي تصلح المكيف؟"',
    read: false,
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    link: '/client/messages',
  },
  {
    id: 3,
    type: 'request_accepted',
    title: 'تم قبول الطلب',
    message: '✅ تم قبول طلبك رقم #1053 من قبل العامل كريم السوسي',
    read: true,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    link: '/client/requests',
  },
  {
    id: 4,
    type: 'payment_received',
    title: 'دفعة مستلمة',
    message: '💰 تم استلام 350 درهم من يوسف البلال',
    read: true,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    link: '/client/requests',
  },
  {
    id: 5,
    type: 'request_completed',
    title: 'طلب مكتمل',
    message: '🎉 تم إكمال طلب إصلاح التسريب بنجاح',
    read: true,
    created_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    link: '/client/requests',
  },
  {
    id: 6,
    type: 'review_received',
    title: 'تقييم جديد',
    message: '⭐ قام أحمد العلوي بتقييم خدمتك 5 نجوم',
    read: false,
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    link: '/worker/reviews',
  },
  {
    id: 7,
    type: 'worker_applied',
    title: 'عامل تقدم لطلبك',
    message: '🔧 تقدم العامل محمد أمين لطلبك رقم #1055',
    read: false,
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    link: '/client/requests',
  },
];

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
          {filter.badge > 0 && (
            <span className="filter-badge">{filter.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}

function NotificationCard({ notification, onMarkAsRead, onDelete }) {
  return (
    <div className={`notification-card ${!notification.read ? 'unread' : ''}`}>
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
        {notification.link && (
          <Link to={notification.link} className="notification-card-link" onClick={() => onMarkAsRead(notification.id)}>
            عرض التفاصيل ←
          </Link>
        )}
      </div>
      
      <div className="notification-card-actions">
        {!notification.read && (
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
      
      {!notification.read && <div className="notification-card-dot" />}
    </div>
  );
}

function NotificationsContent() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 800));
      setNotifications(MOCK_NOTIFICATIONS);
      setIsLoading(false);
    };
    loadNotifications();
  }, []);

  const getFilteredNotifications = () => {
    let filtered = notifications;
    
    switch (filter) {
      case 'unread':
        filtered = notifications.filter(n => !n.read);
        break;
      case 'requests':
        filtered = notifications.filter(n => 
          ['new_request', 'request_accepted', 'request_completed', 'order_status'].includes(n.type)
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

  const getCounts = () => {
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      requests: notifications.filter(n => 
        ['new_request', 'request_accepted', 'request_completed', 'order_status'].includes(n.type)
      ).length,
      messages: notifications.filter(n => n.type === 'new_message').length,
      payments: notifications.filter(n => n.type === 'payment_received').length,
    };
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = getFilteredNotifications();
  const counts = getCounts();

  if (isLoading) return <LoadingSpinner />;

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
            <button className="btn btn-navy btn-sm" onClick={handleMarkAllAsRead}>
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
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  // Choose layout based on user role
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

  // Default fallback
  return <NotificationsContent />;
}
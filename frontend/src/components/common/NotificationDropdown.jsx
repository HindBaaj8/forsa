// components/common/NotificationDropdown.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'الآن';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return `منذ ${Math.floor(days / 7)} أسبوع`;
};

const getNotificationIcon = (type) => {
  const icons = {
    new_request: '📋',
    request_accepted: '✅',
    request_completed: '🎉',
    new_message: '💬',
    payment_received: '💰',
    worker_applied: '🔧',
    order_status: '📦',
  };
  return icons[type] || '🔔';
};

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'new_request',
    title: 'طلب جديد',
    message: 'طلب جديد: تركيب مكيف هواء من أحمد العلوي',
    read: false,
    created_at: new Date().toISOString(),
    link: '/client/requests',
  },
  {
    id: 2,
    type: 'new_message',
    title: 'رسالة جديدة',
    message: 'رسالة جديدة من محمد أمين',
    read: false,
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    link: '/client/messages',
  },
  {
    id: 3,
    type: 'request_accepted',
    title: 'تم قبول الطلب',
    message: 'تم قبول طلبك رقم #1053 من قبل العامل كريم السوسي',
    read: true,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    link: '/client/requests',
  },
  {
    id: 4,
    type: 'payment_received',
    title: 'دفعة مستلمة',
    message: 'تم استلام 350 درهم من يوسف البلال',
    read: true,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    link: '/client/requests',
  },
];

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button 
        className="topbar__notif"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="notification-overlay" onClick={() => setIsOpen(false)} />
          <div className="notification-panel">
            <div className="notification-header">
              <div className="notification-title">الإشعارات</div>
              {unreadCount > 0 && (
                <button className="notification-mark-all" onClick={markAllAsRead}>
                  تحديد الكل كمقروء
                </button>
              )}
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">
                  <div className="notification-empty-icon">🔔</div>
                  <div className="notification-empty-text">لا توجد إشعارات جديدة</div>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notification-icon">{getNotificationIcon(notif.type)}</div>
                    <div className="notification-content">
                      <div className="notification-message">{notif.message}</div>
                      <div className="notification-time">{getTimeAgo(notif.created_at)}</div>
                    </div>
                    {!notif.read && <div className="notification-dot" />}
                  </div>
                ))
              )}
            </div>

            <div className="notification-footer">
              <Link to="/notifications" className="notification-view-all" onClick={() => setIsOpen(false)}>
                عرض جميع الإشعارات →
              </Link>
            </div>
          </div>
        </>
      )}

      <style>{`
        .notification-dropdown {
          position: relative;
          display: inline-block;
        }

        .topbar__notif {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1.5px solid var(--gray200);
          background: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 1001;
        }

        .topbar__notif:hover {
          background: var(--n50);
          border-color: var(--n300);
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: var(--error);
          color: white;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 50%;
          min-width: 18px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .notification-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 1999;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .notification-panel {
          position: fixed;
          top: 70px;
          left: 50%;
          transform: translateX(-50%);
          width: 420px;
          max-width: calc(100vw - 32px);
          background: var(--white);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          z-index: 2000;
          overflow: hidden;
          animation: slideDown 0.25s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--gray200);
          background: var(--white);
        }

        .notification-title {
          font-weight: 800;
          font-size: 16px;
          color: var(--text1);
        }

        .notification-mark-all {
          font-size: 12px;
          color: var(--n600);
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 8px;
        }

        .notification-mark-all:hover {
          background: var(--n50);
        }

        .notification-list {
          max-height: 450px;
          overflow-y: auto;
        }

        .notification-list::-webkit-scrollbar {
          width: 4px;
        }

        .notification-list::-webkit-scrollbar-track {
          background: var(--gray100);
        }

        .notification-list::-webkit-scrollbar-thumb {
          background: var(--gray400);
          border-radius: 4px;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--gray100);
          cursor: pointer;
          transition: background 0.15s;
          position: relative;
        }

        .notification-item:hover {
          background: var(--n50);
        }

        .notification-item.unread {
          background: var(--n50);
        }

        .notification-item.unread::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--n600);
        }

        .notification-icon {
          font-size: 22px;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-message {
          font-size: 13px;
          font-weight: 600;
          color: var(--text1);
          margin-bottom: 4px;
          line-height: 1.5;
        }

        .notification-time {
          font-size: 11px;
          color: var(--text3);
        }

        .notification-dot {
          width: 8px;
          height: 8px;
          background: var(--n600);
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 8px;
        }

        .notification-empty {
          text-align: center;
          padding: 48px 20px;
        }

        .notification-empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .notification-empty-text {
          font-size: 13px;
          color: var(--text3);
        }

        .notification-footer {
          padding: 12px 20px;
          border-top: 1px solid var(--gray200);
          text-align: center;
          background: var(--bg);
        }

        .notification-view-all {
          font-size: 13px;
          color: var(--n600);
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .notification-view-all:hover {
          color: var(--n800);
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .notification-panel {
            top: 60px;
            width: calc(100vw - 32px);
            max-height: calc(100vh - 80px);
          }
          
          .notification-list {
            max-height: calc(100vh - 180px);
          }
        }
      `}</style>
    </div>
  );
}
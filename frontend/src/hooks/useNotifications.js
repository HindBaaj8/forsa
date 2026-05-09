// hooks/useNotifications.js
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Types de notifications
export const NOTIFICATION_TYPES = {
  NEW_REQUEST: 'new_request',
  REQUEST_ACCEPTED: 'request_accepted',
  REQUEST_COMPLETED: 'request_completed',
  NEW_MESSAGE: 'new_message',
  PAYMENT_RECEIVED: 'payment_received',
  WORKER_APPLIED: 'worker_applied',
  ORDER_STATUS: 'order_status',
};

// Helper function to get notification message
const getNotificationMessage = (type, data) => {
  const messages = {
    [NOTIFICATION_TYPES.NEW_REQUEST]: `📋 طلب جديد: ${data.title} من ${data.client}`,
    [NOTIFICATION_TYPES.REQUEST_ACCEPTED]: `✅ تم قبول طلبك: ${data.title}`,
    [NOTIFICATION_TYPES.REQUEST_COMPLETED]: `🎉 تم إكمال الطلب: ${data.title}`,
    [NOTIFICATION_TYPES.NEW_MESSAGE]: `💬 رسالة جديدة من ${data.sender}`,
    [NOTIFICATION_TYPES.PAYMENT_RECEIVED]: `💰 تم استلام ${data.amount} درهم`,
    [NOTIFICATION_TYPES.WORKER_APPLIED]: `🔧 تقدم عامل جديد لخدمتك: ${data.worker}`,
    [NOTIFICATION_TYPES.ORDER_STATUS]: `📦 تم تغيير حالة طلبك إلى: ${data.status}`,
  };
  return messages[type] || 'لديك إشعار جديد';
};

// Helper function to get notification icon
const getNotificationIcon = (type) => {
  const icons = {
    [NOTIFICATION_TYPES.NEW_REQUEST]: '📋',
    [NOTIFICATION_TYPES.REQUEST_ACCEPTED]: '✅',
    [NOTIFICATION_TYPES.REQUEST_COMPLETED]: '🎉',
    [NOTIFICATION_TYPES.NEW_MESSAGE]: '💬',
    [NOTIFICATION_TYPES.PAYMENT_RECEIVED]: '💰',
    [NOTIFICATION_TYPES.WORKER_APPLIED]: '🔧',
    [NOTIFICATION_TYPES.ORDER_STATUS]: '📦',
  };
  return icons[type] || '🔔';
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Add a new notification
  const addNotification = (type, data) => {
    const newNotif = {
      id: Date.now(),
      type,
      data,
      message: getNotificationMessage(type, data),
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast
    toast(newNotif.message, {
      icon: getNotificationIcon(type),
      duration: 5000,
    });
  };

  // Add mock notification for testing
  const addMockNotification = (type, data) => {
    addNotification(type, data);
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    addMockNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
};
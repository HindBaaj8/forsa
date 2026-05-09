// utils/notifications.js
// Ce fichier va servir plus tard quand le backend sera prêt

// Types de notifications
export const NOTIFICATION_TYPES = {
  NEW_REQUEST: 'new_request',      // طلب جديد
  REQUEST_ACCEPTED: 'request_accepted', // تم قبول الطلب
  REQUEST_COMPLETED: 'request_completed', // تم إكمال الطلب
  NEW_MESSAGE: 'new_message',      // رسالة جديدة
  PAYMENT_RECEIVED: 'payment_received', // تم استلام الدفع
  WORKER_APPLIED: 'worker_applied', // عامل تقدم لخدمة
  ORDER_STATUS: 'order_status',     // تغيير حالة الطلب
};

// Template des notifications
export const getNotificationMessage = (type, data) => {
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
// services/realtime.js
import store from '../app/store';
import { receiveMessage } from '../features/messages/messagesSlice';

class RealtimeManager {
  constructor() {
    this.subscriptions = new Map();
    this.userId = null;
    this.token = null;
    this.pollingIntervals = new Map();
    this.notificationInterval = null;
  }

  initialize(userId, token) {
    console.log('🎬 RealtimeManager.initialize - userId:', userId);
    console.log('⚠️ Using POLLING mode (WebSocket disabled)');
    this.userId = userId;
    this.token = token;
    
    // بدء Polling للإشعارات
    this.startNotificationPolling();
  }

  startNotificationPolling() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
    
    console.log('📡 Starting notification polling every 30 seconds');
    
    // جلب الإشعارات أول مرة
    this.fetchNotifications();
    
    // كل 30 ثانية
    this.notificationInterval = setInterval(() => {
      this.fetchNotifications();
    }, 30000);
  }

  async fetchNotifications() {
    if (!this.token) return;
    
    try {
      const response = await fetch('/api/notifications/unread', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          console.log('🔔 New notifications:', data.length);
          window.dispatchEvent(new CustomEvent('notification-sent', { 
            detail: { notifications: data } 
          }));
        }
      }
    } catch (error) {
      console.error('Notification polling error:', error);
    }
  }

  subscribeToConversation(conversationId) {
    if (this.subscriptions.has(`conversation.${conversationId}`)) {
      console.log('Already polling conversation:', conversationId);
      return this.subscriptions.get(`conversation.${conversationId}`);
    }

    console.log('📡 Starting conversation polling for:', conversationId);
    
    // جلب الرسائل أول مرة
    this.fetchMessages(conversationId);
    
    // كل 5 ثواني (أسرع للإشعارات الفورية)
    const interval = setInterval(() => {
      this.fetchMessages(conversationId);
    }, 5000);
    
    this.subscriptions.set(`conversation.${conversationId}`, interval);
    this.pollingIntervals.set(conversationId, interval);
    
    return interval;
  }

  async fetchMessages(conversationId) {
    if (!this.token) return;
    
    try {
      const response = await fetch(`/api/messages/${conversationId}/latest`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.messages && data.messages.length > 0) {
          // إرسال آخر رسالة
          const lastMessage = data.messages[data.messages.length - 1];
          if (lastMessage && lastMessage.sender_id !== this.userId) {
            store.dispatch(receiveMessage({
              conversationId: conversationId,
              message: {
                id: lastMessage.id,
                message: lastMessage.message,
                sender_id: lastMessage.sender_id,
                created_at: lastMessage.created_at,
                is_me: lastMessage.sender_id === this.userId,
                is_read: lastMessage.is_read || false,
              }
            }));
          }
        }
      }
    } catch (error) {
      console.error('Message polling error:', error);
    }
  }

  unsubscribeFromConversation(conversationId) {
    const interval = this.subscriptions.get(`conversation.${conversationId}`);
    if (interval) {
      console.log('🔴 Stopping conversation polling for:', conversationId);
      clearInterval(interval);
      this.subscriptions.delete(`conversation.${conversationId}`);
      this.pollingIntervals.delete(conversationId);
    }
  }

  sendTyping(conversationId, isTyping, userName) {
    // Polling mode doesn't support typing indicator
    // يمكنك إضافة API call إذا احتجت
    console.log(`✍️ ${isTyping ? 'Started' : 'Stopped'} typing in conversation ${conversationId}`);
    
    // اختياري: إرسال typing indicator عبر API
    if (this.token) {
      fetch(`/api/messages/${conversationId}/typing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_typing: isTyping })
      }).catch(error => console.error('Typing error:', error));
    }
  }

  disconnect() {
    console.log('🔴 Disconnecting all polling intervals');
    
    // إيقاف polling الإشعارات
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
      this.notificationInterval = null;
    }
    
    // إيقاف جميع polling المحادثات
    this.subscriptions.forEach((interval, key) => {
      if (interval) {
        clearInterval(interval);
      }
    });
    this.subscriptions.clear();
    this.pollingIntervals.clear();
    
    this.userId = null;
    this.token = null;
  }
}

export default new RealtimeManager();
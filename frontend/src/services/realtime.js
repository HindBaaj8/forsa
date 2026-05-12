// services/realtime.js
import { getEcho, isEchoConnected } from './echo';
import store from '../app/store';
import { 
  receiveMessage, 
  addTypingUser, 
  removeTypingUser, 
  markAsReadRealtime,
  updateMessageStatus
} from '../features/messages/messageSlice';
import { receiveNotification } from '../features/notifications/notificationSlice';
import { updateUnreadCount } from '../features/conversations/conversationSlice';
import { updateOrderStatus } from '../features/orders/orderSlice';

class RealtimeManager {
  constructor() {
    this.subscriptions = new Map();
    this.userId = null;
    this.userRole = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  initialize(userId, userRole, token) {
    this.userId = userId;
    this.userRole = userRole;
    
    // Initialize Echo if not already
    if (!getEcho() && token) {
      initializeEcho(token);
    }

    this.setupUserChannel();
    this.setupOnlineChannel();
    
    return this;
  }

  // Setup user-specific private channel for notifications
  setupUserChannel() {
    if (!this.userId) return;

    const channelKey = `user.${this.userId}`;
    
    if (this.subscriptions.has(channelKey)) {
      return this.subscriptions.get(channelKey);
    }

    const channel = getEcho().private(`users.${this.userId}`);
    
    // Notification events
    channel
      .listen('NotificationSent', (event) => {
        store.dispatch(receiveNotification(event.notification));
      })
      .listen('OrderStatusChanged', (event) => {
        store.dispatch(receiveNotification({
          id: Date.now(),
          type: 'order_status',
          title: 'Order Updated',
          body: `Order #${event.order.id} is now ${event.order.status}`,
          data: { order: event.order },
          action_url: `/orders/${event.order.id}`,
          created_at: new Date().toISOString(),
        }));
        
        // Update order in store
        if (event.order) {
          store.dispatch(updateOrderStatus(event.order));
        }
      })
      .listen('InterestStatusChanged', (event) => {
        store.dispatch(receiveNotification({
          id: Date.now(),
          type: 'interest',
          title: 'Interest Update',
          body: event.message,
          data: { interest: event.interest },
          action_url: `/requests/${event.request_id}`,
          created_at: new Date().toISOString(),
        }));
      });

    this.subscriptions.set(channelKey, channel);
    return channel;
  }

  // Subscribe to conversation channel for real-time messages
  subscribeToConversation(conversationId) {
    if (!conversationId) return null;
    
    const channelKey = `conversation.${conversationId}`;
    
    // Check if already subscribed
    if (this.subscriptions.has(channelKey)) {
      console.log(`Already subscribed to conversation ${conversationId}`);
      return this.subscriptions.get(channelKey);
    }

    try {
      const channel = getEcho().private(`conversation.${conversationId}`);
      
      // New message event
      channel.listen('MessageSent', (event) => {
        store.dispatch(receiveMessage({
          conversationId: conversationId,
          message: event.message,
        }));
        
        // Update conversation last message
        store.dispatch(updateConversationLastMessage({
          conversationId: conversationId,
          lastMessage: event.message,
          lastMessageAt: event.message.created_at,
        }));
      });
      
      // Message read event
      channel.listen('MessageRead', (event) => {
        store.dispatch(markAsReadRealtime({
          conversationId: conversationId,
          messageId: event.message_id,
          userId: event.user_id,
          readAt: event.read_at,
        }));
      });
      
      // Message delivered event
      channel.listen('MessageDelivered', (event) => {
        store.dispatch(updateMessageStatus({
          messageId: event.message_id,
          status: 'delivered',
          deliveredAt: event.delivered_at,
        }));
      });
      
      // Typing indicator via whisper
      channel.listenForWhisper('typing', (event) => {
        if (event.user_id !== this.userId) {
          if (event.typing) {
            store.dispatch(addTypingUser({
              conversationId: conversationId,
              userId: event.user_id,
              userName: event.user_name,
            }));
          } else {
            store.dispatch(removeTypingUser({
              conversationId: conversationId,
              userId: event.user_id,
            }));
          }
        }
      });

      this.subscriptions.set(channelKey, channel);
      return channel;
      
    } catch (error) {
      console.error(`Failed to subscribe to conversation ${conversationId}:`, error);
      return null;
    }
  }

  // Unsubscribe from conversation
  unsubscribeFromConversation(conversationId) {
    const channelKey = `conversation.${conversationId}`;
    const channel = this.subscriptions.get(channelKey);
    
    if (channel) {
      try {
        channel.stopListening('MessageSent');
        channel.stopListening('MessageRead');
        channel.stopListening('MessageDelivered');
        getEcho().leave(`private-conversation.${conversationId}`);
        this.subscriptions.delete(channelKey);
      } catch (error) {
        console.error(`Error unsubscribing from conversation ${conversationId}:`, error);
      }
    }
  }

  // Send typing indicator
  sendTyping(conversationId, isTyping, userName = null) {
    const channelKey = `conversation.${conversationId}`;
    const channel = this.subscriptions.get(channelKey);
    
    if (channel) {
      channel.whisper('typing', {
        user_id: this.userId,
        user_name: userName || null,
        typing: isTyping,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Setup online users channel
  setupOnlineChannel() {
    const channelKey = 'online';
    
    if (this.subscriptions.has(channelKey)) {
      return this.subscriptions.get(channelKey);
    }

    const channel = getEcho().join('online');
    
    channel
      .here((users) => {
        // Initial online users list
        const onlineIds = users.map(u => u.id);
        store.dispatch(setOnlineUsers(onlineIds));
      })
      .joining((user) => {
        // User came online
        store.dispatch(addOnlineUser(user.id));
      })
      .leaving((user) => {
        // User went offline
        store.dispatch(removeOnlineUser(user.id));
      });

    this.subscriptions.set(channelKey, channel);
    return channel;
  }

  // Subscribe to admin channel (for admin users only)
  setupAdminChannel() {
    if (this.userRole !== 'admin') return null;
    
    const channelKey = 'admin';
    
    if (this.subscriptions.has(channelKey)) {
      return this.subscriptions.get(channelKey);
    }

    const channel = getEcho().private('admin');
    
    channel
      .listen('NewReport', (event) => {
        store.dispatch(receiveNotification({
          id: Date.now(),
          type: 'report',
          title: 'New Report',
          body: `New report from user ${event.reporter_name}`,
          data: { report: event.report },
          action_url: `/admin/reports/${event.report.id}`,
          created_at: new Date().toISOString(),
        }));
      })
      .listen('NewPendingService', (event) => {
        store.dispatch(receiveNotification({
          id: Date.now(),
          type: 'service',
          title: 'New Service Pending',
          body: `Service "${event.service.title}" needs approval`,
          data: { service: event.service },
          action_url: `/admin/services/${event.service.id}`,
          created_at: new Date().toISOString(),
        }));
      });

    this.subscriptions.set(channelKey, channel);
    return channel;
  }

  // Reconnect all subscriptions
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      // Reinitialize Echo
      const token = localStorage.getItem('token');
      if (token) {
        initializeEcho(token);
        this.setupUserChannel();
        this.setupOnlineChannel();
        if (this.userRole === 'admin') {
          this.setupAdminChannel();
        }
        this.reconnectAttempts = 0;
      }
    }, 3000 * this.reconnectAttempts);
  }

  // Get all active subscriptions
  getActiveSubscriptions() {
    return Array.from(this.subscriptions.keys());
  }

  // Disconnect all subscriptions
  disconnect() {
    this.subscriptions.forEach((channel, key) => {
      try {
        if (key.startsWith('conversation.')) {
          const conversationId = key.replace('conversation.', '');
          this.unsubscribeFromConversation(conversationId);
        } else {
          channel.leave();
        }
      } catch (error) {
        console.error(`Error leaving channel ${key}:`, error);
      }
    });
    
    this.subscriptions.clear();
    disconnectEcho();
    this.userId = null;
    this.userRole = null;
    this.reconnectAttempts = 0;
  }

  // Check connection status
  isConnected() {
    return isEchoConnected();
  }
}

// Singleton instance
const realtimeManager = new RealtimeManager();

export default realtimeManager;
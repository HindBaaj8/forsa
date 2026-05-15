// services/realtime.js
import { getEcho, initializeEcho, disconnectEcho } from './echo';
import store from '../app/store';
import { receiveMessage } from '../features/messages/messagesSlice';

class RealtimeManager {
  constructor() {
    this.subscriptions = new Map();
    this.userId = null;
    this.isConnected = false;
  }

  initialize(userId, token) {
    console.log('🎬 RealtimeManager.initialize - userId:', userId);
    this.userId = userId;
    
    if (!getEcho()) {
      console.log('🔧 Echo not initialized, initializing...');
      initializeEcho(token);
    }
    
    // ✅ انتظر 2 ثانية قبل محاولة إعداد القنوات
    setTimeout(() => {
      if (getEcho()) {
        this.setupUserChannel();
      } else {
        console.warn('⚠️ Echo still not available after delay');
      }
    }, 2000);
  }

  setupUserChannel() {
    if (!this.userId) return;
    
    const echo = getEcho();
    if (!echo || !echo.connector || !echo.connector.socket) {
      console.warn('⚠️ Echo or WebSocket not available, skipping user channel');
      return;
    }
    
    console.log('📡 Setting up user channel for:', this.userId);
    
    try {
      const channel = echo.private(`App.Models.User.${this.userId}`);
      
      if (channel && typeof channel.listen === 'function') {
        channel.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (event) => {
          console.log('🔔 Notification received:', event);
        });
        
        this.subscriptions.set(`user.${this.userId}`, channel);
        console.log('✅ User channel setup successfully');
      }
    } catch (error) {
      console.error('Error setting up user channel:', error);
    }
  }

  subscribeToConversation(conversationId) {
    const echo = getEcho();
    if (!echo || !echo.connector || !echo.connector.socket) {
      console.warn('⚠️ Echo or WebSocket not available, cannot subscribe');
      return null;
    }
    
    const channelKey = `conversation.${conversationId}`;
    
    if (this.subscriptions.has(channelKey)) {
      console.log('Already subscribed to conversation:', conversationId);
      return this.subscriptions.get(channelKey);
    }

    console.log('📡 Subscribing to conversation:', conversationId);
    
    try {
      const channel = echo.private(`conversation.${conversationId}`);
      
      if (channel && typeof channel.listen === 'function') {
        channel.listen('.message.sent', (event) => {
          console.log('💬 New message event:', event);
          store.dispatch(receiveMessage({
            conversationId: conversationId,
            message: {
              id: event.id,
              message: event.message,
              sender_id: event.sender_id,
              created_at: event.created_at,
              is_read: false,
            }
          }));
        });

        if (typeof channel.listenForWhisper === 'function') {
          channel.listenForWhisper('typing', (event) => {
            console.log('✍️ Typing event:', event);
          });
        }

        this.subscriptions.set(channelKey, channel);
        console.log('✅ Subscribed to conversation:', conversationId);
      }
      
      return channel;
    } catch (error) {
      console.error('Error subscribing to conversation:', error);
      return null;
    }
  }

  unsubscribeFromConversation(conversationId) {
    const channelKey = `conversation.${conversationId}`;
    const channel = this.subscriptions.get(channelKey);
    if (channel && typeof channel.stopListening === 'function') {
      console.log('🔴 Unsubscribing from conversation:', conversationId);
      channel.stopListening('.message.sent');
      this.subscriptions.delete(channelKey);
    }
  }

  sendTyping(conversationId, isTyping, userName) {
    const channel = this.subscriptions.get(`conversation.${conversationId}`);
    if (channel && typeof channel.whisper === 'function') {
      channel.whisper('typing', {
        user_id: this.userId,
        user_name: userName,
        typing: isTyping,
        timestamp: Date.now(),
      });
    }
  }

  disconnect() {
    console.log('🔴 Disconnecting all subscriptions');
    this.subscriptions.forEach((channel, key) => {
      if (key.startsWith('conversation.') && channel && typeof channel.stopListening === 'function') {
        channel.stopListening('.message.sent');
      }
    });
    this.subscriptions.clear();
    disconnectEcho();
  }
}

export default new RealtimeManager();
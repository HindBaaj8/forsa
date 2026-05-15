// services/realtime.js
import { getEcho, initializeEcho, disconnectEcho } from './echo';
import store from '../app/store';
import { receiveMessage } from '../features/messages/messagesSlice';

class RealtimeManager {
  constructor() {
    this.subscriptions = new Map();
    this.userId = null;
  }

  initialize(userId, token) {
    console.log('🎬 RealtimeManager.initialize - userId:', userId);
    console.log('⚠️ Using POLLING mode (WebSocket disabled)');
    this.userId = userId;
    
    if (!getEcho()) {
      console.log('🔧 Echo not initialized, initializing...');
      initializeEcho(token);
    }
    
    this.setupUserChannel();
  }

  setupUserChannel() {
    if (!this.userId) return;
    
    const echo = getEcho();
    if (!echo) {
      console.warn('⚠️ Echo not available, skipping user channel');
      return;
    }
    
    console.log('📡 Setting up user channel for:', this.userId);
    const channel = echo.private(`App.Models.User.${this.userId}`);
    channel.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (event) => {
      console.log('🔔 Notification received:', event);
    });
  }

  subscribeToConversation(conversationId) {
    const echo = getEcho();
    if (!echo) {
      console.warn('⚠️ Echo not available, cannot subscribe');
      return null;
    }
    
    const channelKey = `conversation.${conversationId}`;
    
    if (this.subscriptions.has(channelKey)) {
      console.log('Already subscribed to conversation:', conversationId);
      return this.subscriptions.get(channelKey);
    }

    console.log('📡 Subscribing to conversation:', conversationId);
    const channel = echo.private(`conversation.${conversationId}`);
    
    channel.listen('.message.sent', (event) => {
      console.log('💬 New message event:', event);
      store.dispatch(receiveMessage({
        conversationId: conversationId,
        message: {
          id: event.id,
          message: event.message,
          sender_id: event.sender_id,
          created_at: event.created_at,
          is_me: event.sender_id === this.userId,
          is_read: false,
        }
      }));
    });

    this.subscriptions.set(channelKey, channel);
    return channel;
  }

  unsubscribeFromConversation(conversationId) {
    const channelKey = `conversation.${conversationId}`;
    const channel = this.subscriptions.get(channelKey);
    if (channel) {
      console.log('🔴 Unsubscribing from conversation:', conversationId);
      channel.stopListening('.message.sent');
      this.subscriptions.delete(channelKey);
    }
  }

  sendTyping(conversationId, isTyping, userName) {
    const channel = this.subscriptions.get(`conversation.${conversationId}`);
    if (channel && channel.whisper) {
      channel.whisper('typing', {
        user_id: this.userId,
        user_name: userName,
        typing: isTyping,
      });
    }
  }

  disconnect() {
    console.log('🔴 Disconnecting all subscriptions');
    this.subscriptions.forEach((_, key) => {
      if (key.startsWith('conversation.')) {
        const conversationId = key.replace('conversation.', '');
        this.unsubscribeFromConversation(conversationId);
      }
    });
    disconnectEcho();
  }
}

export default new RealtimeManager();
// services/echo.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// ✅ تعيين Pusher عالمياً قبل أي شيء
window.Pusher = Pusher;

let echoInstance = null;

export const initializeEcho = (token) => {
  // إذا كان الـ Echo موجود مسبقاً، رجع مباشرة
  if (echoInstance) {
    console.log('✅ Echo already initialized');
    return echoInstance;
  }

  console.log('🔧 Initializing Echo with Reverb...');
  
  try {
    // تأكد من أن Pusher معرف قبل إنشاء Echo
    if (!window.Pusher) {
      window.Pusher = Pusher;
    }
    
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: 'veeytwn3d3r9nuay1by6',
      wsHost: '127.0.0.1',
      wsPort: 8080,
      wssPort: 8080,
      forceTLS: false,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    });
    
    console.log('✅ Echo initialized successfully');
    
    // استمع لحدث الاتصال
    if (echoInstance.connector && echoInstance.connector.socket) {
      echoInstance.connector.socket.on('connect', () => {
        console.log('✅ Reverb WebSocket connected!');
      });
      
      echoInstance.connector.socket.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize Echo:', error);
    echoInstance = null;
  }
  
  return echoInstance;
};

export const getEcho = () => echoInstance;

export const disconnectEcho = () => {
  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch (e) {
      console.error('Error disconnecting Echo:', e);
    }
    echoInstance = null;
  }
};
// services/echo.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echoInstance = null;

export const initializeEcho = (token) => {
  console.log('🔧 Initializing Echo with token');
  
  if (echoInstance) {
    console.log('⚠️ Echo already initialized');
    return echoInstance;
  }

  const config = {
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'your-app-key',
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${import.meta.env.VITE_APP_URL || 'http://localhost:8000'}/api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  };

  console.log('📡 Echo config:', config);
  
  try {
    echoInstance = new Echo(config);
    console.log('✅ Echo initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Echo:', error);
  }
  
  return echoInstance;
};

export const getEcho = () => {
  if (!echoInstance) {
    console.warn('⚠️ Echo not initialized yet!');
    return null;
  }
  return echoInstance;
};

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    console.log('🔌 Echo disconnected');
  }
};
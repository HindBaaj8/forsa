// services/echo.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echoInstance = null;

export const initializeEcho = (token) => {
  if (echoInstance) {
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

  echoInstance = new Echo(config);
  return echoInstance;
};

export const getEcho = () => {
  if (!echoInstance) {
    throw new Error('Echo not initialized. Call initializeEcho first.');
  }
  return echoInstance;
};

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
};

export const isEchoConnected = () => {
  return echoInstance !== null && echoInstance.connector?.socket?.readyState === WebSocket.OPEN;
};
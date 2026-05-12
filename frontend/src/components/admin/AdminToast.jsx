import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export default function AdminToast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={18} />,
    error: <XCircle size={18} />,
    warning: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  };

  return (
    <div className="admin-toast" style={{ borderRight: `4px solid ${colors[type]}` }}>
      <span className="admin-toast__icon" style={{ color: colors[type] }}>{icons[type]}</span>
      <span className="admin-toast__message">{message}</span>
      <button className="admin-toast__close" onClick={onClose}><X size={14} /></button>
    </div>
  );
}
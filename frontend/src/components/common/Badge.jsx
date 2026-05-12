import React from 'react';

export default function Badge({ type, children, className = '' }) {
  const types = {
    active: 'badge--active',
    pending: 'badge--pending',
    progress: 'badge--progress',
    in_progress: 'badge--progress',
    completed: 'badge--completed',
    done: 'badge--completed',
    cancelled: 'badge--cancel',
    cancel: 'badge--cancel',
    success: 'badge--success',
    error: 'badge--error',
    warning: 'badge--warning',
    info: 'badge--info',
    client: 'badge--client',
    worker: 'badge--worker',
    admin: 'badge--admin',
  };

  return <span className={`badge ${types[type] || 'badge--pending'} ${className}`}>{children}</span>;
}
import React from 'react';

export default function AdminBadge({ type, label }) {
  const types = {
    active: 'badge--active',
    pending: 'badge--pending',
    blocked: 'badge--blocked',
    completed: 'badge--completed',
    cancelled: 'badge--cancel',
    client: 'badge--client',
    worker: 'badge--worker',
    admin: 'badge--admin',
    success: 'badge--success',
    error: 'badge--error',
    warning: 'badge--warning',
  };

  const labels = {
    active: 'نشط',
    pending: 'معلق',
    blocked: 'محظور',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    client: 'عميل',
    worker: 'عامل',
    admin: 'مشرف',
    success: 'نجاح',
    error: 'خطأ',
    warning: 'تنبيه',
  };

  return (
    <span className={`badge ${types[type]}`}>
      {label || labels[type] || type}
    </span>
  );
}
import React from 'react';

export default function EmptyState({ 
  icon = '📭', 
  title = 'لا توجد بيانات', 
  description = 'ستظهر هنا البيانات عند إضافتها',
  action,
  actionText,
  onAction 
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <button className="btn btn--navy btn--sm" onClick={onAction}>
          {actionText || action}
        </button>
      )}
    </div>
  );
}
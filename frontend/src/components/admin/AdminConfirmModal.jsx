import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function AdminConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'تأكيد', cancelText = 'إلغاء' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ color: 'var(--error)' }}>{title || 'تأكيد الإجراء'}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center' }}>
          <AlertTriangle size={48} style={{ color: 'var(--error)', marginBottom: 16 }} />
          <p>{message || 'هل أنت متأكد من هذا الإجراء؟'}</p>
        </div>
        <div className="modal-actions">
          <button className="btn btn--ghost" onClick={onClose}>{cancelText}</button>
          <button className="btn btn--danger" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
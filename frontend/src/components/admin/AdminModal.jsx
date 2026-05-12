import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function AdminModal({ isOpen, onClose, title, children, size = 'md', onSave, saveText = 'حفظ' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'modal--sm',
    md: '',
    lg: 'modal--large',
    xl: 'modal--xl',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${sizeClasses[size]}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {onSave && (
          <div className="modal-actions">
            <button className="btn btn--ghost" onClick={onClose}>إلغاء</button>
            <button className="btn btn--navy" onClick={onSave}>{saveText}</button>
          </div>
        )}
      </div>
    </div>
  );
}
// src/components/admin/AdminConfirmModal.jsx
export default function AdminConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{maxWidth:380}}>
        <div className="modal-head">
          <span className="modal-head-title">تأكيد الإجراء</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{fontSize:14,color:"var(--text2)",lineHeight:1.7}}>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>إلغاء</button>
          <button className="btn btn-navy" style={{background:"var(--error)"}} onClick={()=>{onConfirm();onClose();}}>تأكيد</button>
        </div>
      </div>
    </div>
  );
}
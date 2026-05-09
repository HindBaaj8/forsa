// src/components/admin/AdminModal.jsx
import { useState } from 'react';

export default function AdminModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(user || { name:"", email:"", phone:"", city:"", role:"client", status:"active" });
  const [errs, setErrs] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "الاسم مطلوب";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "بريد غير صحيح";
    if (!form.phone.trim()) e.phone = "الهاتف مطلوب";
    if (!form.city.trim()) e.city = "المدينة مطلوبة";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, id: user?.id || Date.now(), orders: user?.orders || 0, date: user?.date || new Date().toISOString().slice(0,10), color: user?.color || "#1e3f7a" });
    onClose();
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <span className="modal-head-title">{user ? "تعديل المستخدم" : "إضافة مستخدم جديد"}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">الاسم الكامل</label>
            <input className={`form-input${errs.name?" err":""}`} value={form.name} onChange={e=>set("name",e.target.value)} placeholder="محمد العزيز" />
            {errs.name && <span className="form-err">{errs.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">رقم الهاتف</label>
            <input className={`form-input${errs.phone?" err":""}`} value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="0612-345678" />
            {errs.phone && <span className="form-err">{errs.phone}</span>}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">البريد الإلكتروني</label>
          <input className={`form-input${errs.email?" err":""}`} value={form.email} onChange={e=>set("email",e.target.value)} placeholder="user@email.com" />
          {errs.email && <span className="form-err">{errs.email}</span>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">المدينة</label>
            <input className={`form-input${errs.city?" err":""}`} value={form.city} onChange={e=>set("city",e.target.value)} placeholder="الدار البيضاء" />
            {errs.city && <span className="form-err">{errs.city}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">الدور</label>
            <select className="form-input" value={form.role} onChange={e=>set("role",e.target.value)}>
              <option value="client">عميل</option>
              <option value="worker">عامل</option>
              <option value="admin">مشرف</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">الحالة</label>
          <select className="form-input" value={form.status} onChange={e=>set("status",e.target.value)}>
            <option value="active">نشط</option>
            <option value="pending">معلق</option>
            <option value="blocked">محظور</option>
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>إلغاء</button>
          <button className="btn btn-navy" onClick={handleSave}>✓ حفظ</button>
        </div>
      </div>
    </div>
  );
}
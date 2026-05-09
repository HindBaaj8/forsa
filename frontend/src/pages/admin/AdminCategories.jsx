// src/pages/admin/AdminCategories.jsx
import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminToast from '../../components/admin/AdminToast';

// Icones disponibles pour les catégories
const AVAILABLE_ICONS = [
  { icon: '🚿', name: 'سباكة' },
  { icon: '⚡', name: 'كهرباء' },
  { icon: '🎨', name: 'دهان' },
  { icon: '🪚', name: 'نجارة' },
  { icon: '🌿', name: 'بستنة' },
  { icon: '🧹', name: 'تنظيف' },
  { icon: '🏗️', name: 'بناء' },
  { icon: '❄️', name: 'تكييف' },
  { icon: '📚', name: 'تعليم' },
  { icon: '💻', name: 'تقنية' },
  { icon: '🚚', name: 'نقل' },
  { icon: '🍳', name: 'طبخ' },
  { icon: '✂️', name: 'خياطة' },
  { icon: '🔧', name: 'صيانة' },
];

export default function AdminCategories({ page, setPageState, usersCount, pendingRequestsCount, pendingWorkersCount }) {
  const [cats, setCats] = useState([
    { id: 1, name: "سباكة", icon: "🚿", workers: 18, requests: 124, status: "active" },
    { id: 2, name: "كهرباء", icon: "⚡", workers: 14, requests: 98, status: "active" },
    { id: 3, name: "دهان", icon: "🎨", workers: 22, requests: 87, status: "active" },
    { id: 4, name: "نجارة", icon: "🪚", workers: 9, requests: 43, status: "active" },
    { id: 5, name: "بستنة", icon: "🌿", workers: 7, requests: 31, status: "active" },
    { id: 6, name: "تنظيف", icon: "🧹", workers: 31, requests: 156, status: "active" },
    { id: 7, name: "بناء", icon: "🏗️", workers: 11, requests: 52, status: "active" },
    { id: 8, name: "تكييف", icon: "❄️", workers: 8, requests: 39, status: "inactive" },
  ]);
  
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '🏷️',
    status: 'active'
  });
  const [errors, setErrors] = useState({});

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const openAddModal = () => {
    setEditCategory(null);
    setFormData({ name: '', icon: '🏷️', status: 'active' });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      status: category.status
    });
    setErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'اسم الفئة مطلوب';
    if (!formData.icon) e.icon = 'الرمز مطلوب';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (editCategory) {
      // Update existing category
      setCats(prev => prev.map(cat =>
        cat.id === editCategory.id
          ? { ...cat, ...formData }
          : cat
      ));
      showToast(`✅ تم تحديث فئة "${formData.name}"`, "success");
    } else {
      // Add new category
      const newCategory = {
        id: Date.now(),
        name: formData.name,
        icon: formData.icon,
        workers: 0,
        requests: 0,
        status: formData.status
      };
      setCats(prev => [...prev, newCategory]);
      showToast(`✅ تم إضافة فئة "${formData.name}" بنجاح`, "success");
    }
    setShowModal(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`هل أنت متأكد من حذف فئة "${name}"؟`)) {
      setCats(prev => prev.filter(cat => cat.id !== id));
      showToast(`🗑 تم حذف فئة "${name}"`, "error");
    }
  };

  const toggleStatus = (id) => {
    setCats(prev => prev.map(cat =>
      cat.id === id ? { ...cat, status: cat.status === "active" ? "inactive" : "active" } : cat
    ));
    showToast("تم تحديث حالة الفئة", "info");
  };

  return (
    <AdminLayout 
      title="الفئات والخدمات" 
      page={page} 
      setPage={setPageState}
      usersCount={usersCount}
      pendingRequestsCount={pendingRequestsCount}
      pendingWorkersCount={pendingWorkersCount}
    >
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button className="btn btn-navy" onClick={openAddModal}>
          + فئة جديدة
        </button>
      </div>

      <div className="grid-3">
        {cats.map(c => (
          <div className="card" key={c.id} style={{ textAlign: "center", transition: ".2s" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{c.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>{c.name}</div>
            <AdminBadge type={c.status === "active" ? "active" : "blocked"} />
            <div style={{ display: "flex", justifyContent: "center", gap: 24, margin: "14px 0", paddingTop: 12, borderTop: "1px solid var(--gray100)" }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "var(--n700)" }}>{c.workers}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>عامل</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "var(--g500)" }}>{c.requests}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>طلب</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => openEditModal(c)}>
                ✏️ تعديل
              </button>
              <button className={`btn btn-sm ${c.status === "active" ? "btn-danger" : "btn-success"}`} style={{ flex: 1 }} onClick={() => toggleStatus(c.id)}>
                {c.status === "active" ? "إيقاف" : "تفعيل"}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, c.name)}>
                🗑 حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add/Edit Category */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title">
                {editCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
              </span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">اسم الفئة *</label>
              <input
                className={`form-input ${errors.name ? 'err' : ''}`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: سباكة، كهرباء..."
              />
              {errors.name && <span className="form-err">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">الرمز (أيقونة) *</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {AVAILABLE_ICONS.slice(0, 12).map(ic => (
                  <button
                    key={ic.icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: ic.icon })}
                    style={{
                      width: 50,
                      height: 50,
                      fontSize: 28,
                      background: formData.icon === ic.icon ? 'var(--n700)' : 'var(--gray100)',
                      color: formData.icon === ic.icon ? '#fff' : 'var(--text1)',
                      border: 'none',
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: '0.15s'
                    }}
                  >
                    {ic.icon}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>الرمز المختار:</span>
                <span style={{ fontSize: 32 }}>{formData.icon}</span>
              </div>
              {errors.icon && <span className="form-err">{errors.icon}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">الحالة</label>
              <select
                className="form-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>إلغاء</button>
              <button className="btn btn-navy" onClick={handleSave}>
                {editCategory ? "💾 حفظ التغييرات" : "➕ إضافة الفئة"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <AdminToast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
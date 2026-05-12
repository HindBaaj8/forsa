import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit, Trash2, Eye, Power } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import AdminToast from './AdminToast';
import { getCategories, createCategory, updateCategory, deleteCategory, toggleCategory } from '../../features/admin/adminSlice';

const AVAILABLE_ICONS = ['🚿', '⚡', '🎨', '🪚', '🧹', '🏗️', '💻', '📚', '🚚', '🍳', '✂️', '🔧', '📷', '🎓'];

export default function AdminCategories() {
  const dispatch = useDispatch();
  const { categories, isLoading } = useSelector((state) => state.admin);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '🏷️', is_active: true });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, icon: category.icon, is_active: category.is_active });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', icon: '🏷️', is_active: true });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast('اسم الفئة مطلوب', 'error');
      return;
    }
    if (editingCategory) {
      await dispatch(updateCategory({ id: editingCategory.id, data: formData }));
      showToast('تم تحديث الفئة', 'success');
    } else {
      await dispatch(createCategory(formData));
      showToast('تم إضافة الفئة', 'success');
    }
    setModalOpen(false);
    dispatch(getCategories());
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`هل أنت متأكد من حذف فئة "${name}"؟`)) {
      await dispatch(deleteCategory(id));
      showToast('تم حذف الفئة', 'error');
      dispatch(getCategories());
    }
  };

  const handleToggle = async (id) => {
    await dispatch(toggleCategory(id));
    showToast('تم تغيير حالة الفئة', 'info');
    dispatch(getCategories());
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <AdminLayout title="الفئات">
      <div className="page-header">
        <h1 className="page-header__title">إدارة الفئات</h1>
        <p className="page-header__sub">إضافة وتعديل فئات الخدمات</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <Button variant="gold" icon={Plus} onClick={() => handleOpenModal()}>إضافة فئة جديدة</Button>
      </div>

      <div className="categories-grid">
        {categories?.map(cat => (
          <div key={cat.id} className="category-card">
            <div className="category-card__icon">{cat.icon}</div>
            <div className="category-card__name">{cat.name}</div>
            <div className="category-card__stats">
              <span>{cat.services_count || 0} خدمة</span>
              <span>{cat.workers_count || 0} عامل</span>
            </div>
            <div className="category-card__actions">
              <button className="action-btn" onClick={() => handleOpenModal(cat)}><Edit size={16} /></button>
              <button className={`action-btn ${cat.is_active ? 'warning' : 'success'}`} onClick={() => handleToggle(cat.id)}>
                <Power size={16} />
              </button>
              <button className="action-btn danger" onClick={() => handleDelete(cat.id, cat.name)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCategory ? 'تعديل فئة' : 'إضافة فئة جديدة'} size="md" onSave={handleSave} saveText="حفظ">
        <Input label="اسم الفئة" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        <div className="form-group">
          <label className="form-label">الرمز (أيقونة)</label>
          <div className="icons-grid">
            {AVAILABLE_ICONS.map(icon => (
              <button key={icon} className={`icon-btn ${formData.icon === icon ? 'active' : ''}`} onClick={() => setFormData({ ...formData, icon })}>
                {icon}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
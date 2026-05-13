import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit, Trash2, Power } from 'lucide-react';
import WorkerLayout from '../layout/WorkerLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { getWorkerServices, createService, updateService, deleteService, toggleService } from '../../features/worker/workerSlice';
import { toast } from 'react-hot-toast';
import '../../styles/Dashboard.css';

const CATEGORIES = [
  { id: 1, value: 'electrical', label: 'كهرباء', icon: '⚡' },
  { id: 2, value: 'plumbing', label: 'سباكة', icon: '💧' },
  { id: 3, value: 'carpentry', label: 'نجارة', icon: '🔨' },
  { id: 4, value: 'cleaning', label: 'تنظيف', icon: '🧹' },
  { id: 5, value: 'cooking', label: 'طبخ', icon: '🍳' },
  { id: 6, value: 'design', label: 'تصميم', icon: '🎨' },
];

export default function WorkerServices() {
  const dispatch = useDispatch();
  const { services = [], isLoading, error } = useSelector((state) => state.worker);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    price: '', 
    city: '', 
    is_active: true 
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(getWorkerServices());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : 'حدث خطأ');
    }
  }, [error]);

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'العنوان مطلوب';
    if (!formData.description.trim()) e.description = 'الوصف مطلوب';
    if (!formData.category) e.category = 'نوع الخدمة مطلوب';
    if (!formData.price) e.price = 'السعر مطلوب';
    else if (isNaN(formData.price) || Number(formData.price) <= 0) e.price = 'السعر غير صحيح';
    if (!formData.city.trim()) e.city = 'المدينة مطلوبة';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    const selectedCategory = CATEGORIES.find(c => c.value === formData.category);
    
    const submitData = {
      category_id: selectedCategory?.id,
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      location: formData.city,
    };
    
    try {
      if (editingService) {
        await dispatch(updateService({ id: editingService.id, data: submitData })).unwrap();
        toast.success('تم تحديث الخدمة');
      } else {
        await dispatch(createService(submitData)).unwrap();
        toast.success('تم إضافة الخدمة');
      }
      setModalOpen(false);
      setEditingService(null);
      setFormData({ title: '', description: '', category: '', price: '', city: '', is_active: true });
      dispatch(getWorkerServices());
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : err?.message || 'حدث خطأ';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (service) => {
    const categoryValue = CATEGORIES.find(c => c.id === service.category_id)?.value || '';
    setEditingService(service);
    setFormData({ 
      title: service.title, 
      description: service.description, 
      category: categoryValue,
      price: service.price, 
      city: service.location,
      is_active: service.is_active 
    });
    setModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`هل أنت متأكد من حذف الخدمة "${title}"؟`)) {
      await dispatch(deleteService(id));
      toast.success('تم حذف الخدمة');
      dispatch(getWorkerServices());
    }
  };

  const handleToggle = async (id) => {
    await dispatch(toggleService(id));
    toast.success('تم تغيير حالة الخدمة');
    dispatch(getWorkerServices());
  };

  if (isLoading) return <LoadingSpinner />;

  const servicesArray = Array.isArray(services) ? services : [];

  return (
    <WorkerLayout title="خدماتي">
      <div className="page-header">
        <h1 className="page-header__title">خدماتي</h1>
        <p className="page-header__sub">الخدمات التي تقدمها للعملاء</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <Button variant="gold" icon={Plus} onClick={() => { 
          setEditingService(null); 
          setFormData({ title: '', description: '', category: '', price: '', city: '', is_active: true }); 
          setModalOpen(true); 
        }}>إضافة خدمة جديدة</Button>
      </div>

      {servicesArray.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>🛠️</div>
          <h3>لا توجد خدمات</h3>
          <p>أضف خدماتك لتبدأ في استقبال الطلبات</p>
          <Button variant="gold" onClick={() => setModalOpen(true)}>➕ إضافة خدمة</Button>
        </div>
      ) : (
        <div className="services-grid">
          {servicesArray.map(service => {
            const category = CATEGORIES.find(c => c.id === service.category_id);
            return (
              <div key={service.id} className="service-card">
                <div className="service-card__header">
                  <div className="service-card__icon">{category?.icon || '🔧'}</div>
                  <div>
                    <h3 className="service-card__title">{service.title}</h3>
                    <div className="service-card__category">{category?.label}</div>
                  </div>
                  <button className={`service-card__toggle ${service.is_active ? 'active' : ''}`} onClick={() => handleToggle(service.id)}>
                    <Power size={14} />
                  </button>
                </div>
                <p className="service-card__description">{service.description?.substring(0, 100)}...</p>
                <div className="service-card__info">
                  <span>📍 {service.location}</span>
                  <span>💰 {service.price} درهم/ساعة</span>
                </div>
                <div className="service-card__actions">
                  <button className="btn btn--ghost btn--sm" onClick={() => handleEdit(service)}><Edit size={14} /> تعديل</button>
                  <button className="btn btn--danger btn--sm" onClick={() => handleDelete(service.id, service.title)}><Trash2 size={14} /> حذف</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'} onSave={handleSave} saveText={editingService ? 'حفظ التغييرات' : 'إضافة الخدمة'}>
        <Input label="عنوان الخدمة" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} error={errors.title} required />
        <div className="form-group">
          <label className="form-label">وصف الخدمة *</label>
          <textarea className={`form-input ${errors.description ? 'err' : ''}`} rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="وصف تفصيلي للخدمة..." />
          {errors.description && <span className="form-err">{errors.description}</span>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">نوع الخدمة *</label>
            <select className={`form-input ${errors.category ? 'err' : ''}`} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              <option value="">اختر نوع الخدمة</option>
              {CATEGORIES.map(c => (<option key={c.value} value={c.value}>{c.icon} {c.label}</option>))}
            </select>
            {errors.category && <span className="form-err">{errors.category}</span>}
          </div>
          <Input label="السعر (درهم/ساعة)" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} error={errors.price} required />
        </div>
        <Input label="المدينة" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} error={errors.city} required />
      </Modal>
    </WorkerLayout>
  );
}
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Trash2, MessageCircle, X } from 'lucide-react';
import ClientLayout from '../layout/ClientLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { getClientRequests, createRequest, cancelRequest, deleteRequest } from '../../features/client/clientSlice';
import { toast } from 'react-hot-toast';

const CATEGORIES = [
  { value: 'electrical', label: 'كهرباء', icon: '⚡' },
  { value: 'plumbing', label: 'سباكة', icon: '💧' },
  { value: 'carpentry', label: 'نجارة', icon: '🔨' },
  { value: 'cleaning', label: 'تنظيف', icon: '🧹' },
  { value: 'cooking', label: 'طبخ', icon: '🍳' },
  { value: 'design', label: 'تصميم', icon: '🎨' },
];

export default function ClientRequests() {
  const dispatch = useDispatch();
  const { requests, isLoading } = useSelector((state) => state.client);
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: '', budget: '', city: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(getClientRequests());
  }, [dispatch]);

  const filteredRequests = requests?.filter(r => filter === 'all' || r.status === filter);

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'العنوان مطلوب';
    if (!formData.description.trim()) e.description = 'الوصف مطلوب';
    if (!formData.category) e.category = 'نوع الخدمة مطلوب';
    if (!formData.budget) e.budget = 'الميزانية مطلوبة';
    if (!formData.city.trim()) e.city = 'المدينة مطلوبة';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    await dispatch(createRequest(formData));
    toast.success('تم إنشاء الطلب بنجاح');
    setModalOpen(false);
    setFormData({ title: '', description: '', category: '', budget: '', city: '' });
    dispatch(getClientRequests());
  };

  const handleCancel = async (id) => {
    if (window.confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
      await dispatch(cancelRequest(id));
      toast.success('تم إلغاء الطلب');
      dispatch(getClientRequests());
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      await dispatch(deleteRequest(id));
      toast.success('تم حذف الطلب');
      dispatch(getClientRequests());
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const statusCounts = {
    all: requests?.length || 0,
    pending: requests?.filter(r => r.status === 'pending').length || 0,
    in_discussion: requests?.filter(r => r.status === 'in_discussion').length || 0,
    completed: requests?.filter(r => r.status === 'completed').length || 0,
  };

  return (
    <ClientLayout title="طلباتي">
      <div className="page-header">
        <h1 className="page-header__title">طلبات الخدمة</h1>
        <p className="page-header__sub">جميع طلباتك التي قمت بنشرها</p>
      </div>

      <div className="requests-stats">
        <div className={`stat-card-mini ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}><div className="stat-card-mini__num">{statusCounts.all}</div><div className="stat-card-mini__label">الكل</div></div>
        <div className={`stat-card-mini ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}><div className="stat-card-mini__num stat-card-mini__num--pending">{statusCounts.pending}</div><div className="stat-card-mini__label">قيد الانتظار</div></div>
        <div className={`stat-card-mini ${filter === 'in_discussion' ? 'active' : ''}`} onClick={() => setFilter('in_discussion')}><div className="stat-card-mini__num stat-card-mini__num--progress">{statusCounts.in_discussion}</div><div className="stat-card-mini__label">قيد المناقشة</div></div>
        <div className={`stat-card-mini ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}><div className="stat-card-mini__num stat-card-mini__num--completed">{statusCounts.completed}</div><div className="stat-card-mini__label">مكتمل</div></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <Button variant="gold" icon={Plus} onClick={() => setModalOpen(true)}>طلب جديد</Button>
      </div>

      <div className="requests-grid">
        {filteredRequests?.length === 0 ? (
          <div className="empty-state"><div style={{ fontSize: 48 }}>📋</div><h3>لا توجد طلبات</h3><Button variant="navy" onClick={() => setModalOpen(true)}>أنشئ طلبك الأول</Button></div>
        ) : (
          filteredRequests?.map(req => (
            <div key={req.id} className="request-card">
              <div className="request-card__header">
                <div className="request-card__title-wrapper"><span className="request-card__icon">{CATEGORIES.find(c => c.value === req.category)?.icon || '📋'}</span><h3 className="request-card__title">{req.title}</h3></div>
                <Badge type={req.status}>{req.status === 'pending' ? 'قيد الانتظار' : req.status === 'in_discussion' ? 'قيد المناقشة' : req.status === 'completed' ? 'مكتمل' : 'ملغي'}</Badge>
              </div>
              <p className="request-card__description">{req.description}</p>
              <div className="request-card__details">
                <span>📍 {req.city}</span><span>💰 {req.budget} درهم</span><span>📅 {req.created_at?.split('T')[0]}</span>
              </div>
              <div className="request-card__actions">
                {(req.status === 'pending' || req.status === 'in_discussion') && (
                  <button className="btn btn--danger btn--sm" onClick={() => handleCancel(req.id)}><X size={14} /> إلغاء</button>
                )}
                {req.status === 'completed' && <button className="btn btn--ghost btn--sm"><MessageCircle size={14} /> تقييم</button>}
                <button className="btn btn--danger btn--sm" onClick={() => handleDelete(req.id)}><Trash2 size={14} /> حذف</button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="طلب خدمة جديد" onSave={handleCreate} saveText="نشر الطلب">
        <Input label="عنوان الخدمة" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} error={errors.title} required />
        <div className="form-group"><label className="form-label">وصف الخدمة *</label><textarea className={`form-input ${errors.description ? 'err' : ''}`} rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">نوع الخدمة *</label><select className={`form-input ${errors.category ? 'err' : ''}`} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}><option value="">اختر</option>{CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}</select></div>
          <Input label="الميزانية (درهم)" type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} error={errors.budget} required />
        </div>
        <Input label="المدينة" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} error={errors.city} required />
      </Modal>
    </ClientLayout>
  );
}
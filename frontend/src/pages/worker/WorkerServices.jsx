// pages/worker/WorkerServices.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWorkerServices, createService, updateService, deleteService } from '../../features/worker/workerSlice';
import WorkerLayout from '../../components/layout/WorkerLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function WorkerServices() {
  const dispatch = useDispatch();
  const { services, isLoading } = useSelector((state) => state.worker);
  const { user } = useSelector((state) => state.auth);
  
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [],
    category: '',
    price: '',
    city: '',
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getWorkerServices());
  }, [dispatch]);

  const categories = [
    { value: 'electrical', label: 'كهرباء', icon: '⚡' },
    { value: 'plumbing', label: 'سباكة', icon: '💧' },
    { value: 'carpentry', label: 'نجارة', icon: '🔨' },
    { value: 'cleaning', label: 'تنظيف', icon: '🧹' },
    { value: 'cooking', label: 'طبخ', icon: '🍳' },
    { value: 'design', label: 'تصميم', icon: '🎨' },
    { value: 'teaching', label: 'تعليم', icon: '📚' },
    { value: 'transport', label: 'نقل', icon: '🚚' },
  ];

  const openAddModal = () => {
    setEditService(null);
    setFormData({
      title: '',
      description: '',
      images: [],
      category: '',
      price: '',
      city: user?.city || '',
    });
    setPreviewImages([]);
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (service) => {
    setEditService(service);
    setFormData({
      title: service.title,
      description: service.description,
      images: service.images || [],
      category: service.category,
      price: service.price,
      city: service.city,
    });
    setPreviewImages(service.images || []);
    setErrors({});
    setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...formData.images];
    const newPreviews = [...previewImages];
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result);
          newPreviews.push(reader.result);
          setFormData({ ...formData, images: newImages });
          setPreviewImages([...newPreviews]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setPreviewImages(newPreviews);
  };

  const validateForm = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'عنوان الخدمة مطلوب';
    if (!formData.description.trim()) e.description = 'وصف الخدمة مطلوب';
    if (!formData.category) e.category = 'نوع الخدمة مطلوب';
    if (!formData.price) e.price = 'السعر مطلوب';
    else if (isNaN(formData.price) || formData.price <= 0) e.price = 'السعر غير صحيح';
    if (!formData.city.trim()) e.city = 'المدينة مطلوبة';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editService) {
        await dispatch(updateService({ id: editService.id, data: formData })).unwrap();
        toast.success(`✅ تم تحديث الخدمة "${formData.title}"`);
      } else {
        await dispatch(createService(formData)).unwrap();
        toast.success(`✅ تم إضافة الخدمة "${formData.title}" بنجاح`);
      }
      setShowModal(false);
      dispatch(getWorkerServices());
    } catch (error) {
      toast.error(error.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`هل أنت متأكد من حذف الخدمة "${title}"؟`)) return;
    try {
      await dispatch(deleteService(id)).unwrap();
      toast.success(`🗑 تم حذف الخدمة "${title}"`);
      dispatch(getWorkerServices());
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? `${cat.icon} ${cat.label}` : category;
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <WorkerLayout title="خدماتي">
      <div className="page-header">
        <div className="page-header__title">خدماتي</div>
        <div className="page-header__sub">الخدمات التي تقدمها للعملاء</div>
      </div>

      {/* Add Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn--gold" onClick={openAddModal}>
          ➕ إضافة خدمة جديدة
        </button>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛠️</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>لا توجد خدمات</div>
            <div style={{ color: 'var(--text3)', marginBottom: 20 }}>أضف خدماتك لتبدأ في استقبال الطلبات</div>
            <button className="btn btn--gold" onClick={openAddModal}>➕ إضافة خدمة جديدة</button>
          </div>
        </div>
      ) : (
        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              {/* Images Gallery */}
              {service.images && service.images.length > 0 && (
                <div className="service-card__images">
                  <img src={service.images[0]} alt={service.title} />
                  {service.images.length > 1 && (
                    <div className="service-card__images-count">+{service.images.length - 1}</div>
                  )}
                </div>
              )}
              
              <div className="service-card__content">
                <div className="service-card__header">
                  <h3 className="service-card__title">{service.title}</h3>
                  <span className="service-card__type">{getCategoryLabel(service.category)}</span>
                </div>
                
                <p className="service-card__description">{service.description}</p>
                
                <div className="service-card__meta">
                  <div className="service-card__meta-item">
                    <span>💰</span>
                    <span>{service.price} درهم/ساعة</span>
                  </div>
                  <div className="service-card__meta-item">
                    <span>📍</span>
                    <span>{service.city}</span>
                  </div>
                  <div className="service-card__meta-item">
                    <span>📅</span>
                    <span>{service.created_at?.split('T')[0]}</span>
                  </div>
                </div>
                
                <div className="service-card__actions">
                  <button className="btn btn--ghost btn--sm" onClick={() => openEditModal(service)}>
                    ✏️ تعديل
                  </button>
                  <button className="btn btn--danger btn--sm" onClick={() => handleDelete(service.id, service.title)}>
                    🗑 حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add/Edit Service */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal--large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="form-group">
                <label className="form-label">عنوان الخدمة *</label>
                <input
                  className={`form-input ${errors.title ? 'err' : ''}`}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: تركيب وتصليح مكيفات الهواء"
                />
                {errors.title && <span className="form-err">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">وصف الخدمة *</label>
                <textarea
                  className={`form-input ${errors.description ? 'err' : ''}`}
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف تفصيلي للخدمة التي تقدمها..."
                />
                {errors.description && <span className="form-err">{errors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">نوع الخدمة *</label>
                  <select
                    className={`form-input ${errors.category ? 'err' : ''}`}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">اختر نوع الخدمة</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                  {errors.category && <span className="form-err">{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">السعر (درهم/ساعة) *</label>
                  <input
                    type="number"
                    className={`form-input ${errors.price ? 'err' : ''}`}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="مثال: 150"
                  />
                  {errors.price && <span className="form-err">{errors.price}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">المدينة *</label>
                <input
                  type="text"
                  className={`form-input ${errors.city ? 'err' : ''}`}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="الدار البيضاء"
                />
                {errors.city && <span className="form-err">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">صور الأعمال (Portfolio)</label>
                <div className="image-upload-area">
                  <label className="image-upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <div className="image-upload-btn">
                      📸 + إضافة صور
                    </div>
                  </label>
                  
                  {previewImages.length > 0 && (
                    <div className="image-preview-grid">
                      {previewImages.map((img, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={img} alt={`Preview ${index}`} />
                          <button
                            type="button"
                            className="image-preview-remove"
                            onClick={() => removeImage(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="form-hint">يمكنك إضافة عدة صور لعرض أعمالك السابقة</div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setShowModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn--navy" disabled={submitting}>
                  {submitting ? 'جاري الحفظ...' : (editService ? '💾 حفظ التغييرات' : '➕ إضافة الخدمة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .service-card {
          background: var(--white);
          border: 1px solid var(--gray200);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .service-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--sh-md);
        }

        .service-card__images {
          position: relative;
          height: 180px;
          overflow: hidden;
        }

        .service-card__images img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .service-card__images-count {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0,0,0,0.6);
          color: white;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 11px;
        }

        .service-card__content {
          padding: 16px;
        }

        .service-card__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .service-card__title {
          font-size: 16px;
          font-weight: 800;
          color: var(--text1);
          margin: 0;
        }

        .service-card__type {
          background: var(--n50);
          color: var(--n700);
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .service-card__description {
          font-size: 13px;
          color: var(--text2);
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .service-card__meta {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          padding: 10px 0;
          border-top: 1px solid var(--gray100);
          border-bottom: 1px solid var(--gray100);
        }

        .service-card__meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--n700);
        }

        .service-card__actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .image-upload-area {
          border: 2px dashed var(--gray200);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          background: var(--bg);
        }

        .image-upload-btn {
          background: var(--n50);
          color: var(--n700);
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          transition: all 0.15s;
        }

        .image-upload-btn:hover {
          background: var(--n100);
        }

        .image-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 10px;
          margin-top: 16px;
        }

        .image-preview-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
        }

        .image-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-preview-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(0,0,0,0.6);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .btn--danger {
          background: #fee2e2;
          color: var(--error);
        }

        .btn--danger:hover {
          background: #fecaca;
        }

        @media (max-width: 768px) {
          .services-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </WorkerLayout>
  );
}
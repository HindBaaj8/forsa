// pages/client/ClientRequests.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { getClientRequests, createRequest, cancelRequest } from '../../features/client/clientSlice';
import ClientLayout from '../../components/layout/ClientLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CATEGORIES = [
  { value: 'electrical', label: 'كهرباء',  icon: '⚡' },
  { value: 'plumbing',   label: 'سباكة',   icon: '💧' },
  { value: 'carpentry',  label: 'نجارة',   icon: '🔨' },
  { value: 'cleaning',   label: 'تنظيف',   icon: '🧹' },
  { value: 'cooking',    label: 'طبخ',     icon: '🍳' },
  { value: 'design',     label: 'تصميم',   icon: '🎨' },
  { value: 'teaching',   label: 'تعليم',   icon: '📚' },
  { value: 'transport',  label: 'نقل',     icon: '🚚' },
];

const STATUS_MAP = {
  active:      '● قيد الدراسة',
  pending:     '● بانتظار العروض',
  in_progress: '● قيد التنفيذ',
  completed:   '● مكتمل',
  cancelled:   '● ملغي',
};

function RequestCard({ request, onCancel }) {
  const cat = CATEGORIES.find(c => c.value === request.category);

  return (
    <div className="request-card">
      <div className="request-card__header">
        <div className="request-card__title-wrapper">
          <span className="request-card__icon">{cat?.icon || '📋'}</span>
          <h3 className="request-card__title">{request.title}</h3>
        </div>
        <span className={`badge badge--${request.status}`}>
          {STATUS_MAP[request.status] || request.status}
        </span>
      </div>

      <p className="request-card__description">{request.description}</p>

      <div className="request-card__details">
        <div className="request-card__detail"><span>📍</span><span>{request.city}</span></div>
        <div className="request-card__detail"><span>💰</span><span>{request.budget} درهم</span></div>
        <div className="request-card__detail"><span>📅</span><span>{request.created_at?.split('T')[0]}</span></div>
        <div className="request-card__detail"><span>🏷️</span><span>{cat?.label || request.category}</span></div>
      </div>

      {request.worker && (
        <div className="request-card__worker">
          <div className="request-card__worker-av">
            {request.worker.first_name?.[0] || 'م'}
          </div>
          <div>
            <div className="request-card__worker-name">
              {request.worker.first_name} {request.worker.last_name}
            </div>
            <div className="request-card__worker-price">{request.final_price} درهم</div>
          </div>
        </div>
      )}

      <div className="request-card__actions">
        {(request.status === 'active' || request.status === 'pending') && (
          <button className="btn btn--outline btn--sm" onClick={() => onCancel(request.id)}>
            إلغاء الطلب
          </button>
        )}
        {request.status === 'in_progress' && (
          <button className="btn btn--navy btn--sm">
            تواصل مع المهني
          </button>
        )}
        {request.status === 'completed' && (
          <button className="btn btn--ghost btn--sm">
            اكتب تقييم 📝
          </button>
        )}
      </div>
    </div>
  );
}

export default function ClientRequests() {
  const dispatch = useDispatch();
  const { requests, isLoading } = useSelector((state) => state.client);

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter]       = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '', description: '', category: '', city: '', budget: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(getClientRequests());
  }, [dispatch]);

  const validate = () => {
    const e = {};
    if (!newRequest.title.trim())       e.title       = 'عنوان الخدمة مطلوب';
    if (!newRequest.description.trim()) e.description = 'وصف الخدمة مطلوب';
    if (!newRequest.category)           e.category    = 'نوع الخدمة مطلوب';
    if (!newRequest.city.trim())        e.city        = 'المدينة مطلوبة';
    if (!newRequest.budget)             e.budget      = 'الميزانية مطلوبة';
    else if (isNaN(newRequest.budget) || newRequest.budget <= 0) e.budget = 'الميزانية غير صحيحة';
    return e;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await dispatch(createRequest({
        ...newRequest,
        budget: parseFloat(newRequest.budget),
      })).unwrap();
      toast.success('تم نشر طلبك بنجاح');
      setShowModal(false);
      setNewRequest({ title: '', description: '', category: '', city: '', budget: '' });
      setErrors({});
    } catch (err) {
      toast.error(err || 'حدث خطأ');
    }
    setSubmitting(false);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;
    try {
      await dispatch(cancelRequest(id)).unwrap();
      toast.success('تم إلغاء الطلب');
    } catch {
      toast.error('حدث خطأ');
    }
  };

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);

  const stats = {
    total:       requests.length,
    active:      requests.filter(r => r.status === 'active').length,
    pending:     requests.filter(r => r.status === 'pending').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    completed:   requests.filter(r => r.status === 'completed').length,
    cancelled:   requests.filter(r => r.status === 'cancelled').length,
  };

  if (isLoading && requests.length === 0) return <LoadingSpinner />;

  return (
    <ClientLayout title="طلباتي">
      <div className="page-header">
        <div className="page-header__title">طلبات الخدمة</div>
        <div className="page-header__sub">جميع طلباتك التي قمت بنشرها</div>
      </div>

      {/* Stats */}
      <div className="requests-stats">
        {[
          { key: 'all',         num: stats.total,       label: 'جميع الطلبات' },
          { key: 'active',      num: stats.active,      label: 'قيد الدراسة' },
          { key: 'pending',     num: stats.pending,     label: 'بانتظار العروض' },
          { key: 'in_progress', num: stats.in_progress, label: 'قيد التنفيذ' },
          { key: 'completed',   num: stats.completed,   label: 'مكتملة' },
        ].map(({ key, num, label }) => (
          <div key={key} className={`stat-card-mini${filter === key ? ' active' : ''}`} onClick={() => setFilter(key)}>
            <div className={`stat-card-mini__num stat-card-mini__num--${key}`}>{num}</div>
            <div className="stat-card-mini__label">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters + Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div className="request-filters">
          {[
            { key: 'all',         label: `الكل (${stats.total})` },
            { key: 'active',      label: `نشطة (${stats.active})` },
            { key: 'pending',     label: `انتظار (${stats.pending})` },
            { key: 'in_progress', label: `تنفيذ (${stats.in_progress})` },
            { key: 'completed',   label: `مكتملة (${stats.completed})` },
            { key: 'cancelled',   label: `ملغية (${stats.cancelled})` },
          ].map(({ key, label }) => (
            <button key={key} className={`filter-chip${filter === key ? ' active' : ''}`} onClick={() => setFilter(key)}>
              {label}
            </button>
          ))}
        </div>
        <button className="btn btn--gold" onClick={() => setShowModal(true)}>
          + طلب جديد
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>لا توجد طلبات</div>
          <button className="btn btn--navy" onClick={() => setShowModal(true)}>انشر طلبك الأول</button>
        </div>
      ) : (
        <div className="requests-grid">
          {filtered.map(r => (
            <RequestCard key={r.id} request={r} onCancel={handleCancel} />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal--large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>طلب خدمة جديد</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">عنوان الخدمة *</label>
                <input
                  className={`form-input${errors.title ? ' err' : ''}`}
                  placeholder="مثال: إصلاح تكييف الهواء"
                  value={newRequest.title}
                  onChange={e => { setNewRequest({...newRequest, title: e.target.value}); setErrors({...errors, title: ''}); }}
                />
                {errors.title && <span className="form-err">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">وصف الخدمة *</label>
                <textarea
                  className={`form-input${errors.description ? ' err' : ''}`}
                  rows="4"
                  placeholder="صف ما تحتاجه بالتفصيل..."
                  value={newRequest.description}
                  onChange={e => { setNewRequest({...newRequest, description: e.target.value}); setErrors({...errors, description: ''}); }}
                />
                {errors.description && <span className="form-err">{errors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">نوع الخدمة *</label>
                  <select
                    className={`form-input${errors.category ? ' err' : ''}`}
                    value={newRequest.category}
                    onChange={e => { setNewRequest({...newRequest, category: e.target.value}); setErrors({...errors, category: ''}); }}
                  >
                    <option value="">اختر نوع الخدمة</option>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                  {errors.category && <span className="form-err">{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">المدينة *</label>
                  <input
                    className={`form-input${errors.city ? ' err' : ''}`}
                    placeholder="مثال: الدار البيضاء"
                    value={newRequest.city}
                    onChange={e => { setNewRequest({...newRequest, city: e.target.value}); setErrors({...errors, city: ''}); }}
                  />
                  {errors.city && <span className="form-err">{errors.city}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">الميزانية المقترحة (درهم) *</label>
                <input
                  type="number"
                  className={`form-input${errors.budget ? ' err' : ''}`}
                  placeholder="مثال: 500"
                  value={newRequest.budget}
                  onChange={e => { setNewRequest({...newRequest, budget: e.target.value}); setErrors({...errors, budget: ''}); }}
                />
                {errors.budget && <span className="form-err">{errors.budget}</span>}
                <span className="form-hint">ميزانية تقديرية، يمكن الاتفاق على السعر النهائي مع المهني</span>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setShowModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn--navy" disabled={submitting}>
                  {submitting ? <span className="spinner" /> : 'نشر الطلب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}
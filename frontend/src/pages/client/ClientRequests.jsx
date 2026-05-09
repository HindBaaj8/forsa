// pages/client/ClientRequests.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ClientLayout from '../../components/layout/ClientLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Mock data for testing
const MOCK_REQUESTS = [
  {
    id: 1,
    title: 'إصلاح تكييف الهواء',
    description: 'مكيف الهواء في غرفة المعيشة لا يعمل بشكل جيد، يحتاج إلى فحص وإصلاح',
    category: 'electrical',
    city: 'الدار البيضاء',
    budget: 300,
    status: 'active',
    created_at: '2024-01-15',
    worker_name: 'محمد أمين',
    worker_avatar: 'م',
    price: 150,
  },
  {
    id: 2,
    title: 'طباخ للحفلات',
    description: 'أحتاج طباخ لحفل عائلي يوم الجمعة المقبل، عدد الضيوف 25 شخص',
    category: 'cooking',
    city: 'الرباط',
    budget: 800,
    status: 'pending',
    created_at: '2024-01-10',
    worker_name: 'يوسف البلال',
    worker_avatar: 'ي',
    price: 300,
  },
  {
    id: 3,
    title: 'تصميم شعار لشركة',
    description: 'أحتاج تصميم شعار احترافي لشركة ناشئة في مجال التكنولوجيا',
    category: 'design',
    city: 'طنجة',
    budget: 500,
    status: 'in_progress',
    created_at: '2024-01-05',
    worker_name: 'سلمى الإدريسي',
    worker_avatar: 'س',
    price: 200,
  },
  {
    id: 4,
    title: 'سباكة الحمام',
    description: 'تسريب ماء في حمام الضيوف، يحتاج إلى سباك محترف',
    category: 'plumbing',
    city: 'مراكش',
    budget: 250,
    status: 'completed',
    created_at: '2023-12-28',
    worker_name: 'كريم السوسي',
    worker_avatar: 'ك',
    price: 100,
  },
  {
    id: 5,
    title: 'تركيب أثاث ايكيا',
    description: 'عندي 3 قطع أثاث من ايكيا需要 تركيب',
    category: 'carpentry',
    city: 'الدار البيضاء',
    budget: 200,
    status: 'cancelled',
    created_at: '2023-12-20',
  },
];

const CATEGORIES = [
  { value: 'electrical', label: 'كهرباء', icon: '⚡' },
  { value: 'plumbing', label: 'سباكة', icon: '💧' },
  { value: 'carpentry', label: 'نجارة', icon: '🔨' },
  { value: 'cleaning', label: 'تنظيف', icon: '🧹' },
  { value: 'cooking', label: 'طبخ', icon: '🍳' },
  { value: 'design', label: 'تصميم', icon: '🎨' },
  { value: 'teaching', label: 'تعليم', icon: '📚' },
  { value: 'transport', label: 'نقل', icon: '🚚' },
];

function RequestCard({ request, onCancel, onContact }) {
  const getStatusText = (status) => {
    const statusMap = {
      'active': '● قيد الدراسة',
      'pending': '● بانتظار العروض',
      'in_progress': '● قيد التنفيذ',
      'completed': '● مكتمل',
      'cancelled': '● ملغي'
    };
    return statusMap[status] || status;
  };

  const getCategoryLabel = (category) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getCategoryIcon = (category) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.icon : '📋';
  };

  return (
    <div className="request-card">
      <div className="request-card__header">
        <div className="request-card__title-wrapper">
          <span className="request-card__icon">{getCategoryIcon(request.category)}</span>
          <h3 className="request-card__title">{request.title}</h3>
        </div>
        <span className={`badge badge--${request.status}`}>
          {getStatusText(request.status)}
        </span>
      </div>

      <p className="request-card__description">{request.description}</p>

      <div className="request-card__details">
        <div className="request-card__detail">
          <span className="request-card__detail-icon">📍</span>
          <span>{request.city}</span>
        </div>
        <div className="request-card__detail">
          <span className="request-card__detail-icon">💰</span>
          <span>{request.budget} درهم</span>
        </div>
        <div className="request-card__detail">
          <span className="request-card__detail-icon">📅</span>
          <span>{request.created_at}</span>
        </div>
        <div className="request-card__detail">
          <span className="request-card__detail-icon">🏷️</span>
          <span>{getCategoryLabel(request.category)}</span>
        </div>
      </div>

      {request.worker_name && (
        <div className="request-card__worker">
          <div className="request-card__worker-av">{request.worker_avatar}</div>
          <div>
            <div className="request-card__worker-name">{request.worker_name}</div>
            <div className="request-card__worker-price">{request.price} درهم/ساعة</div>
          </div>
        </div>
      )}

      <div className="request-card__actions">
        {request.status === 'active' && (
          <>
            <button className="btn btn--outline btn--sm" onClick={() => onCancel(request.id)}>
              إلغاء الطلب
            </button>
            <button className="btn btn--navy btn--sm" onClick={() => onContact(request.id)}>
              تعديل الطلب
            </button>
          </>
        )}
        {request.status === 'pending' && (
          <button className="btn btn--navy btn--sm" onClick={() => onContact(request.id)}>
            عرض العروض →
          </button>
        )}
        {request.status === 'in_progress' && (
          <button className="btn btn--navy btn--sm" onClick={() => onContact(request.worker_id)}>
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
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: '',
    city: '',
    budget: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Simulate API call
    const loadRequests = async () => {
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 1000));
      setRequests(MOCK_REQUESTS);
      setIsLoading(false);
    };
    loadRequests();
  }, []);

  const validateRequest = () => {
    const e = {};
    if (!newRequest.title.trim()) e.title = 'عنوان الخدمة مطلوب';
    if (!newRequest.description.trim()) e.description = 'وصف الخدمة مطلوب';
    if (!newRequest.category) e.category = 'نوع الخدمة مطلوب';
    if (!newRequest.city.trim()) e.city = 'المدينة مطلوبة';
    if (!newRequest.budget) e.budget = 'الميزانية مطلوبة';
    else if (isNaN(newRequest.budget) || newRequest.budget <= 0) e.budget = 'الميزانية غير صحيحة';
    return e;
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    const e_errors = validateRequest();
    if (Object.keys(e_errors).length) {
      setErrors(e_errors);
      return;
    }

    // Simulate API call
    const newReq = {
      id: Date.now(),
      ...newRequest,
      budget: parseInt(newRequest.budget),
      status: 'active',
      created_at: new Date().toISOString().split('T')[0],
    };
    
    setRequests([newReq, ...requests]);
    setShowModal(false);
    setNewRequest({ title: '', description: '', category: '', city: '', budget: '' });
    toast.success('تم نشر طلبك بنجاح');
  };

  const handleCancelRequest = async (id) => {
    if (window.confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
      // Simulate API call
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status: 'cancelled' } : req
      ));
      toast.success('تم إلغاء الطلب');
    }
  };

  const handleContact = (id) => {
    toast.success('سيتم التواصل معك قريباً');
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const stats = {
    total: requests.length,
    active: requests.filter(r => r.status === 'active').length,
    pending: requests.filter(r => r.status === 'pending').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <ClientLayout title="طلباتي">
      <div className="page-header">
        <div className="page-header__title">طلبات الخدمة</div>
        <div className="page-header__sub">جميع طلباتك التي قمت بنشرها</div>
      </div>

      {/* Stats Cards */}
      <div className="requests-stats">
        <div className="stat-card-mini" onClick={() => setFilter('all')}>
          <div className="stat-card-mini__num">{stats.total}</div>
          <div className="stat-card-mini__label">جميع الطلبات</div>
        </div>
        <div className="stat-card-mini" onClick={() => setFilter('active')}>
          <div className="stat-card-mini__num stat-card-mini__num--active">{stats.active}</div>
          <div className="stat-card-mini__label">قيد الدراسة</div>
        </div>
        <div className="stat-card-mini" onClick={() => setFilter('pending')}>
          <div className="stat-card-mini__num stat-card-mini__num--pending">{stats.pending}</div>
          <div className="stat-card-mini__label">بانتظار العروض</div>
        </div>
        <div className="stat-card-mini" onClick={() => setFilter('in_progress')}>
          <div className="stat-card-mini__num stat-card-mini__num--progress">{stats.in_progress}</div>
          <div className="stat-card-mini__label">قيد التنفيذ</div>
        </div>
        <div className="stat-card-mini" onClick={() => setFilter('completed')}>
          <div className="stat-card-mini__num stat-card-mini__num--completed">{stats.completed}</div>
          <div className="stat-card-mini__label">مكتملة</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="request-filters">
        <button 
          className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          الكل ({stats.total})
        </button>
        <button 
          className={`filter-chip ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          نشطة ({stats.active})
        </button>
        <button 
          className={`filter-chip ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          قيد الانتظار ({stats.pending})
        </button>
        <button 
          className={`filter-chip ${filter === 'in_progress' ? 'active' : ''}`}
          onClick={() => setFilter('in_progress')}
        >
          قيد التنفيذ ({stats.in_progress})
        </button>
        <button 
          className={`filter-chip ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          مكتملة ({stats.completed})
        </button>
        <button 
          className={`filter-chip ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          ملغية ({stats.completed})
        </button>
      </div>

      {/* Add Request Button */}
      <div className="requests-header">
        <button className="btn btn--gold" onClick={() => setShowModal(true)}>
          + طلب جديد
        </button>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>لا توجد طلبات</div>
          <div style={{ color: 'var(--text3)', marginBottom: 20 }}>
            {filter === 'all' ? 'لم تقم بنشر أي طلب بعد' : `لا توجد طلبات ${filter === 'active' ? 'نشطة' : filter === 'pending' ? 'بانتظار العروض' : filter === 'in_progress' ? 'قيد التنفيذ' : 'مكتملة'}`}
          </div>
          <button className="btn btn--navy" onClick={() => setShowModal(true)}>
            انشر طلبك الأول
          </button>
        </div>
      ) : (
        <div className="requests-grid">
          {filteredRequests.map(request => (
            <RequestCard 
              key={request.id} 
              request={request} 
              onCancel={handleCancelRequest}
              onContact={handleContact}
            />
          ))}
        </div>
      )}

      {/* Modal for new request */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal--large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>طلب خدمة جديد</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateRequest}>
              <div className="form-group">
                <label className="form-label">عنوان الخدمة *</label>
                <input 
                  className={`form-input ${errors.title ? 'err' : ''}`}
                  placeholder="مثال: إصلاح تكييف الهواء"
                  value={newRequest.title}
                  onChange={e => {
                    setNewRequest({...newRequest, title: e.target.value});
                    setErrors({...errors, title: ''});
                  }}
                />
                {errors.title && <span className="form-err">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">وصف الخدمة *</label>
                <textarea 
                  className={`form-input ${errors.description ? 'err' : ''}`}
                  rows="4"
                  placeholder="صف ما تحتاجه بالتفصيل (المساحة، نوع المواد، الوقت المناسب...)"
                  value={newRequest.description}
                  onChange={e => {
                    setNewRequest({...newRequest, description: e.target.value});
                    setErrors({...errors, description: ''});
                  }}
                />
                {errors.description && <span className="form-err">{errors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">نوع الخدمة *</label>
                  <select 
                    className={`form-input ${errors.category ? 'err' : ''}`}
                    value={newRequest.category}
                    onChange={e => {
                      setNewRequest({...newRequest, category: e.target.value});
                      setErrors({...errors, category: ''});
                    }}
                  >
                    <option value="">اختر نوع الخدمة</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                  {errors.category && <span className="form-err">{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">المدينة *</label>
                  <input 
                    className={`form-input ${errors.city ? 'err' : ''}`}
                    placeholder="مثال: الدار البيضاء"
                    value={newRequest.city}
                    onChange={e => {
                      setNewRequest({...newRequest, city: e.target.value});
                      setErrors({...errors, city: ''});
                    }}
                  />
                  {errors.city && <span className="form-err">{errors.city}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">الميزانية المقترحة (درهم) *</label>
                <input 
                  type="number"
                  className={`form-input ${errors.budget ? 'err' : ''}`}
                  placeholder="مثال: 500"
                  value={newRequest.budget}
                  onChange={e => {
                    setNewRequest({...newRequest, budget: e.target.value});
                    setErrors({...errors, budget: ''});
                  }}
                />
                {errors.budget && <span className="form-err">{errors.budget}</span>}
                <div className="form-hint">هذه ميزانية تقديرية، يمكنك الاتفاق على السعر النهائي مع المهني</div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setShowModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn--navy">
                  نشر الطلب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}
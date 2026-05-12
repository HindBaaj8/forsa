import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, CheckCircle, XCircle, Ban, Trash2, Eye, Star } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import AdminToast from './AdminToast';
import { getWorkers, approveWorker, banWorker, deleteWorker } from '../../features/admin/adminSlice';

export default function AdminWorkers() {
  const dispatch = useDispatch();
  const { workers, isLoading } = useSelector((state) => state.admin);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    dispatch(getWorkers());
  }, [dispatch]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredWorkers = workers?.filter(worker => {
    const matchesSearch = worker.first_name?.toLowerCase().includes(search.toLowerCase()) ||
                         worker.last_name?.toLowerCase().includes(search.toLowerCase()) ||
                         worker.email?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || worker.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = async (id) => {
    await dispatch(approveWorker(id));
    showToast('تم قبول العامل', 'success');
  };

  const handleBan = async (id) => {
    await dispatch(banWorker(id));
    showToast('تم حظر العامل', 'warning');
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العامل؟')) {
      await dispatch(deleteWorker(id));
      showToast('تم حذف العامل', 'error');
    }
  };

  const statusCounts = {
    all: workers?.length || 0,
    active: workers?.filter(w => w.status === 'active').length || 0,
    pending: workers?.filter(w => w.status === 'pending').length || 0,
    blocked: workers?.filter(w => w.status === 'blocked').length || 0,
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <AdminLayout title="العمال">
      <div className="page-header">
        <h1 className="page-header__title">إدارة العمال</h1>
        <p className="page-header__sub">مراقبة وإدارة جميع العمال المسجلين</p>
      </div>

      {/* Stats */}
      <div className="workers-stats">
        <div className={`stat-card-mini ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          <div className="stat-card-mini__num">{statusCounts.all}</div>
          <div className="stat-card-mini__label">الكل</div>
        </div>
        <div className={`stat-card-mini ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
          <div className="stat-card-mini__num stat-card-mini__num--active">{statusCounts.active}</div>
          <div className="stat-card-mini__label">نشط</div>
        </div>
        <div className={`stat-card-mini ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          <div className="stat-card-mini__num stat-card-mini__num--pending">{statusCounts.pending}</div>
          <div className="stat-card-mini__label">معلق</div>
        </div>
        <div className={`stat-card-mini ${filter === 'blocked' ? 'active' : ''}`} onClick={() => setFilter('blocked')}>
          <div className="stat-card-mini__num stat-card-mini__num--blocked">{statusCounts.blocked}</div>
          <div className="stat-card-mini__label">محظور</div>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrap" style={{ marginBottom: 20 }}>
        <Search size={16} className="search-icon" />
        <input type="text" className="search-inp" placeholder="بحث عن عامل..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Workers Grid */}
      <div className="workers-grid">
        {filteredWorkers?.map(worker => (
          <div key={worker.id} className="worker-card">
            <div className="worker-card__header">
              <div className="worker-card__avatar">{worker.first_name?.[0]}{worker.last_name?.[0]}</div>
              <div>
                <div className="worker-card__name">{worker.first_name} {worker.last_name}</div>
                <div className="worker-card__profession">{worker.profession || 'مهني'}</div>
              </div>
              <Badge type={worker.status} />
            </div>
            <div className="worker-card__info">
              <div>📧 {worker.email}</div>
              <div>📞 {worker.phone}</div>
              <div>📍 {worker.city}</div>
            </div>
            <div className="worker-card__stats">
              <div><Star size={14} /> {worker.rating || 0}</div>
              <div>✅ {worker.completed_orders || 0} طلب</div>
              <div>💰 {worker.earnings || 0} درهم</div>
            </div>
            <div className="worker-card__actions">
              <button className="btn btn--ghost btn--sm" onClick={() => { setSelectedWorker(worker); setModalOpen(true); }}><Eye size={14} /></button>
              {worker.status === 'pending' && (
                <button className="btn btn--success btn--sm" onClick={() => handleApprove(worker.id)}><CheckCircle size={14} /> قبول</button>
              )}
              {worker.status === 'active' && (
                <button className="btn btn--warning btn--sm" onClick={() => handleBan(worker.id)}><Ban size={14} /> حظر</button>
              )}
              {worker.status === 'blocked' && (
                <button className="btn btn--success btn--sm" onClick={() => handleApprove(worker.id)}><CheckCircle size={14} /> رفع الحظر</button>
              )}
              <button className="btn btn--danger btn--sm" onClick={() => handleDelete(worker.id)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="تفاصيل العامل" size="lg">
        {selectedWorker && (
          <div className="worker-details">
            <div className="worker-details__header">
              <div className="worker-avatar-large">{selectedWorker.first_name?.[0]}{selectedWorker.last_name?.[0]}</div>
              <div>
                <h3>{selectedWorker.first_name} {selectedWorker.last_name}</h3>
                <p>{selectedWorker.profession || 'مهني'}</p>
              </div>
            </div>
            <div className="worker-details__grid">
              <div><strong>البريد:</strong> {selectedWorker.email}</div>
              <div><strong>الهاتف:</strong> {selectedWorker.phone}</div>
              <div><strong>المدينة:</strong> {selectedWorker.city}</div>
              <div><strong>الخبرة:</strong> {selectedWorker.experience} سنوات</div>
              <div><strong>التقييم:</strong> {selectedWorker.rating} ⭐</div>
              <div><strong>الطلبات المكتملة:</strong> {selectedWorker.completed_orders}</div>
              <div><strong>الأرباح:</strong> {selectedWorker.earnings} درهم</div>
              <div><strong>تاريخ التسجيل:</strong> {selectedWorker.created_at?.split('T')[0]}</div>
            </div>
          </div>
        )}
      </Modal>

      {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
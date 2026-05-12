import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Eye, MessageCircle, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import AdminToast from './AdminToast';
import AdminChatModal from './AdminChatModal';
import { getRequests, updateRequestStatus, deleteRequest } from '../../features/admin/adminSlice';

export default function AdminRequests() {
  const dispatch = useDispatch();
  const { requests, isLoading } = useSelector((state) => state.admin);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    dispatch(getRequests());
  }, [dispatch]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredRequests = requests?.filter(req => {
    const matchesSearch = req.title?.toLowerCase().includes(search.toLowerCase()) ||
                         req.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || req.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleStatusUpdate = async (id, status) => {
    await dispatch(updateRequestStatus({ id, status }));
    showToast(`تم تحديث حالة الطلب إلى ${status}`, 'success');
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      await dispatch(deleteRequest(id));
      showToast('تم حذف الطلب', 'error');
    }
  };

  const statusCounts = {
    all: requests?.length || 0,
    pending: requests?.filter(r => r.status === 'pending').length || 0,
    in_discussion: requests?.filter(r => r.status === 'in_discussion').length || 0,
    completed: requests?.filter(r => r.status === 'completed').length || 0,
    cancelled: requests?.filter(r => r.status === 'cancelled').length || 0,
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <AdminLayout title="الطلبات">
      <div className="page-header">
        <h1 className="page-header__title">إدارة الطلبات</h1>
        <p className="page-header__sub">مراقبة وإدارة جميع طلبات الخدمة</p>
      </div>

      {/* Stats */}
      <div className="requests-stats">
        <div className={`stat-card-mini ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          <div className="stat-card-mini__num">{statusCounts.all}</div>
          <div className="stat-card-mini__label">الكل</div>
        </div>
        <div className={`stat-card-mini ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          <div className="stat-card-mini__num stat-card-mini__num--pending">{statusCounts.pending}</div>
          <div className="stat-card-mini__label">معلق</div>
        </div>
        <div className={`stat-card-mini ${filter === 'in_discussion' ? 'active' : ''}`} onClick={() => setFilter('in_discussion')}>
          <div className="stat-card-mini__num stat-card-mini__num--progress">{statusCounts.in_discussion}</div>
          <div className="stat-card-mini__label">قيد المناقشة</div>
        </div>
        <div className={`stat-card-mini ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
          <div className="stat-card-mini__num stat-card-mini__num--completed">{statusCounts.completed}</div>
          <div className="stat-card-mini__label">مكتمل</div>
        </div>
        <div className={`stat-card-mini ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>
          <div className="stat-card-mini__num stat-card-mini__num--cancelled">{statusCounts.cancelled}</div>
          <div className="stat-card-mini__label">ملغي</div>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrap" style={{ marginBottom: 20 }}>
        <Search size={16} className="search-icon" />
        <input type="text" className="search-inp" placeholder="بحث عن طلب..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Requests List */}
      <div className="requests-list">
        {filteredRequests?.map(req => (
          <div key={req.id} className="req-card">
            <div className="req-card__header">
              <div>
                <div className="req-card__title">{req.title}</div>
                <div className="req-card__client">👤 {req.client_name} • 📍 {req.city}</div>
              </div>
              <Badge type={req.status}>{req.status === 'pending' ? 'معلق' : req.status === 'in_discussion' ? 'قيد المناقشة' : req.status === 'completed' ? 'مكتمل' : 'ملغي'}</Badge>
            </div>
            <p className="req-card__description">{req.description}</p>
            <div className="req-card__details">
              <span>💰 {req.budget} درهم</span>
              <span>📅 {req.created_at?.split('T')[0]}</span>
              <span>🏷️ {req.category}</span>
            </div>
            <div className="req-card__actions">
              <button className="btn btn--ghost btn--sm" onClick={() => { setSelectedRequest(req); setModalOpen(true); }}><Eye size={14} /> تفاصيل</button>
              <button className="btn btn--ghost btn--sm" onClick={() => { setSelectedRequest(req); setChatOpen(true); }}><MessageCircle size={14} /> مراسلة</button>
              {req.status === 'pending' && (
                <button className="btn btn--success btn--sm" onClick={() => handleStatusUpdate(req.id, 'active')}><CheckCircle size={14} /> تفعيل</button>
              )}
              {req.status === 'active' && (
                <button className="btn btn--warning btn--sm" onClick={() => handleStatusUpdate(req.id, 'completed')}><Clock size={14} /> إكمال</button>
              )}
              <button className="btn btn--danger btn--sm" onClick={() => handleDelete(req.id)}><Trash2 size={14} /> حذف</button>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="تفاصيل الطلب" size="lg">
        {selectedRequest && (
          <div className="request-details">
            <div className="request-details__grid">
              <div><strong>العنوان:</strong> {selectedRequest.title}</div>
              <div><strong>العميل:</strong> {selectedRequest.client_name}</div>
              <div><strong>الميزانية:</strong> {selectedRequest.budget} درهم</div>
              <div><strong>المدينة:</strong> {selectedRequest.city}</div>
              <div><strong>الفئة:</strong> {selectedRequest.category}</div>
              <div><strong>الحالة:</strong> {selectedRequest.status}</div>
              <div><strong>تاريخ الإنشاء:</strong> {selectedRequest.created_at?.split('T')[0]}</div>
            </div>
            <div className="request-details__description">
              <strong>الوصف:</strong>
              <p>{selectedRequest.description}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Chat Modal */}
      <AdminChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} user={selectedRequest} />

      {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
// components/worker/WorkerOrders.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, Eye, DollarSign, Briefcase, MapPin, Calendar, User, RefreshCw,
  CheckCircle, XCircle, Play
} from 'lucide-react';
import WorkerLayout from '../layout/WorkerLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import { getWorkerRequests, submitOfferOnRequest } from '../../features/worker/workerSlice';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import '../../styles/Dashboard.css';

export default function WorkerOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requests, isLoading } = useSelector((state) => state.worker);
  const { user } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [offerData, setOfferData] = useState({
    price: '',
    duration: '',
    message: ''
  });

  const loadRequests = async () => {
    setRefreshing(true);
    await dispatch(getWorkerRequests());
    setRefreshing(false);
  };

  useEffect(() => {
    loadRequests();
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto refresh...');
      dispatch(getWorkerRequests());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const requestsArray = Array.isArray(requests) ? requests : (requests?.data || []);
  
  const handleContactClient = async (clientId, clientName) => {
    if (!user) {
      toast.error('الرجاء تسجيل الدخول أولاً');
      return;
    }
    
    try {
      await api.post('/conversations', { user_id: clientId });
      toast.success(`تم بدء محادثة مع ${clientName}`);
      navigate('/worker/messages');
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('حدث خطأ في بدء المحادثة');
    }
  };

  const handleSubmitOffer = async () => {
    if (!offerData.price || !offerData.duration) {
      toast.error('الرجاء إدخال السعر والمدة');
      return;
    }

    try {
      await dispatch(submitOfferOnRequest({
        requestId: selectedRequest?.id,
        price: offerData.price,
        duration: offerData.duration,
        message: offerData.message
      })).unwrap();
      
      toast.success('تم إرسال العرض بنجاح');
      setOfferModalOpen(false);
      setOfferData({ price: '', duration: '', message: '' });
      loadRequests();
    } catch (error) {
      toast.error(error || 'حدث خطأ');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.post(`/worker/requests/${requestId}/accept`);
      toast.success('تم قبول الطلب');
      dispatch(getWorkerRequests());
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.post(`/worker/requests/${requestId}/reject`);
      toast.success('تم رفض الطلب');
      dispatch(getWorkerRequests());
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleStartWork = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/start`);
      toast.success('تم بدء العمل');
      dispatch(getWorkerRequests());
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleCompleteWork = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/complete`);
      toast.success('تم إكمال العمل');
      dispatch(getWorkerRequests());
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const filteredRequests = requestsArray.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'pending') return req.status === 'pending';
    if (filter === 'in_progress') return req.status === 'accepted' || req.status === 'in_progress';
    if (filter === 'completed') return req.status === 'completed';
    if (filter === 'cancelled') return req.status === 'cancelled' || req.status === 'rejected';
    return true;
  });

  const statusCounts = {
    all: requestsArray.length,
    pending: requestsArray.filter(req => req.status === 'pending').length,
    in_progress: requestsArray.filter(req => req.status === 'accepted' || req.status === 'in_progress').length,
    completed: requestsArray.filter(req => req.status === 'completed').length,
    cancelled: requestsArray.filter(req => req.status === 'cancelled' || req.status === 'rejected').length,
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge type="warning">🔄 طلب جديد</Badge>;
      case 'accepted':
        return <Badge type="primary">⚙️ قيد التنفيذ</Badge>;
      case 'in_progress':
        return <Badge type="primary">⚙️ قيد التنفيذ</Badge>;
      case 'completed':
        return <Badge type="success">✓ مكتمل</Badge>;
      case 'cancelled':
        return <Badge type="danger">✗ ملغي</Badge>;
      case 'rejected':
        return <Badge type="danger">✗ مرفوض</Badge>;
      default:
        return <Badge type="secondary">{status}</Badge>;
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <WorkerLayout title="طلبات العملاء">
      <div className="page-header">
        <h1 className="page-header__title">📋 طلبات العملاء</h1>
        <p className="page-header__sub">تصفح طلبات العملاء وقدم عروضك المناسبة</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div className="stats-grid" style={{ marginBottom: '0', flex: 1 }}>
          <div className="stat-card-mini">
            <div className="stat-card-mini__num">{statusCounts.all}</div>
            <div className="stat-card-mini__label">جميع الطلبات</div>
          </div>
          <div className="stat-card-mini">
            <div className="stat-card-mini__num stat-card-mini__num--pending">{statusCounts.pending}</div>
            <div className="stat-card-mini__label">طلبات جديدة</div>
          </div>
          <div className="stat-card-mini">
            <div className="stat-card-mini__num stat-card-mini__num--progress">{statusCounts.in_progress}</div>
            <div className="stat-card-mini__label">قيد التنفيذ</div>
          </div>
          <div className="stat-card-mini">
            <div className="stat-card-mini__num stat-card-mini__num--completed">{statusCounts.completed}</div>
            <div className="stat-card-mini__label">مكتملة</div>
          </div>
        </div>
        <button onClick={loadRequests} disabled={refreshing} className="btn btn--ghost btn--sm" style={{ marginRight: '15px' }}>
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} /> 
          {refreshing ? 'جاري التحديث...' : 'تحديث'}
        </button>
      </div>

      <div className="filter-tabs" style={{ marginBottom: '24px' }}>
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          الكل ({statusCounts.all})
        </button>
        <button className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          جديدة ({statusCounts.pending})
        </button>
        <button className={`filter-tab ${filter === 'in_progress' ? 'active' : ''}`} onClick={() => setFilter('in_progress')}>
          قيد التنفيذ ({statusCounts.in_progress})
        </button>
        <button className={`filter-tab ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
          مكتملة ({statusCounts.completed})
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
          <h3>لا توجد طلبات حالياً</h3>
          <p>سيظهر هنا طلبات العملاء الجديدة</p>
          <button onClick={loadRequests} className="btn btn--navy btn--sm" style={{ marginTop: 16 }}>
            <RefreshCw size={14} /> تحديث
          </button>
        </div>
      ) : (
        <div className="requests-grid">
          {filteredRequests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-card__header">
                <div className="request-card__client">
                  <div className="client-avatar">{request.client?.first_name?.[0] || 'ع'}</div>
                  <div className="client-info">
                    <div className="client-name">{request.client?.first_name} {request.client?.last_name}</div>
                    <div className="client-phone">📞 {request.client?.phone || 'رقم غير متوفر'}</div>
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="request-card__content">
                <h3 className="request-title"><Briefcase size={18} /> {request.title}</h3>
                <p className="request-description">{request.description?.substring(0, 120)}...</p>
              </div>

              <div className="request-card__details">
                <div className="detail-item"><Calendar size={14} /><span>{request.created_at?.split('T')[0]}</span></div>
                <div className="detail-item"><MapPin size={14} /><span>{request.city}</span></div>
                <div className="detail-item"><DollarSign size={14} /><span>{request.budget} درهم</span></div>
                <div className="detail-item"><User size={14} /><span>{request.category?.name}</span></div>
              </div>

              {/* ✅ أزرار الإجراءات - داخل map */}
              <div className="request-card__actions">
                {request.status === 'pending' && (
                  <>
                    <button className="btn btn--success btn--sm" onClick={() => handleAcceptRequest(request.id)}>
                      <CheckCircle size={14} /> قبول
                    </button>
                    <button className="btn btn--danger btn--sm" onClick={() => handleRejectRequest(request.id)}>
                      <XCircle size={14} /> رفض
                    </button>
                  </>
                )}
                
                {request.status === 'accepted' && (
                  <button className="btn btn--primary btn--sm" onClick={() => handleStartWork(request.id)}>
                    <Play size={14} /> بدء العمل
                  </button>
                )}
                
                {request.status === 'in_progress' && (
                  <button className="btn btn--gold btn--sm" onClick={() => handleCompleteWork(request.id)}>
                    <CheckCircle size={14} /> إكمال
                  </button>
                )}
                
                <button className="btn btn--navy btn--sm" onClick={() => handleContactClient(request.client_id, request.client?.first_name)}>
                  <MessageCircle size={14} /> تواصل
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="تفاصيل الطلب" size="lg">
        {selectedRequest && (
          <div className="request-details">
            <div className="detail-row"><strong>📋 عنوان الخدمة:</strong><span>{selectedRequest.title}</span></div>
            <div className="detail-row"><strong>📝 الوصف:</strong><span>{selectedRequest.description}</span></div>
            <div className="detail-row"><strong>💰 الميزانية:</strong><span>{selectedRequest.budget} درهم</span></div>
            <div className="detail-row"><strong>📍 المدينة:</strong><span>{selectedRequest.city}</span></div>
            <div className="detail-row"><strong>📂 الفئة:</strong><span>{selectedRequest.category?.name}</span></div>
            <div className="detail-row"><strong>👤 العميل:</strong><span>{selectedRequest.client?.first_name} {selectedRequest.client?.last_name}</span></div>
            <div className="detail-row"><strong>📞 الهاتف:</strong><span>{selectedRequest.client?.phone || 'غير متوفر'}</span></div>
            <div className="detail-row"><strong>📅 تاريخ النشر:</strong><span>{selectedRequest.created_at?.split('T')[0]}</span></div>
          </div>
        )}
      </Modal>

      <Modal isOpen={offerModalOpen} onClose={() => { setOfferModalOpen(false); setOfferData({ price: '', duration: '', message: '' }); }} title="تقديم عرض للعميل" onSave={handleSubmitOffer} saveText="إرسال العرض">
        <div className="offer-form">
          <input type="number" placeholder="💵 السعر المقترح (درهم)" className="form-input" value={offerData.price} onChange={(e) => setOfferData({ ...offerData, price: e.target.value })} />
          <input type="text" placeholder="⏱️ المدة (مثلاً: 3 أيام، أسبوع)" className="form-input" value={offerData.duration} onChange={(e) => setOfferData({ ...offerData, duration: e.target.value })} />
          <textarea placeholder="💬 رسالة للعميل (اختياري)" className="form-input" rows="4" value={offerData.message} onChange={(e) => setOfferData({ ...offerData, message: e.target.value })} />
        </div>
      </Modal>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </WorkerLayout>
  );
}
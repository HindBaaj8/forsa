// components/worker/WorkerOrders.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, MessageCircle, Eye, DollarSign, Briefcase } from 'lucide-react';
import WorkerLayout from '../layout/WorkerLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import { 
  getAvailableRequests,        // ✅ اسم صحيح
  acceptClientRequest, 
  rejectClientRequest, 
  submitOfferOnRequest 
} from '../../features/worker/workerSlice';
import { toast } from 'react-hot-toast';
import '../../styles/Dashboard.css';

export default function WorkerOrders() {
  const dispatch = useDispatch();
  const { requests, isLoading } = useSelector((state) => state.worker);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerData, setOfferData] = useState({
    price: '',
    duration: '',
    message: ''
  });

  useEffect(() => {
    dispatch(getAvailableRequests());  // ✅ استعمل getAvailableRequests
  }, [dispatch]);

  const requestsArray = Array.isArray(requests) ? requests : (requests?.data || []);
  
  const handleAcceptRequest = async (id) => {
    try {
      await dispatch(acceptClientRequest(id)).unwrap();
      toast.success('تم قبول الطلب');
      dispatch(getAvailableRequests());
    } catch (error) {
      toast.error(error || 'حدث خطأ');
    }
  };

  const handleRejectRequest = async (id) => {
    if (window.confirm('هل أنت متأكد من رفض هذا الطلب؟')) {
      try {
        await dispatch(rejectClientRequest(id)).unwrap();
        toast.success('تم رفض الطلب');
        dispatch(getAvailableRequests());
      } catch (error) {
        toast.error(error || 'حدث خطأ');
      }
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
      dispatch(getAvailableRequests());
    } catch (error) {
      toast.error(error || 'حدث خطأ');
    }
  };

  const filteredRequests = requestsArray.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const statusCounts = {
    all: requestsArray.length || 0,
    pending: requestsArray.filter(req => req.status === 'pending').length || 0,
    accepted: requestsArray.filter(req => req.status === 'accepted').length || 0,
    in_progress: requestsArray.filter(req => req.status === 'in_progress').length || 0,
    completed: requestsArray.filter(req => req.status === 'completed').length || 0,
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge type="warning">🔄 جديد</Badge>;
      case 'accepted':
        return <Badge type="info">✓ مقبول</Badge>;
      case 'in_progress':
        return <Badge type="primary">⚙️ قيد التنفيذ</Badge>;
      case 'completed':
        return <Badge type="success">✓ مكتمل</Badge>;
      default:
        return <Badge type="secondary">{status}</Badge>;
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <WorkerLayout title="طلبات الخدمة">
      <div className="page-header">
        <h1 className="page-header__title">طلبات الخدمة</h1>
        <p className="page-header__sub">طلبات العملاء التي تناسب خدماتك</p>
      </div>

      <div className="order-stats">
        <div className={`order-stat ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          <div className="order-stat__num">{statusCounts.all}</div>
          <div className="order-stat__label">الكل</div>
        </div>
        <div className={`order-stat ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          <div className="order-stat__num order-stat__num--pending">{statusCounts.pending}</div>
          <div className="order-stat__label">جديدة</div>
        </div>
        <div className={`order-stat ${filter === 'accepted' ? 'active' : ''}`} onClick={() => setFilter('accepted')}>
          <div className="order-stat__num order-stat__num--accepted">{statusCounts.accepted}</div>
          <div className="order-stat__label">مقبولة</div>
        </div>
        <div className={`order-stat ${filter === 'in_progress' ? 'active' : ''}`} onClick={() => setFilter('in_progress')}>
          <div className="order-stat__num order-stat__num--progress">{statusCounts.in_progress}</div>
          <div className="order-stat__label">قيد التنفيذ</div>
        </div>
        <div className={`order-stat ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
          <div className="order-stat__num order-stat__num--completed">{statusCounts.completed}</div>
          <div className="order-stat__label">مكتمل</div>
        </div>
      </div>

      <div className="orders-list">
        {filteredRequests?.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48 }}>📋</div>
            <h3>لا توجد طلبات</h3>
            <p>سيظهر هنا طلبات العملاء الجديدة</p>
          </div>
        ) : (
          filteredRequests?.map(request => (
            <div key={request.id} className="order-card">
              <div className="order-card__header">
                <div className="order-card__client">
                  <div className="order-card__client-av">
                    {request.client?.first_name?.[0] || request.client_name?.[0] || 'ع'}
                  </div>
                  <div>
                    <div className="order-card__client-name">
                      {request.client?.first_name} {request.client?.last_name}
                    </div>
                    <div className="order-card__client-phone">
                      📞 {request.client?.phone || 'غير متوفر'}
                    </div>
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>
              
              <div className="order-card__service">
                <div className="order-card__service-title">
                  <Briefcase size={16} /> {request.title}
                </div>
                <p className="order-card__service-desc">{request.description}</p>
              </div>
              
              <div className="order-card__details">
                <div><span>📅</span><div>{request.created_at?.split('T')[0]}</div></div>
                <div><span>📍</span><div>{request.city}</div></div>
                <div><span>💰</span><div>{request.budget} درهم</div></div>
                <div><span>📂</span><div>{request.category?.name}</div></div>
              </div>
              
              <div className="order-card__actions">
                {request.status === 'pending' && (
                  <button 
                    className="btn btn--primary btn--sm" 
                    onClick={() => {
                      setSelectedRequest(request);
                      setOfferModalOpen(true);
                    }}
                  >
                    <DollarSign size={14} /> تقديم عرض
                  </button>
                )}
                <button 
                  className="btn btn--ghost btn--sm" 
                  onClick={() => { setSelectedRequest(request); setModalOpen(true); }}
                >
                  <Eye size={14} /> تفاصيل
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request Details Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="تفاصيل الطلب" size="lg">
        {selectedRequest && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><strong>📋 عنوان الخدمة:</strong> {selectedRequest.title}</div>
            <div><strong>📝 الوصف:</strong> {selectedRequest.description}</div>
            <div><strong>💰 الميزانية:</strong> {selectedRequest.budget} درهم</div>
            <div><strong>📍 المدينة:</strong> {selectedRequest.city}</div>
            <div><strong>📂 الفئة:</strong> {selectedRequest.category?.name}</div>
            <div><strong>👤 العميل:</strong> {selectedRequest.client?.first_name} {selectedRequest.client?.last_name}</div>
            <div><strong>📞 الهاتف:</strong> {selectedRequest.client?.phone}</div>
            <div><strong>📅 تاريخ النشر:</strong> {selectedRequest.created_at?.split('T')[0]}</div>
          </div>
        )}
      </Modal>

      {/* Submit Offer Modal */}
      <Modal 
        isOpen={offerModalOpen} 
        onClose={() => {
          setOfferModalOpen(false);
          setOfferData({ price: '', duration: '', message: '' });
        }} 
        title="تقديم عرض" 
        onSave={handleSubmitOffer} 
        saveText="إرسال العرض"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="number" 
            placeholder="السعر المقترح (درهم)"
            className="form-input"
            value={offerData.price}
            onChange={(e) => setOfferData({ ...offerData, price: e.target.value })}
          />
          <input 
            type="text" 
            placeholder="المدة (مثلاً: 3 أيام، أسبوع)"
            className="form-input"
            value={offerData.duration}
            onChange={(e) => setOfferData({ ...offerData, duration: e.target.value })}
          />
          <textarea 
            placeholder="رسالة للعميل (اختياري)"
            className="form-input"
            rows="3"
            value={offerData.message}
            onChange={(e) => setOfferData({ ...offerData, message: e.target.value })}
          />
        </div>
      </Modal>
    </WorkerLayout>
  );
}
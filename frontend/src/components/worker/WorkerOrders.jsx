import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, MessageCircle, Eye } from 'lucide-react';
import WorkerLayout from '../layout/WorkerLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import { getWorkerOrders, acceptOrder, rejectOrder, startOrder, completeOrder } from '../../features/worker/workerSlice';
import { toast } from 'react-hot-toast';
import '../../styles/Dashboard.css';

export default function WorkerOrders() {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.worker);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getWorkerOrders());
  }, [dispatch]);

  const handleAccept = async (id) => {
    await dispatch(acceptOrder(id));
    toast.success('تم قبول الطلب');
    dispatch(getWorkerOrders());
  };

  const handleReject = async (id) => {
    if (window.confirm('هل أنت متأكد من رفض هذا الطلب؟')) {
      await dispatch(rejectOrder(id));
      toast.success('تم رفض الطلب');
      dispatch(getWorkerOrders());
    }
  };

  const handleStart = async (id) => {
    await dispatch(startOrder(id));
    toast.success('تم بدء العمل');
    dispatch(getWorkerOrders());
  };

  const handleComplete = async (id) => {
    await dispatch(completeOrder(id));
    toast.success('تم إكمال العمل');
    dispatch(getWorkerOrders());
  };

  const filteredOrders = orders?.filter(o => filter === 'all' || o.status === filter);

  const statusCounts = {
    all: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    accepted: orders?.filter(o => o.status === 'accepted').length || 0,
    in_progress: orders?.filter(o => o.status === 'in_progress').length || 0,
    completed: orders?.filter(o => o.status === 'completed').length || 0,
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <WorkerLayout title="الطلبات">
      <div className="page-header">
        <h1 className="page-header__title">الطلبات الواردة</h1>
        <p className="page-header__sub">جميع طلبات العملاء التي تخص خدماتك</p>
      </div>

      <div className="order-stats">
        <div className={`order-stat ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}><div className="order-stat__num">{statusCounts.all}</div><div className="order-stat__label">الكل</div></div>
        <div className={`order-stat ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}><div className="order-stat__num order-stat__num--pending">{statusCounts.pending}</div><div className="order-stat__label">قيد الانتظار</div></div>
        <div className={`order-stat ${filter === 'accepted' ? 'active' : ''}`} onClick={() => setFilter('accepted')}><div className="order-stat__num order-stat__num--accepted">{statusCounts.accepted}</div><div className="order-stat__label">تم القبول</div></div>
        <div className={`order-stat ${filter === 'in_progress' ? 'active' : ''}`} onClick={() => setFilter('in_progress')}><div className="order-stat__num order-stat__num--progress">{statusCounts.in_progress}</div><div className="order-stat__label">قيد التنفيذ</div></div>
        <div className={`order-stat ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}><div className="order-stat__num order-stat__num--completed">{statusCounts.completed}</div><div className="order-stat__label">مكتمل</div></div>
      </div>

      <div className="orders-list">
        {filteredOrders?.length === 0 ? (
          <div className="empty-state"><div style={{ fontSize: 48 }}>📭</div><h3>لا توجد طلبات</h3></div>
        ) : (
          filteredOrders?.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card__header">
                <div className="order-card__client"><div className="order-card__client-av">{order.client_name?.[0]}</div><div><div className="order-card__client-name">{order.client_name}</div><div className="order-card__client-phone">📞 {order.client_phone}</div></div></div>
                <Badge type={order.status}>{order.status === 'pending' ? 'بانتظار الموافقة' : order.status === 'accepted' ? 'تم القبول' : order.status === 'in_progress' ? 'قيد التنفيذ' : 'مكتمل'}</Badge>
              </div>
              <div className="order-card__service"><div className="order-card__service-title">{order.service_name}</div><p className="order-card__service-desc">{order.description}</p></div>
              <div className="order-card__details"><div><span>📅</span><div>{order.date || order.created_at?.split('T')[0]}</div></div><div><span>📍</span><div>{order.address}</div></div><div><span>💰</span><div className="order-card__price">{order.price} درهم</div></div></div>
              <div className="order-card__actions">
                {order.status === 'pending' && (<><button className="btn btn--success btn--sm" onClick={() => handleAccept(order.id)}><CheckCircle size={14} /> قبول</button><button className="btn btn--danger btn--sm" onClick={() => handleReject(order.id)}><XCircle size={14} /> رفض</button></>)}
                {order.status === 'accepted' && <button className="btn btn--navy btn--sm" onClick={() => handleStart(order.id)}><Clock size={14} /> بدء العمل</button>}
                {order.status === 'in_progress' && <button className="btn btn--success btn--sm" onClick={() => handleComplete(order.id)}><CheckCircle size={14} /> إكمال</button>}
                <button className="btn btn--ghost btn--sm" onClick={() => { setSelectedOrder(order); setModalOpen(true); }}><Eye size={14} /> تفاصيل</button>
                <Link to={`/worker/messages?order=${order.id}`}><button className="btn btn--ghost btn--sm"><MessageCircle size={14} /> مراسلة</button></Link>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="تفاصيل الطلب" size="lg">
        {selectedOrder && (<div><div><strong>الخدمة:</strong> {selectedOrder.service_name}</div><div><strong>العميل:</strong> {selectedOrder.client_name}</div><div><strong>الهاتف:</strong> {selectedOrder.client_phone}</div><div><strong>العنوان:</strong> {selectedOrder.address}</div><div><strong>السعر:</strong> {selectedOrder.price} درهم</div><div><strong>التاريخ:</strong> {selectedOrder.date}</div><div><strong>الوصف:</strong> <p>{selectedOrder.description}</p></div></div>)}
      </Modal>
    </WorkerLayout>
  );
}
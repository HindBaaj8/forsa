// pages/worker/WorkerOrders.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getWorkerOrders, acceptOrder, startOrder, completeOrder, cancelOrder } from '../../features/worker/workerSlice';
import WorkerLayout from '../../components/layout/WorkerLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

function OrderCard({ order, onAccept, onStart, onComplete, onCancel }) {
  const getStatusBadge = () => {
    switch (order.status) {
      case 'pending': return <span className="badge badge--pending">⏳ بانتظار الموافقة</span>;
      case 'accepted': return <span className="badge badge--active">✅ تم القبول</span>;
      case 'in_progress': return <span className="badge badge--progress">🔨 قيد التنفيذ</span>;
      case 'completed': return <span className="badge badge--completed">🎉 مكتمل</span>;
      case 'cancelled': return <span className="badge badge--cancel">❌ ملغي</span>;
      default: return <span className="badge badge--active">{order.status}</span>;
    }
  };

  return (
    <div className="order-card">
      <div className="order-card__header">
        <div className="order-card__client">
          <div className="order-card__client-av">
            {order.client_name?.[0] || 'ع'}
          </div>
          <div>
            <div className="order-card__client-name">{order.client_name}</div>
            <div className="order-card__client-phone">📞 {order.client_phone}</div>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="order-card__service">
        <div className="order-card__service-title">{order.service_name || order.service}</div>
        <p className="order-card__service-desc">{order.description}</p>
      </div>

      <div className="order-card__details">
        <div className="order-card__detail">
          <span>📅</span>
          <div>
            <div className="order-card__detail-label">التاريخ</div>
            <div>{order.date || order.scheduled_date || order.created_at?.split('T')[0]}</div>
          </div>
        </div>
        <div className="order-card__detail">
          <span>⏰</span>
          <div>
            <div className="order-card__detail-label">الوقت</div>
            <div>{order.time || order.scheduled_time || 'مرن'}</div>
          </div>
        </div>
        <div className="order-card__detail">
          <span>📍</span>
          <div>
            <div className="order-card__detail-label">العنوان</div>
            <div>{order.address}</div>
          </div>
        </div>
        <div className="order-card__detail">
          <span>💰</span>
          <div>
            <div className="order-card__detail-label">السعر</div>
            <div className="order-card__price">{order.price} درهم</div>
          </div>
        </div>
      </div>

      <div className="order-card__actions">
        {order.status === 'pending' && (
          <>
            <button className="btn btn--success btn--sm" onClick={() => onAccept(order.id)}>
              ✓ قبول الطلب
            </button>
            <button className="btn btn--danger btn--sm" onClick={() => onCancel(order.id)}>
              ✗ رفض الطلب
            </button>
          </>
        )}
        {order.status === 'accepted' && (
          <button className="btn btn--navy btn--sm" onClick={() => onStart(order.id)}>
            🔨 بدء العمل →
          </button>
        )}
        {order.status === 'in_progress' && (
          <>
            <button className="btn btn--success btn--sm" onClick={() => onComplete(order.id)}>
              ✓ تأكيد الإنجاز
            </button>
            <Link to={`/worker/messages`}>
              <button className="btn btn--outline btn--sm">
                💬 تواصل مع العميل
              </button>
            </Link>
          </>
        )}
        {order.status === 'completed' && (
          <Link to={`/worker/review/${order.id}`}>
            <button className="btn btn--ghost btn--sm">
              📝 عرض تقييم العميل
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function WorkerOrders() {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.worker);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(getWorkerOrders());
  }, [dispatch]);

  const handleAccept = async (id) => {
    try {
      await dispatch(acceptOrder(id)).unwrap();
      toast.success('تم قبول الطلب بنجاح');
      dispatch(getWorkerOrders());
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    try {
      await dispatch(cancelOrder(id)).unwrap();
      toast.success('تم رفض الطلب');
      dispatch(getWorkerOrders());
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleStart = async (id) => {
    try {
      await dispatch(startOrder(id)).unwrap();
      toast.success('تم بدء العمل');
      dispatch(getWorkerOrders());
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleComplete = async (id) => {
    try {
      await dispatch(completeOrder(id)).unwrap();
      toast.success('تم تأكيد الإنجاز');
      dispatch(getWorkerOrders());
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const filteredOrders = orders?.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  }) || [];

  const counts = {
    all: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    accepted: orders?.filter(o => o.status === 'accepted').length || 0,
    in_progress: orders?.filter(o => o.status === 'in_progress').length || 0,
    completed: orders?.filter(o => o.status === 'completed').length || 0,
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <WorkerLayout title="الطلبات الواردة">
      <div className="page-header">
        <div className="page-header__title">الطلبات الواردة</div>
        <div className="page-header__sub">جميع طلبات العملاء التي تخص خدماتك</div>
      </div>

      {/* Stats Cards */}
      <div className="order-stats">
        <div className="order-stat" onClick={() => setFilter('all')}>
          <div className="order-stat__num">{counts.all}</div>
          <div className="order-stat__label">جميع الطلبات</div>
        </div>
        <div className="order-stat" onClick={() => setFilter('pending')}>
          <div className="order-stat__num order-stat__num--pending">{counts.pending}</div>
          <div className="order-stat__label">قيد الانتظار</div>
        </div>
        <div className="order-stat" onClick={() => setFilter('accepted')}>
          <div className="order-stat__num order-stat__num--accepted">{counts.accepted}</div>
          <div className="order-stat__label">تم القبول</div>
        </div>
        <div className="order-stat" onClick={() => setFilter('in_progress')}>
          <div className="order-stat__num order-stat__num--progress">{counts.in_progress}</div>
          <div className="order-stat__label">قيد التنفيذ</div>
        </div>
        <div className="order-stat" onClick={() => setFilter('completed')}>
          <div className="order-stat__num order-stat__num--completed">{counts.completed}</div>
          <div className="order-stat__label">مكتملة</div>
        </div>
      </div>

      {/* Filters */}
      <div className="order-filters">
        <button 
          className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          الكل ({counts.all})
        </button>
        <button 
          className={`filter-chip ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          📋 قيد الانتظار ({counts.pending})
        </button>
        <button 
          className={`filter-chip ${filter === 'accepted' ? 'active' : ''}`}
          onClick={() => setFilter('accepted')}
        >
          ✅ تم القبول ({counts.accepted})
        </button>
        <button 
          className={`filter-chip ${filter === 'in_progress' ? 'active' : ''}`}
          onClick={() => setFilter('in_progress')}
        >
          🔨 قيد التنفيذ ({counts.in_progress})
        </button>
        <button 
          className={`filter-chip ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          🎉 مكتملة ({counts.completed})
        </button>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>لا توجد طلبات</div>
          <div style={{ color: 'var(--text3)' }}>
            {filter === 'pending' ? 'ليس لديك طلبات معلقة حالياً' :
             filter === 'accepted' ? 'لم تقبل أي طلب بعد' :
             filter === 'in_progress' ? 'لا توجد طلبات قيد التنفيذ' :
             filter === 'completed' ? 'لم تكمل أي طلب بعد' :
             'لم تستقبل أي طلبات حتى الآن'}
          </div>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order}
              onAccept={handleAccept}
              onCancel={handleCancel}
              onStart={handleStart}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </WorkerLayout>
  );
}
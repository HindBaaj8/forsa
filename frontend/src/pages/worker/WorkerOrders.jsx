// pages/worker/WorkerOrders.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import WorkerLayout from '../../components/layout/WorkerLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MOCK_ORDERS = [
  {
    id: 1,
    client_name: 'أحمد العلوي',
    client_avatar: 'أ',
    client_phone: '0612345678',
    service: 'تركيب مكيف هواء',
    description: 'مكيف سبليت 18000 وحدة需要在 غرفة النوم الرئيسية',
    date: '2024-01-15',
    time: '15:00',
    price: 350,
    address: 'الدار البيضاء، حي الأندلس',
    status: 'pending',
    created_at: '2024-01-10',
  },
  {
    id: 2,
    client_name: 'فاطمة الزهراء',
    client_avatar: 'ف',
    client_phone: '0623456789',
    service: 'إصلاح تسريب ماء',
    description: 'تسريب في حمام الضيوف، يقطر الماء من السقف',
    date: '2024-01-16',
    time: '10:00',
    price: 200,
    address: 'الرباط، سلا',
    status: 'accepted',
    created_at: '2024-01-12',
  },
  {
    id: 3,
    client_name: 'محمد العمري',
    client_avatar: 'م',
    client_phone: '0634567890',
    service: 'طلاء المنزل',
    description: 'طلاء 3 غرف + صالون، الدهان أبيض مع لمسات رمادية',
    date: '2024-01-18',
    time: '09:00',
    price: 800,
    address: 'طنجة، مركز المدينة',
    status: 'in_progress',
    created_at: '2024-01-08',
  },
  {
    id: 4,
    client_name: 'سارة بناني',
    client_avatar: 'س',
    client_phone: '0645678901',
    service: 'تركيب مطبخ',
    description: 'مطبخ جديد يحتاج إلى تركيب وتوصيل المياه والكهرباء',
    date: '2024-01-20',
    time: '14:00',
    price: 1200,
    address: 'مراكش، جليز',
    status: 'completed',
    created_at: '2024-01-05',
  },
];

function OrderCard({ order, onAccept, onReject, onComplete }) {
  const getStatusBadge = () => {
    switch (order.status) {
      case 'pending': return <span className="badge badge--pending">بانتظار الموافقة</span>;
      case 'accepted': return <span className="badge badge--active">تم القبول</span>;
      case 'in_progress': return <span className="badge badge--progress">قيد التنفيذ</span>;
      case 'completed': return <span className="badge badge--completed">مكتمل</span>;
      default: return <span className="badge badge--active">{order.status}</span>;
    }
  };

  return (
    <div className="order-card">
      <div className="order-card__header">
        <div className="order-card__client">
          <div className="order-card__client-av">{order.client_avatar}</div>
          <div>
            <div className="order-card__client-name">{order.client_name}</div>
            <div className="order-card__client-phone">📞 {order.client_phone}</div>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="order-card__service">
        <div className="order-card__service-title">{order.service}</div>
        <p className="order-card__service-desc">{order.description}</p>
      </div>

      <div className="order-card__details">
        <div className="order-card__detail">
          <span>📅</span>
          <div>
            <div className="order-card__detail-label">التاريخ</div>
            <div>{order.date}</div>
          </div>
        </div>
        <div className="order-card__detail">
          <span>⏰</span>
          <div>
            <div className="order-card__detail-label">الوقت</div>
            <div>{order.time}</div>
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
              قبول الطلب ✓
            </button>
            <button className="btn btn--danger btn--sm" onClick={() => onReject(order.id)}>
              رفض الطلب ✗
            </button>
          </>
        )}
        {order.status === 'accepted' && (
          <button className="btn btn--navy btn--sm" onClick={() => onComplete(order.id)}>
            بدء العمل →
          </button>
        )}
        {order.status === 'in_progress' && (
          <>
            <button className="btn btn--success btn--sm" onClick={() => onComplete(order.id)}>
              تأكيد الإنجاز ✓
            </button>
            <Link to={`/worker/messages/${order.id}`}>
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
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 800));
      setOrders(MOCK_ORDERS);
      setIsLoading(false);
    };
    loadOrders();
  }, []);

  const handleAccept = (id) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: 'accepted' } : order
    ));
    toast.success('تم قبول الطلب بنجاح');
  };

  const handleReject = (id) => {
    setOrders(orders.filter(order => order.id !== id));
    toast.success('تم رفض الطلب');
  };

  const handleComplete = (id) => {
    const order = orders.find(o => o.id === id);
    const newStatus = order.status === 'accepted' ? 'in_progress' : 'completed';
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
    toast.success(newStatus === 'in_progress' ? 'تم بدء العمل' : 'تم تأكيد الإنجاز');
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    accepted: orders.filter(o => o.status === 'accepted').length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <WorkerLayout title="الطلبات الواردة">
      <div className="page-header">
        <div className="page-header__title">الطلبات الواردة</div>
        <div className="page-header__sub">جميع طلبات العملاء التي تخص خدماتك</div>
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
              onReject={handleReject}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </WorkerLayout>
  );
}
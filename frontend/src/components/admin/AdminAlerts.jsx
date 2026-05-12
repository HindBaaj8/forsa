import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, Trash2, Bell, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import AdminToast from './AdminToast';
import { getAlerts, markAlertRead, deleteAlert } from '../../features/admin/adminSlice';

export default function AdminAlerts() {
  const dispatch = useDispatch();
  const { alerts, isLoading } = useSelector((state) => state.admin);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    dispatch(getAlerts());
  }, [dispatch]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMarkRead = async (id) => {
    await dispatch(markAlertRead(id));
    showToast('تم تحديد الإشعار كمقروء', 'info');
  };

  const handleDelete = async (id) => {
    await dispatch(deleteAlert(id));
    showToast('تم حذف الإشعار', 'error');
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertCircle size={20} />;
      case 'error': return <XCircle size={20} />;
      case 'success': return <CheckCircle size={20} />;
      default: return <Info size={20} />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'success': return '#10b981';
      default: return '#3b82f6';
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const unreadCount = alerts?.filter(a => !a.is_read).length || 0;

  return (
    <AdminLayout title="الإشعارات">
      <div className="page-header">
        <h1 className="page-header__title">الإشعارات والتنبيهات</h1>
        <p className="page-header__sub">جميع إشعارات النظام الهامة</p>
      </div>

      <div className="alerts-stats">
        <div className="alert-stat"><div className="alert-stat__num">{unreadCount}</div><div className="alert-stat__label">غير مقروءة</div></div>
        <div className="alert-stat"><div className="alert-stat__num">{alerts?.length || 0}</div><div className="alert-stat__label">الإجمالي</div></div>
      </div>

      <div className="alerts-list">
        {alerts?.length === 0 ? (
          <div className="empty-state"><Bell size={48} /><h3>لا توجد إشعارات</h3><p>ستظهر هنا إشعارات النظام الهامة</p></div>
        ) : (
          alerts?.map(alert => (
            <div key={alert.id} className={`alert-card ${!alert.is_read ? 'unread' : ''}`}>
              <div className="alert-card__icon" style={{ background: `${getAlertColor(alert.type)}15`, color: getAlertColor(alert.type) }}>{getAlertIcon(alert.type)}</div>
              <div className="alert-card__content">
                <div className="alert-card__title">{alert.title}</div>
                <div className="alert-card__message">{alert.message}</div>
                <div className="alert-card__time">{new Date(alert.created_at).toLocaleString('ar-MA')}</div>
              </div>
              <div className="alert-card__actions">
                {!alert.is_read && <button className="alert-action-btn" onClick={() => handleMarkRead(alert.id)}><Check size={14} /></button>}
                <button className="alert-action-btn delete" onClick={() => handleDelete(alert.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
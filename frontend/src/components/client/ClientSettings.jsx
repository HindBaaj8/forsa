import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Bell, Shield, CreditCard, LogOut, Trash2 } from 'lucide-react';
import ClientLayout from '../layout/ClientLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import Input from '../common/Input';
import Button from '../common/Button';
import { updateProfile, updateNotifications } from '../../features/client/clientSlice';
import { logout } from '../../features/auth/authSlice';
import { toast } from 'react-hot-toast';

export default function ClientSettings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.client);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '', city: '' });
  const [notifications, setNotifications] = useState({ requests: true, messages: true, offers: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setFormData({ first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '', phone: user.phone || '', city: user.city || '' });
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    await dispatch(updateProfile(formData));
    toast.success('تم تحديث المعلومات');
    setLoading(false);
  };

  const toggleNotif = async (key) => {
    const newSettings = { ...notifications, [key]: !notifications[key] };
    setNotifications(newSettings);
    await dispatch(updateNotifications(newSettings));
    toast.success('تم تحديث الإشعارات');
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <ClientLayout title="الإعدادات">
      <div className="settings-grid">
        <div className="card">
          <h3 className="card-title">المعلومات الشخصية</h3>
          <div className="form-row"><Input label="الاسم الأول" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} /><Input label="الاسم الأخير" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} /></div>
          <Input label="البريد الإلكتروني" type="email" value={formData.email} disabled />
          <div className="form-row"><Input label="رقم الهاتف" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /><Input label="المدينة" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} /></div>
          <Button variant="navy" onClick={handleSave} loading={loading}>حفظ التغييرات</Button>
        </div>

        <div>
          <div className="card"><h3 className="card-title">🔔 الإشعارات</h3>
            <div className="settings-row"><div><div className="settings-row__label">طلبات جديدة</div></div><button className={`toggle ${notifications.requests ? 'on' : ''}`} onClick={() => toggleNotif('requests')} /></div>
            <div className="settings-row"><div><div className="settings-row__label">الرسائل</div></div><button className={`toggle ${notifications.messages ? 'on' : ''}`} onClick={() => toggleNotif('messages')} /></div>
            <div className="settings-row"><div><div className="settings-row__label">عروض جديدة</div></div><button className={`toggle ${notifications.offers ? 'on' : ''}`} onClick={() => toggleNotif('offers')} /></div>
          </div>

          <div className="card">
            <h3 className="card-title">الإجراءات</h3>
            <Link to="/client/change-password" className="settings-row"><div className="settings-row__label"><Shield size={14} /> تغيير كلمة المرور</div><span>←</span></Link>
            <Link to="/client/payment-methods" className="settings-row"><div className="settings-row__label"><CreditCard size={14} /> طرق الدفع</div><span>←</span></Link>
            <button className="settings-row" onClick={() => dispatch(logout())}><div className="settings-row__label"><LogOut size={14} /> تسجيل الخروج</div><span>←</span></button>
            <button className="settings-row" style={{ color: 'var(--error)' }}><div className="settings-row__label"><Trash2 size={14} /> حذف الحساب</div><span>←</span></button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
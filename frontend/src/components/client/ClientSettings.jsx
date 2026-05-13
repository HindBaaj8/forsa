import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Bell, Shield, CreditCard, LogOut, Trash2 } from 'lucide-react';
import ClientLayout from '../layout/ClientLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import Input from '../common/Input';
import Button from '../common/Button';
import { updateProfile, updateNotifications } from '../../features/client/clientSlice';
import { logout, getCurrentUser, setUser } from '../../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import '../../styles/Dashboard.css';

export default function ClientSettings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.client);
  const [formData, setFormData] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    phone: '', 
    city: '' 
  });
  const [notifications, setNotifications] = useState({ 
    requests: true, 
    messages: true, 
    offers: false 
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ 
        first_name: user.first_name || '', 
        last_name: user.last_name || '', 
        email: user.email || '', 
        phone: user.phone || '', 
        city: user.city || '' 
      });
    }
  }, [user]);

  // 🔥🔥🔥 التحديث الرئيسي - يحدث الـ Sidebar تلقائياً 🔥🔥🔥
  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. تحديث الملف الشخصي
      const result = await dispatch(updateProfile(formData)).unwrap();
      
      // 2. تحديث localStorage
      const updatedUser = {
        ...user,
        ...formData
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // 3. تحديث Redux store (مهم جداً للـ Sidebar)
      if (dispatch(setUser)) {
        dispatch(setUser(updatedUser));
      }
      
      // 4. جلب أحدث البيانات من السيرفر
      await dispatch(getCurrentUser());
      
      // 5. عرض رسالة نجاح
      toast.success('تم تحديث المعلومات بنجاح');
      
      // 6. تحديث الصفحة لإعادة تحميل الـ Sidebar (اختياري)
      // window.dispatchEvent(new Event('storage'));
      
    } catch (error) {
      console.error('Update error:', error);
      toast.error('حدث خطأ أثناء التحديث');
    }
    setLoading(false);
  };

  const toggleNotif = async (key) => {
    const newSettings = { ...notifications, [key]: !notifications[key] };
    setNotifications(newSettings);
    try {
      await dispatch(updateNotifications(newSettings)).unwrap();
      toast.success('تم تحديث الإشعارات');
    } catch (error) {
      toast.error('حدث خطأ');
      // إرجاع التغيير إذا فشل
      setNotifications(notifications);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <ClientLayout title="الإعدادات">
      <div className="settings-grid">
        <div className="card">
          <h3 className="card-title">
            <User size={18} /> المعلومات الشخصية
          </h3>
          <div className="form-row">
            <Input 
              label="الاسم الأول" 
              value={formData.first_name} 
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} 
            />
            <Input 
              label="الاسم الأخير" 
              value={formData.last_name} 
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} 
            />
          </div>
          <Input 
            label="البريد الإلكتروني" 
            type="email" 
            value={formData.email} 
            disabled 
          />
          <div className="form-row">
            <Input 
              label="رقم الهاتف" 
              value={formData.phone} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
            />
            <Input 
              label="المدينة" 
              value={formData.city} 
              onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
            />
          </div>
          <Button variant="navy" onClick={handleSave} loading={loading}>
            حفظ التغييرات
          </Button>
        </div>

        <div>
          <div className="card">
            <h3 className="card-title">
              <Bell size={18} /> الإشعارات
            </h3>
            <div className="settings-row">
              <div>
                <div className="settings-row__label">طلبات جديدة</div>
                <div className="settings-row__desc">تنبيه عند نشر طلب جديد</div>
              </div>
              <button 
                className={`toggle ${notifications.requests ? 'on' : ''}`} 
                onClick={() => toggleNotif('requests')} 
              />
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-row__label">الرسائل</div>
                <div className="settings-row__desc">تنبيه عند استلام رسالة جديدة</div>
              </div>
              <button 
                className={`toggle ${notifications.messages ? 'on' : ''}`} 
                onClick={() => toggleNotif('messages')} 
              />
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-row__label">عروض جديدة</div>
                <div className="settings-row__desc">تنبيه عند استلام عرض جديد</div>
              </div>
              <button 
                className={`toggle ${notifications.offers ? 'on' : ''}`} 
                onClick={() => toggleNotif('offers')} 
              />
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">الإجراءات</h3>
            <Link to="/client/change-password" className="settings-row">
              <div className="settings-row__label">
                <Shield size={14} /> تغيير كلمة المرور
              </div>
              <span>←</span>
            </Link>
            <Link to="/client/payment-methods" className="settings-row">
              <div className="settings-row__label">
                <CreditCard size={14} /> طرق الدفع
              </div>
              <span>←</span>
            </Link>
            <button className="settings-row" onClick={() => dispatch(logout())}>
              <div className="settings-row__label">
                <LogOut size={14} /> تسجيل الخروج
              </div>
              <span>←</span>
            </button>
            <button className="settings-row" style={{ color: 'var(--error)' }}>
              <div className="settings-row__label">
                <Trash2 size={14} /> حذف الحساب
              </div>
              <span>←</span>
            </button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
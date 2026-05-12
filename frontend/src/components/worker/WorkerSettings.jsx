import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Bell, Shield, CreditCard, LogOut, Trash2, DollarSign } from 'lucide-react';
import WorkerLayout from '../layout/WorkerLayout';
import { logout } from '../../features/auth/authSlice';
import { toast } from 'react-hot-toast';

export default function WorkerSettings() {
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState({ new_orders: true, messages: true, newsletter: false });

  const toggleNotif = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
    toast.success('تم تحديث الإشعارات');
  };

  return (
    <WorkerLayout title="الإعدادات">
      <div className="settings-grid">
        <div className="card"><h3 className="card-title"><Bell size={18} /> الإشعارات</h3>
          <div className="settings-row"><div><div className="settings-row__label">طلبات جديدة</div></div><button className={`toggle ${notifications.new_orders ? 'on' : ''}`} onClick={() => toggleNotif('new_orders')} /></div>
          <div className="settings-row"><div><div className="settings-row__label">الرسائل</div></div><button className={`toggle ${notifications.messages ? 'on' : ''}`} onClick={() => toggleNotif('messages')} /></div>
          <div className="settings-row"><div><div className="settings-row__label">النشرة البريدية</div></div><button className={`toggle ${notifications.newsletter ? 'on' : ''}`} onClick={() => toggleNotif('newsletter')} /></div>
        </div>

        <div className="card"><h3 className="card-title"><Shield size={18} /> الأمان</h3>
          <Link to="/worker/change-password" className="settings-row"><div className="settings-row__label">🔒 تغيير كلمة المرور</div><span>←</span></Link>
          <div className="settings-row"><div><div className="settings-row__label">التحقق بخطوتين (2FA)</div></div><button className="toggle" /></div>
        </div>

        <div className="card"><h3 className="card-title"><DollarSign size={18} /> الدفع والسحب</h3>
          <Link to="/worker/payment-methods" className="settings-row"><div className="settings-row__label">طرق الدفع</div><span>←</span></Link>
          <div className="settings-row"><div><div className="settings-row__label">الحد الأدنى للسحب</div></div><span className="settings-row__value">500 درهم</span></div>
        </div>

        <div className="card"><h3 className="card-title">الإجراءات</h3>
          <button className="settings-row" onClick={() => dispatch(logout())}><div className="settings-row__label"><LogOut size={14} /> تسجيل الخروج</div><span>←</span></button>
          <button className="settings-row" style={{ color: 'var(--error)' }}><div className="settings-row__label"><Trash2 size={14} /> حذف الحساب</div><span>←</span></button>
        </div>
      </div>
    </WorkerLayout>
  );
}
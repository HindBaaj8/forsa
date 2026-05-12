import React, { useState } from 'react';
import AdminLayout from '../layout/AdminLayout';
import AdminToast from './AdminToast';

export default function AdminSettings() {
  const [toast, setToast] = useState(null);
  const [settings, setSettings] = useState({
    site_name: 'فرصة عمل',
    site_email: 'admin@forsa.ma',
    commission_rate: 10,
    min_withdrawal: 500,
    enable_notifications: true,
    enable_email_verification: true,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    // Save settings logic
    showToast('تم حفظ الإعدادات', 'success');
  };

  return (
    <AdminLayout title="الإعدادات">
      <div className="page-header">
        <h1 className="page-header__title">إعدادات المنصة</h1>
        <p className="page-header__sub">تخصيص إعدادات الموقع والعمولة</p>
      </div>

      <div className="settings-form">
        <div className="card">
          <h3 className="card-title">الإعدادات العامة</h3>
          <div className="form-group">
            <label className="form-label">اسم الموقع</label>
            <input className="form-input" value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني الرسمي</label>
            <input className="form-input" type="email" value={settings.site_email} onChange={(e) => setSettings({ ...settings, site_email: e.target.value })} />
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">الإعدادات المالية</h3>
          <div className="form-group">
            <label className="form-label">نسبة العمولة (%)</label>
            <input className="form-input" type="number" value={settings.commission_rate} onChange={(e) => setSettings({ ...settings, commission_rate: e.target.value })} />
            <span className="form-hint">النسبة التي تستقطعها المنصة من كل صفقة</span>
          </div>
          <div className="form-group">
            <label className="form-label">الحد الأدنى للسحب (درهم)</label>
            <input className="form-input" type="number" value={settings.min_withdrawal} onChange={(e) => setSettings({ ...settings, min_withdrawal: e.target.value })} />
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">إعدادات النظام</h3>
          <div className="settings-row">
            <div><div className="settings-row__label">تفعيل الإشعارات</div><div className="settings-row__sub">إرسال إشعارات للمستخدمين</div></div>
            <button className={`toggle ${settings.enable_notifications ? 'on' : ''}`} onClick={() => setSettings({ ...settings, enable_notifications: !settings.enable_notifications })} />
          </div>
          <div className="settings-row">
            <div><div className="settings-row__label">التحقق بالبريد الإلكتروني</div><div className="settings-row__sub">طلب تأكيد البريد عند التسجيل</div></div>
            <button className={`toggle ${settings.enable_email_verification ? 'on' : ''}`} onClick={() => setSettings({ ...settings, enable_email_verification: !settings.enable_email_verification })} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn btn--ghost">إلغاء</button>
          <button className="btn btn--navy" onClick={handleSave}>حفظ التغييرات</button>
        </div>
      </div>

      {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
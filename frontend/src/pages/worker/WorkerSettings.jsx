// pages/worker/WorkerSettings.jsx
import WorkerLayout from '../../components/layout/WorkerLayout';

export default function WorkerSettings() {
  return (
    <WorkerLayout title="الإعدادات">
      <div className="page-header">
        <div className="page-header__title">الإعدادات</div>
        <div className="page-header__sub">إعدادات الحساب والإشعارات</div>
      </div>
      <div className="settings-grid">
        <div className="card">
          <div className="card-title">🔔 الإشعارات</div>
          <div className="settings-row">
            <div className="settings-row__label">إشعارات الطلبات الجديدة</div>
            <button className="toggle-wrap on" />
          </div>
          <div className="settings-row">
            <div className="settings-row__label">إشعارات الرسائل</div>
            <button className="toggle-wrap on" />
          </div>
          <div className="settings-row">
            <div className="settings-row__label">عروض وتخفيضات</div>
            <button className="toggle-wrap" />
          </div>
          <div className="settings-row">
            <div className="settings-row__label">النشرة البريدية</div>
            <button className="toggle-wrap" />
          </div>
        </div>
        
        <div className="card">
          <div className="card-title">🔒 الأمان</div>
          <div className="settings-row">
            <div className="settings-row__label">تغيير كلمة المرور</div>
            <span style={{ color: 'var(--text3)', fontSize: 18, cursor: 'pointer' }}>←</span>
          </div>
          <div className="settings-row">
            <div className="settings-row__label">التحقق بخطوتين (2FA)</div>
            <button className="toggle-wrap" />
          </div>
          <div className="settings-row">
            <div className="settings-row__label">الأجهزة المتصلة</div>
            <span style={{ color: 'var(--text3)', fontSize: 18, cursor: 'pointer' }}>←</span>
          </div>
        </div>
        
        <div className="card">
          <div className="card-title">💰 الدفع والسحب</div>
          <div className="settings-row">
            <div className="settings-row__label">طرق الدفع</div>
            <span style={{ color: 'var(--text3)', fontSize: 18, cursor: 'pointer' }}>←</span>
          </div>
          <div className="settings-row">
            <div className="settings-row__label">سجل المعاملات</div>
            <span style={{ color: 'var(--text3)', fontSize: 18, cursor: 'pointer' }}>←</span>
          </div>
        </div>
      </div>
    </WorkerLayout>
  );
}
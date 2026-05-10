// pages/client/ClientSettings.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { updateProfile, updateNotifications } from '../../features/client/clientSlice';
import { logout } from '../../features/auth/authSlice';
import ClientLayout from '../../components/layout/ClientLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ClientSettings() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((state) => state.auth);
  const { notifications, isLoading } = useSelector((state) => state.client);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
  });

  const [notifSettings, setNotifSettings] = useState({
    requests: true,
    messages: true,
    offers: false,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name:  user.last_name  || '',
        email:      user.email      || '',
        phone:      user.phone      || '',
        city:       user.city       || '',
      });
    }
    if (notifications) setNotifSettings(notifications);
  }, [user, notifications]);

  const avatarInitial = (user?.first_name?.[0] || '؟').toUpperCase();

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await dispatch(updateProfile(formData)).unwrap();
      toast.success('تم تحديث المعلومات الشخصية بنجاح');
      // تحديث الـ user في localStorage
      if (result.user) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, ...result.user }));
      }
    } catch (err) {
      toast.error(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotif = async (key) => {
    const newSettings = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(newSettings);
    try {
      await dispatch(updateNotifications(newSettings)).unwrap();
      toast.success('تم تحديث إعدادات الإشعارات');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // استدعاء API حذف الحساب (إذا كان متوفراً)
      await api.delete('/user/account');
      toast.success('تم حذف الحساب بنجاح');
    } catch (err) {
      console.error('Delete account error:', err);
    } finally {
      dispatch(logout());
      navigate('/auth?mode=login');
      setLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <ClientLayout title="الإعدادات">
      <div className="settings-grid">

        {/* Profile Form */}
        <div className="card">
          <div className="card-title">المعلومات الشخصية</div>

          {/* Avatar + Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--n700), var(--n500))',
              color: '#fff', fontSize: 24, fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {avatarInitial}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text1)' }}>
                {user?.first_name || ''} {user?.last_name || ''}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>
                {user?.email || ''}
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div className="form-group">
                <label className="form-label">الاسم الأول</label>
                <input
                  className="form-input"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="أحمد"
                />
              </div>
              <div className="form-group">
                <label className="form-label">الاسم الأخير</label>
                <input
                  className="form-input"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="العلوي"
                />
              </div>
              <div className="form-group">
                <label className="form-label">رقم الهاتف</label>
                <input
                  className="form-input"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0612345678"
                />
              </div>
              <div className="form-group">
                <label className="form-label">المدينة</label>
                <input
                  className="form-input"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="الدار البيضاء"
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">البريد الإلكتروني</label>
                <input
                  className="form-input"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  disabled
                />
                <span className="form-hint">البريد الإلكتروني لا يمكن تغييره</span>
              </div>
            </div>
            <button className="btn btn--navy" type="submit" disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </form>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Notifications */}
          <div className="card">
            <div className="card-title">🔔 الإشعارات</div>
            {[
              { key: 'requests', label: 'طلبات جديدة' },
              { key: 'messages', label: 'الرسائل' },
              { key: 'offers',   label: 'عروض جديدة' },
            ].map(({ key, label }) => (
              <div key={key} className="settings-row">
                <div className="settings-row__label">{label}</div>
                <button
                  type="button"
                  className={`toggle-wrap${notifSettings[key] ? ' on' : ''}`}
                  onClick={() => toggleNotif(key)}
                />
              </div>
            ))}
          </div>

          {/* Actions Card */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

            {/* تغيير كلمة المرور */}
            <Link
              to="/client/change-password"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', textDecoration: 'none',
                borderBottom: '1px solid var(--gray100)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--n50)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text1)' }}>
                🔒 تغيير كلمة المرور
              </span>
              <span style={{ color: 'var(--text3)', fontSize: 18 }}>←</span>
            </Link>

            {/* طرق الدفع */}
            <Link
              to="/client/payment-methods"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', textDecoration: 'none',
                borderBottom: '1px solid var(--gray100)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--n50)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text1)' }}>
                💳 طرق الدفع
              </span>
              <span style={{ color: 'var(--text3)', fontSize: 18 }}>←</span>
            </Link>

            {/* حذف الحساب */}
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'right',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--error)' }}>
                🗑️ حذف الحساب
              </span>
              <span style={{ color: 'var(--error)', fontSize: 18 }}>←</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--error)' }}>🗑️ حذف الحساب</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text2)', margin: '16px 0 24px', lineHeight: 1.6 }}>
              هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه وستفقد جميع بياناتك.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn--ghost" onClick={() => setShowDeleteModal(false)}>
                إلغاء
              </button>
              <button
                className="btn"
                style={{ background: 'var(--error)', color: '#fff' }}
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? 'جاري الحذف...' : 'نعم، احذف حسابي'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}
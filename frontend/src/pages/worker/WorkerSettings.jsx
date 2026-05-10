// pages/worker/WorkerSettings.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { updateWorkerNotifications, updateWorkerSettings } from '../../features/worker/workerSlice';
import { logout } from '../../features/auth/authSlice';
import WorkerLayout from '../../components/layout/WorkerLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function WorkerSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.worker);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [notifSettings, setNotifSettings] = useState({
    new_orders: true,
    messages: true,
    offers: false,
    newsletter: false,
  });

  const [twoFA, setTwoFA] = useState(false);

  useEffect(() => {
    // Load saved settings from API
    const loadSettings = async () => {
      try {
        const response = await api.get('/worker/settings');
        if (response.data) {
          setNotifSettings(response.data.notifications || notifSettings);
          setTwoFA(response.data.two_factor || false);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  const toggleNotif = async (key) => {
    const newSettings = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(newSettings);
    try {
      await dispatch(updateWorkerNotifications(newSettings)).unwrap();
      toast.success('تم تحديث إعدادات الإشعارات');
    } catch (error) {
      toast.error('حدث خطأ');
      // Revert on error
      setNotifSettings(notifSettings);
    }
  };

  const toggleTwoFA = async () => {
    setTwoFA(!twoFA);
    try {
      await api.put('/worker/settings/two-factor', { enabled: !twoFA });
      toast.success(!twoFA ? 'تم تفعيل التحقق بخطوتين' : 'تم إلغاء التحقق بخطوتين');
    } catch (error) {
      toast.error('حدث خطأ');
      setTwoFA(twoFA);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await api.delete('/user/account');
      toast.success('تم حذف الحساب بنجاح');
      dispatch(logout());
      navigate('/auth?mode=login');
    } catch (error) {
      toast.error('حدث خطأ في حذف الحساب');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <WorkerLayout title="الإعدادات">
      <div className="page-header">
        <div className="page-header__title">الإعدادات</div>
        <div className="page-header__sub">إعدادات الحساب والإشعارات</div>
      </div>

      <div className="settings-grid">
        {/* Notifications Section */}
        <div className="card">
          <div className="card-title">🔔 الإشعارات</div>
          <div className="settings-row">
            <div className="settings-row__label">إشعارات الطلبات الجديدة</div>
            <button 
              className={`toggle-wrap ${notifSettings.new_orders ? 'on' : ''}`}
              onClick={() => toggleNotif('new_orders')}
            />
          </div>
          <div className="settings-row">
            <div className="settings-row__label">إشعارات الرسائل</div>
            <button 
              className={`toggle-wrap ${notifSettings.messages ? 'on' : ''}`}
              onClick={() => toggleNotif('messages')}
            />
          </div>
          <div className="settings-row">
            <div className="settings-row__label">عروض وتخفيضات</div>
            <button 
              className={`toggle-wrap ${notifSettings.offers ? 'on' : ''}`}
              onClick={() => toggleNotif('offers')}
            />
          </div>
          <div className="settings-row">
            <div className="settings-row__label">النشرة البريدية</div>
            <button 
              className={`toggle-wrap ${notifSettings.newsletter ? 'on' : ''}`}
              onClick={() => toggleNotif('newsletter')}
            />
          </div>
        </div>
        
        {/* Security Section */}
        <div className="card">
          <div className="card-title">🔒 الأمان</div>
          <Link to="/worker/change-password" className="settings-row" style={{ textDecoration: 'none' }}>
            <div className="settings-row__label">🔒 تغيير كلمة المرور</div>
            <span style={{ color: 'var(--text3)', fontSize: 18 }}>←</span>
          </Link>
          <div className="settings-row">
            <div className="settings-row__label">التحقق بخطوتين (2FA)</div>
            <button 
              className={`toggle-wrap ${twoFA ? 'on' : ''}`}
              onClick={toggleTwoFA}
            />
          </div>
          <Link to="/worker/devices" className="settings-row" style={{ textDecoration: 'none' }}>
            <div className="settings-row__label">الأجهزة المتصلة</div>
            <span style={{ color: 'var(--text3)', fontSize: 18 }}>←</span>
          </Link>
        </div>
        
        {/* Payment Section */}
        <div className="card">
          <div className="card-title">💰 الدفع والسحب</div>
          <Link to="/worker/payment-methods" className="settings-row" style={{ textDecoration: 'none' }}>
            <div className="settings-row__label">طرق الدفع</div>
            <span style={{ color: 'var(--text3)', fontSize: 18 }}>←</span>
          </Link>
          <Link to="/worker/transactions" className="settings-row" style={{ textDecoration: 'none' }}>
            <div className="settings-row__label">سجل المعاملات</div>
            <span style={{ color: 'var(--text3)', fontSize: 18 }}>←</span>
          </Link>
          <div className="settings-row">
            <div className="settings-row__label">الحد الأدنى للسحب</div>
            <span style={{ color: 'var(--n700)', fontWeight: 700 }}>500 درهم</span>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ borderColor: 'var(--error)' }}>
          <div className="card-title" style={{ color: 'var(--error)' }}>⚠️ منطقة الخطر</div>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="settings-row" 
            style={{ 
              width: '100%', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              textAlign: 'right',
              color: 'var(--error)'
            }}
          >
            <div className="settings-row__label">🗑️ حذف الحساب</div>
            <span style={{ color: 'var(--error)', fontSize: 18 }}>←</span>
          </button>
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
              هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه وستفقد جميع بياناتك وأرباحك.
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
    </WorkerLayout>
  );
}
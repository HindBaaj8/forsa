// pages/worker/WorkerProfile.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateWorkerProfile } from '../../features/worker/workerSlice';
import WorkerLayout from '../../components/layout/WorkerLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function WorkerProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.worker);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    profession: '',
    experience: '',
    bio: '',
  });

  // Mock stats (will come from API later)
  const stats = {
    rating: 4.8,
    totalReviews: 156,
    completedOrders: 42,
  };

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        city: user.city || '',
        profession: user.profession || 'كهربائي معتمد',
        experience: user.experience || '5',
        bio: user.bio || 'متخصص في تركيب وصيانة جميع أنواع المكيفات والأنظمة الكهربائية',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(updateWorkerProfile(formData)).unwrap();
      toast.success('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      toast.error('حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <WorkerLayout title="الملف الشخصي">
      <div className="page-header">
        <div className="page-header__title">الملف الشخصي</div>
        <div className="page-header__sub">معلوماتك الشخصية والمهنية</div>
      </div>

      <div className="profile-grid">
        {/* Profile Card */}
        <div className="card profile-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div className="profile-avatar-large">
              {user?.first_name?.[0] || user?.last_name?.[0] || 'م'}
            </div>
            <div>
              <div className="profile-name">{user?.first_name} {user?.last_name}</div>
              <div className="profile-profession">{formData.profession}</div>
              <div className="profile-rating">
                ⭐ {stats.rating} ({stats.totalReviews} تقييم)
              </div>
            </div>
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat__num">{stats.completedOrders}</div>
              <div className="profile-stat__label">طلب مكتمل</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat__num">{stats.rating}</div>
              <div className="profile-stat__label">تقييم</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat__num">{stats.totalReviews}</div>
              <div className="profile-stat__label">تقييم</div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card">
          <div className="card-title">تعديل المعلومات الشخصية</div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">الاسم الأول</label>
                <input
                  type="text"
                  name="first_name"
                  className="form-input"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">الاسم الأخير</label>
                <input
                  type="text"
                  name="last_name"
                  className="form-input"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">البريد الإلكتروني</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
              />
              <span className="form-hint">البريد الإلكتروني لا يمكن تغييره</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">رقم الهاتف</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">المدينة</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">المهنة</label>
                <input
                  type="text"
                  name="profession"
                  className="form-input"
                  value={formData.profession}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">سنوات الخبرة</label>
                <input
                  type="number"
                  name="experience"
                  className="form-input"
                  value={formData.experience}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">وصف الخدمات</label>
              <textarea
                name="bio"
                className="form-input"
                rows="4"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn--ghost" onClick={() => window.history.back()}>
                إلغاء
              </button>
              <button type="submit" className="btn btn--navy" disabled={loading}>
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .profile-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
        }
        
        .profile-card {
          text-align: center;
          background: linear-gradient(135deg, var(--n800), var(--n600));
          color: white;
        }
        
        .profile-avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--g500), var(--g400));
          color: var(--n900);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          margin: 0 auto;
        }
        
        .profile-name {
          font-size: 18px;
          font-weight: 800;
          margin-top: 12px;
        }
        
        .profile-profession {
          font-size: 13px;
          color: rgba(255,255,255,0.8);
          margin-top: 4px;
        }
        
        .profile-rating {
          font-size: 13px;
          color: var(--g400);
          margin-top: 8px;
        }
        
        .profile-stats {
          display: flex;
          justify-content: space-around;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        
        .profile-stat__num {
          font-size: 22px;
          font-weight: 900;
        }
        
        .profile-stat__label {
          font-size: 11px;
          color: rgba(255,255,255,0.6);
          margin-top: 4px;
        }
        
        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </WorkerLayout>
  );
}
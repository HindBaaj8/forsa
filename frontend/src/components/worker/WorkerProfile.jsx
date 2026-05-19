// components/worker/WorkerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Camera, Star, Briefcase, MapPin, Phone, Mail, User } from 'lucide-react';
import WorkerLayout from '../layout/WorkerLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import { updateWorkerProfile } from '../../features/worker/workerSlice';
import { updateUser } from '../../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import '../../styles/Dashboard.css';
export default function WorkerProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.worker);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const [formData, setFormData] = useState({ 
    first_name: '', 
    last_name: '', 
    phone: '', 
    city: '', 
    profession: '', 
    experience: 0, 
    bio: '' 
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        city: user.city || '',
        profession: user.profession || 'مهني',
        experience: user.experience || 0,
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ تأكد من وجود handleSave
  const handleSave = async () => {
    setLoading(true);
    
    const payload = {
      first_name: formData.first_name || null,
      last_name: formData.last_name || null,
      phone: formData.phone || null,
      city: formData.city || null,
      profession: formData.profession || null,
      experience: formData.experience ? Number(formData.experience) : 0,
      bio: formData.bio || null,
    };
    
    let dataToSend = payload;
    
    if (selectedFile) {
      const formDataToSend = new FormData();
      Object.keys(payload).forEach(key => {
        if (payload[key] !== null && payload[key] !== '') {
          formDataToSend.append(key, payload[key]);
        }
      });
      formDataToSend.append('avatar', selectedFile);
      dataToSend = formDataToSend;
    }
    
    try {
      const result = await dispatch(updateWorkerProfile(dataToSend)).unwrap();
      
      const updatedUser = result.data || result;
      if (updatedUser) {
        dispatch(updateUser(updatedUser));
        
        setFormData({
          first_name: updatedUser.first_name || '',
          last_name: updatedUser.last_name || '',
          phone: updatedUser.phone || '',
          city: updatedUser.city || '',
          profession: updatedUser.profession || 'مهني',
          experience: updatedUser.experience || 0,
          bio: updatedUser.bio || '',
        });
      }
      
      setSelectedFile(null);
      setPreview(null);
      
      toast.success('تم تحديث الملف الشخصي بنجاح');
      
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error || 'حدث خطأ أثناء التحديث');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <WorkerLayout title="الملف الشخصي">
      <div className="profile-grid">
        {/* Sidebar Left - Profile Info */}
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="profile-avatar-large">
              {preview ? (
                <img src={preview} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : user?.avatar ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                user?.first_name?.[0] || user?.last_name?.[0] || 'م'
              )}
            </div>
            <label className="profile-avatar-upload">
              <Camera size={16} />
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>
          
          <div className="profile-name">{user?.first_name} {user?.last_name}</div>
          <div className="profile-profession">{formData.profession || 'مهني'}</div>
          
          <div className="profile-rating">
            <Star size={14} className="text-gold" /> 
            <span>{user?.rating || 0}</span>
            <span className="text-muted">({user?.total_reviews || 0} تقييم)</span>
          </div>
          
          <div className="profile-stats">
            <div>
              <div className="profile-stat__num">{user?.completed_orders || 0}</div>
              <div className="profile-stat__label">طلب مكتمل</div>
            </div>
            <div>
              <div className="profile-stat__num">{formData.experience || 0}</div>
              <div className="profile-stat__label">سنوات الخبرة</div>
            </div>
          </div>
          
          <div className="profile-contact">
            <div className="profile-contact-item">
              <Mail size={14} />
              <span>{user?.email}</span>
            </div>
            {formData.phone && (
              <div className="profile-contact-item">
                <Phone size={14} />
                <span>{formData.phone}</span>
              </div>
            )}
            {formData.city && (
              <div className="profile-contact-item">
                <MapPin size={14} />
                <span>{formData.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Edit Form */}
        <div className="profile-form">
          <div className="card">
            <h3 className="card-title">
              <User size={18} />
              المعلومات الشخصية
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">الاسم الأول</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.first_name} 
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} 
                  placeholder="أدخل الاسم الأول"
                />
              </div>
              <div className="form-group">
                <label className="form-label">الاسم الأخير</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.last_name} 
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} 
                  placeholder="أدخل الاسم الأخير"
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
                  className="form-input" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                  placeholder="0612345678"
                />
              </div>
              <div className="form-group">
                <label className="form-label">المدينة</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.city} 
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
                  placeholder="الدار البيضاء"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">المهنة</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.profession} 
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })} 
                  placeholder="كهربائي، سباك، مصمم..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">سنوات الخبرة</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={formData.experience} 
                  onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })} 
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">نبذة عني</label>
              <textarea 
                className="form-input" 
                rows="5" 
                value={formData.bio} 
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })} 
                placeholder="وصف خبراتك ومهاراتك وإنجازاتك..."
              />
            </div>

            <div className="profile-actions">
              <Button variant="ghost" onClick={() => window.history.back()}>
                إلغاء
              </Button>
              <Button variant="navy" onClick={handleSave} loading={loading}>
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .profile-contact {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--gray200);
        }
        
        .profile-contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--text3);
          margin-bottom: 10px;
          padding: 6px 0;
          word-break: break-all;
        }
        
        .profile-contact-item svg {
          flex-shrink: 0;
          color: var(--g500);
        }
        
        .profile-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid var(--gray200);
        }
        
        .text-gold {
          color: var(--g500);
        }
        
        .text-muted {
          color: var(--text3);
        }
        
        @media (max-width: 992px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
          
          .profile-sidebar {
            order: 2;
          }
          
          .profile-form {
            order: 1;
          }
          
          .profile-actions {
            flex-direction: column;
          }
          
          .profile-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </WorkerLayout>
  );
}
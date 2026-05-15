import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Bell, Shield, CreditCard, LogOut, Trash2, Camera, X } from 'lucide-react';
import ClientLayout from '../layout/ClientLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import Input from '../common/Input';
import Button from '../common/Button';
import { updateProfile, updateNotifications } from '../../features/client/clientSlice';
import { logout, getCurrentUser, setUser } from '../../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
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
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [notifications, setNotifications] = useState({ 
    requests: true, 
    messages: true, 
    offers: false 
  });
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ 
        first_name: user.first_name || '', 
        last_name: user.last_name || '', 
        email: user.email || '', 
        phone: user.phone || '', 
        city: user.city || '' 
      });
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  // ✅ معالجة اختيار الصورة
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // التحقق من حجم الصورة (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن لا يتجاوز 2 ميجابايت');
        return;
      }
      
      // التحقق من نوع الصورة
      if (!file.type.startsWith('image/')) {
        toast.error('الرجاء اختيار ملف صورة صالح');
        return;
      }
      
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // ✅ رفع الصورة إلى السيرفر
  const uploadAvatar = async () => {
    if (!avatar) return null;
    
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', avatar);
    
    try {
      const response = await api.post('/upload/avatar', formData);
      return response.data.avatar_url;
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('فشل رفع الصورة');
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ✅ حذف الصورة
  const handleRemoveAvatar = async () => {
    try {
      await api.delete('/upload/avatar');
      setAvatar(null);
      setAvatarPreview(null);
      // تحديث localStorage
      const updatedUser = { ...user, avatar: null };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch(setUser(updatedUser));
      toast.success('تم حذف الصورة بنجاح');
    } catch (error) {
      toast.error('فشل حذف الصورة');
    }
  };

  // ✅ التحديث الرئيسي
  const handleSave = async () => {
    setLoading(true);
    try {
      let avatarUrl = user?.avatar;
      
      // رفع الصورة إذا وجدت
      if (avatar) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }
      
      // تحضير البيانات للتحديث
      const updateData = {
        ...formData,
        avatar: avatarUrl
      };
      
      // 1. تحديث الملف الشخصي
      await dispatch(updateProfile(updateData)).unwrap();
      
      // 2. تحديث localStorage
      const updatedUser = {
        ...user,
        ...formData,
        avatar: avatarUrl
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // 3. تحديث Redux store
      dispatch(setUser(updatedUser));
      
      // 4. جلب أحدث البيانات من السيرفر
      await dispatch(getCurrentUser());
      
      // 5. عرض رسالة نجاح
      toast.success('تم تحديث المعلومات بنجاح');
      
      // إعادة تعيين حالة الصورة
      setAvatar(null);
      
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
      setNotifications(notifications);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <ClientLayout title="الإعدادات">
      <div className="settings-grid">
        {/* قسم الصورة الشخصية */}
        <div className="card">
          <h3 className="card-title">
            <Camera size={18} /> الصورة الشخصية
          </h3>
          <div className="avatar-section">
            <div className="avatar-container">
              <div className="avatar-preview">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="avatar-image" />
                ) : (
                  <div className="avatar-placeholder">
                    {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                  </div>
                )}
                <label className="avatar-upload-btn">
                  <Camera size={20} />
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />
                </label>
                {avatarPreview && (
                  <button className="avatar-remove-btn" onClick={handleRemoveAvatar}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            <p className="avatar-hint">
              الصور المدعومة: JPG, PNG, GIF (حد أقصى 2MB)
            </p>
          </div>
        </div>

        {/* قسم المعلومات الشخصية */}
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
          {/* قسم الإشعارات */}
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

          {/* قسم الإجراءات */}
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

      <style>{`
        .avatar-section {
          text-align: center;
          padding: 10px;
        }
        
        .avatar-container {
          display: flex;
          justify-content: center;
          margin-bottom: 15px;
        }
        
        .avatar-preview {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: bold;
          color: #fff;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .avatar-upload-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          background: #3498db;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: all 0.3s;
        }
        
        .avatar-upload-btn:hover {
          background: #2980b9;
        }
        
        .avatar-upload-btn input {
          display: none;
        }
        
        .avatar-remove-btn {
          position: absolute;
          top: 0;
          right: 0;
          background: #e74c3c;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          border: none;
          transition: all 0.3s;
        }
        
        .avatar-remove-btn:hover {
          background: #c0392b;
        }
        
        .avatar-hint {
          font-size: 12px;
          color: #999;
          margin: 0;
        }
        
        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 24px;
        }
        
        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .card-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #f0f0f0;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .settings-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          width: 100%;
          background: none;
          border: none;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .settings-row__label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
        }
        
        .toggle {
          width: 44px;
          height: 24px;
          background: #ccc;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: all 0.3s;
        }
        
        .toggle.on {
          background: #3498db;
        }
        
        .toggle::after {
          content: '';
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: all 0.3s;
        }
        
        .toggle.on::after {
          left: 22px;
        }
      `}</style>
    </ClientLayout>
  );
}
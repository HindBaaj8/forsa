// pages/client/ChangePassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import ClientLayout from '../../components/layout/ClientLayout';
import api from '../../services/api';

export default function ChangePassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.current_password) {
      newErrors.current_password = 'كلمة المرور الحالية مطلوبة';
    }
    
    if (!formData.new_password) {
      newErrors.new_password = 'كلمة المرور الجديدة مطلوبة';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'كلمتا المرور غير متطابقتين';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      // ✅ استدعاء API حقيقي
      const response = await api.post('/user/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password,
        new_password_confirmation: formData.confirm_password,
      });
      
      toast.success('تم تغيير كلمة المرور بنجاح');
      navigate('/client/settings');
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ';
      if (message.includes('current')) {
        setErrors({ current_password: 'كلمة المرور الحالية غير صحيحة' });
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout title="تغيير كلمة المرور">
      <div className="change-password-page">
        <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
          <div className="card-title" style={{ marginBottom: 24 }}>
            🔒 تغيير كلمة المرور
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Current Password */}
            <div className="form-group">
              <label className="form-label">كلمة المرور الحالية *</label>
              <div className="field-wrap">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="current_password"
                  className={`form-input ${errors.current_password ? 'err' : ''}`}
                  value={formData.current_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="field-eye"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.current_password && (
                <span className="form-err">{errors.current_password}</span>
              )}
            </div>
            
            {/* New Password */}
            <div className="form-group">
              <label className="form-label">كلمة المرور الجديدة *</label>
              <div className="field-wrap">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="new_password"
                  className={`form-input ${errors.new_password ? 'err' : ''}`}
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="•••••••• (8 أحرف على الأقل)"
                />
                <button
                  type="button"
                  className="field-eye"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.new_password && (
                <span className="form-err">{errors.new_password}</span>
              )}
              {!errors.new_password && formData.new_password.length >= 8 && (
                <span className="form-hint">✓ كلمة مرور قوية</span>
              )}
            </div>
            
            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">تأكيد كلمة المرور الجديدة *</label>
              <div className="field-wrap">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm_password"
                  className={`form-input ${errors.confirm_password ? 'err' : ''}`}
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="field-eye"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirm_password && (
                <span className="form-err">{errors.confirm_password}</span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => navigate('/client/settings')}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="btn btn--navy"
                disabled={loading}
              >
                {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style>{`
        .change-password-page {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .change-password-page .field-wrap {
          position: relative;
        }
        
        .change-password-page .field-eye {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          color: var(--text3);
        }
        
        .change-password-page .form-input {
          padding-left: 45px;
        }
        
        @media (max-width: 768px) {
          .change-password-page {
            padding: 16px;
          }
        }
      `}</style>
    </ClientLayout>
  );
}
// pages/ResetPassword.jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/reset-password', {
        email,
        token,
        password,
        password_confirmation: confirmPassword
      });
      
      toast.success('تم تغيير كلمة المرور بنجاح');
      navigate('/auth');
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="forgot-container">
        <div className="forgot-card">
          <div className="forgot-icon">⚠️</div>
          <h2>رابط غير صالح</h2>
          <p>الرابط الذي استخدمته غير صالح أو منتهي الصلاحية</p>
          <button className="btn-submit" onClick={() => navigate('/forgot-password')}>
            طلب رابط جديد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <button className="back-btn" onClick={() => navigate('/auth')}>
          <ArrowLeft size={16} /> رجوع
        </button>
        
        <div className="forgot-icon">🔑</div>
        <h2>إعادة تعيين كلمة المرور</h2>
        <p>أدخل كلمة المرور الجديدة</p>
        <p className="reset-email">{email}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">كلمة المرور الجديدة</label>
            <div className="field-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button type="button" className="field-eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">تأكيد كلمة المرور</label>
            <div className="field-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'جاري...' : 'تغيير كلمة المرور'}
          </button>
        </form>
      </div>
    </div>
  );
}
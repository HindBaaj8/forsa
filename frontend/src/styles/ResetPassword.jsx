// components/auth/ResetPassword.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react';
import { resetPassword } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
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
      await dispatch(resetPassword({ email, token, password, password_confirmation: confirmPassword })).unwrap();
      toast.success('تم تغيير كلمة المرور بنجاح');
      navigate('/auth?mode=login');
    } catch (error) {
      toast.error(error || 'فشل تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="error-container">
        <h2>رابط غير صالح</h2>
        <p>الرابط الذي استخدمته غير صالح أو منتهي الصلاحية.</p>
        <button onClick={() => navigate('/auth?mode=forgot')} className="btn-submit">
          طلب رابط جديد
        </button>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <button className="back-button" onClick={() => navigate('/auth')}>
        <ArrowLeft size={16} /> رجوع
      </button>
      
      <div className="reset-icon">
        <KeyRound size={48} />
      </div>
      
      <h2>إعادة تعيين كلمة المرور</h2>
      <p>أدخل كلمة المرور الجديدة لحسابك</p>
      <p className="reset-email">{email}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">كلمة المرور الجديدة</label>
          <div className="field-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className="field-eye" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <span className="form-hint">يجب أن تكون 8 أحرف على الأقل</span>
        </div>
        
        <div className="form-group">
          <label className="form-label">تأكيد كلمة المرور</label>
          <div className="field-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
        
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? <span className="spinner" /> : 'تغيير كلمة المرور'}
        </button>
      </form>
    </div>
  );
}
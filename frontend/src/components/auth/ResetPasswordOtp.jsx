// src/components/auth/ResetPasswordOtp.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function ResetPasswordOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('📧 Reset password for email:', email);
    if (!email) {
      toast.error('الرجاء إدخال البريد الإلكتروني أولاً');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/auth/password/otp/reset', {
        email,
        password,
        password_confirmation: confirmPassword
      });
      
      console.log('Reset response:', response.data);
      
      if (response.data.success) {
        toast.success('تم تغيير كلمة المرور بنجاح');
        navigate('/auth');
      } else {
        toast.error(response.data.message || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error:', error.response?.data);
      toast.error(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <button className="back-btn" onClick={() => navigate('/verify-otp')}>
          <ArrowLeft size={16} /> رجوع
        </button>
        <div className="forgot-icon">🔑</div>
        <h2>كلمة مرور جديدة</h2>
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
            <span className="form-hint">يجب أن تكون 8 أحرف على الأقل</span>
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
            {loading ? <span className="spinner" /> : 'تغيير كلمة المرور'}
          </button>
        </form>
      </div>
    </div>
  );
}
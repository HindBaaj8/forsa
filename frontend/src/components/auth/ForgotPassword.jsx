// src/components/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('الرجاء إدخال البريد الإلكتروني');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.post('/forgot-password', { email });
      setSent(true);
      toast.success('تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني');
    } catch (error) {
      toast.error(error.response?.data?.message || 'البريد الإلكتروني غير موجود');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="forgot-container">
        <div className="forgot-card">
          <div className="forgot-icon">📧</div>
          <h2>تم إرسال الرابط</h2>
          <p>تم إرسال رابط إعادة تعيين كلمة المرور إلى</p>
          <p className="forgot-email">{email}</p>
          <button className="btn-submit" onClick={() => navigate('/auth')}>
            العودة إلى تسجيل الدخول
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
        
        <div className="forgot-icon">🔐</div>
        <h2>نسيت كلمة المرور؟</h2>
        <p>أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <div className="field-wrap">
              <Mail size={16} className="field-icon" />
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'إرسال رابط إعادة التعيين'}
          </button>
        </form>
      </div>
    </div>
  );
}
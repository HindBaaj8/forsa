// src/components/auth/RequestOtpReset.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { Mail, ArrowLeft } from 'lucide-react';

export default function RequestOtpReset() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('الرجاء إدخال البريد الإلكتروني');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/auth/password/otp/request', { email });
      console.log('Response:', response.data);
      
      if (response.data.success) {
        toast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
        // ✅ تأكد من المسار: /verify-otp وليس /verify-otp?email=xxx
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
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
        <button className="back-btn" onClick={() => navigate('/auth')}>
          <ArrowLeft size={16} /> رجوع
        </button>
        <div className="forgot-icon">🔐</div>
        <h2>نسيت كلمة المرور؟</h2>
        <p>أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق</p>
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
            {loading ? <span className="spinner" /> : 'إرسال رمز التحقق'}
          </button>
        </form>
      </div>
    </div>
  );
}
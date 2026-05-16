// src/components/auth/VerifyOtp.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { ArrowLeft } from 'lucide-react';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('📧 Email from URL:', email); // ✅ شوفي الإيميل
    if (!email) {
      toast.error('الرجاء إدخال البريد الإلكتروني أولاً');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('الرجاء إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/auth/password/otp/verify', { 
        email, 
        otp: otpCode 
      });
      
      console.log('Verify response:', response.data);
      
      if (response.data.success) {
        toast.success('تم التحقق بنجاح');
        navigate(`/reset-password-otp?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(response.data.message || 'رمز غير صحيح');
      }
    } catch (error) {
      console.error('Error:', error.response?.data);
      toast.error(error.response?.data?.message || 'رمز غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <button className="back-btn" onClick={() => navigate('/forgot-password')}>
          <ArrowLeft size={16} /> رجوع
        </button>
        <div className="forgot-icon">📧</div>
        <h2>تحقق من بريدك</h2>
        <p className="reset-email">{email}</p>
        <p style={{ textAlign: 'center', marginBottom: 20 }}>أدخل رمز التحقق المكون من 6 أرقام</p>
        
        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              className="otp-input"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              autoFocus={index === 0}
            />
          ))}
        </div>
        
        <button className="btn-submit" onClick={handleVerify} disabled={loading}>
          {loading ? <span className="spinner" /> : 'تأكيد'}
        </button>
      </div>
    </div>
  );
}
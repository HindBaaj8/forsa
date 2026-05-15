// src/components/auth/OtpLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { Mail, ArrowLeft } from 'lucide-react';

export default function OtpLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/send-otp', { email });
      toast.success('تم إرسال رمز التحقق');
      setStep('otp');
      startTimer();
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('الرجاء إدخال الرمز الكامل');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/verify-otp', { email, otp: otpCode });
      const response = await api.post('/login-with-otp', { email });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('تم تسجيل الدخول بنجاح');
      
      if (user.role === 'client') window.location.href = '/client';
      else if (user.role === 'worker') window.location.href = '/worker';
      else if (user.role === 'admin') window.location.href = '/admin';
      else window.location.href = '/';
    } catch (error) {
      toast.error(error.response?.data?.message || 'رمز غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await api.post('/send-otp', { email });
      toast.success('تم إعادة إرسال الرمز');
      startTimer();
    } catch (error) {
      toast.error('حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  if (step === 'otp') {
    return (
      <div className="otp-container">
        <div className="otp-card">
          <button className="back-btn" onClick={() => setStep('email')}>
            <ArrowLeft size={16} /> رجوع
          </button>
          <div className="otp-icon">📧</div>
          <h2>تحقق من بريدك</h2>
          <p className="otp-email">{email}</p>
          <div className="otp-inputs">
            {otp.map((digit, i) => (
              <input key={i} id={`otp-${i}`} type="text" maxLength={1} className="otp-input"
                value={digit} onChange={(e) => handleOtpChange(i, e.target.value)} />
            ))}
          </div>
          <button className="btn-submit" onClick={handleVerifyOtp} disabled={loading}>
            {loading ? <span className="spinner" /> : 'تأكيد وتسجيل الدخول'}
          </button>
          <div className="resend-area">
            {timer > 0 ? (
              <span>إعادة الإرسال بعد {timer} ثانية</span>
            ) : (
              <button className="resend-btn" onClick={handleResend}>إعادة إرسال الرمز</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="otp-container">
      <div className="otp-card">
        <div className="otp-icon">🔐</div>
        <h2>تسجيل الدخول بالبريد</h2>
        <p>أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق</p>
        <form onSubmit={handleSendOtp}>
          <input type="email" className="form-input" placeholder="example@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'إرسال رمز التحقق'}
          </button>
        </form>
        <button className="link-btn" onClick={() => navigate('/auth')}>
          ← العودة إلى تسجيل الدخول العادي
        </button>
      </div>
    </div>
  );
}
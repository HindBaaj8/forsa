// src/components/auth/EmailVerification.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { Mail, ArrowLeft } from 'lucide-react';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (!email) {
      navigate('/auth');
    }
  }, [email, navigate]);

  // بدء المؤقت
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    const otpCode = code.join('');
    if (otpCode.length !== 6) {
      toast.error('الرجاء إدخال رمز التأكيد المكون من 6 أرقام');
      return;
    }
    
    setLoading(true);
    try {
      // ✅ تأكيد البريد
      const response = await api.post('/auth/email/verify', { 
        email, 
        code: otpCode 
      });
      
      if (response.data.success) {
        toast.success('تم تأكيد البريد الإلكتروني بنجاح');
        
        // ✅ جيب كلمة المرور من sessionStorage
        const pendingPassword = sessionStorage.getItem('pending_password');
        
        if (!pendingPassword) {
          toast.info('الرجاء إدخال كلمة المرور لتسجيل الدخول');
          navigate('/auth');
          return;
        }
        
        // ✅ تسجيل الدخول بعد التأكيد
        const loginResponse = await api.post('/auth/login', {
          email: email,
          password: pendingPassword  // ✅ صحيح
        });
        
        const { token, user } = loginResponse.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        sessionStorage.removeItem('pending_email');
        sessionStorage.removeItem('pending_password');  // ✅ صحيح
        
        // ✅ التوجيه حسب الدور
        if (user.role === 'client') {
          window.location.href = '/client';
        } else if (user.role === 'worker') {
          window.location.href = '/worker';
        } else if (user.role === 'admin') {
          window.location.href = '/admin';
        }
      }
    } catch (error) {
      console.error('Verification error:', error.response?.data);
      toast.error(error.response?.data?.message || 'رمز غير صحيح أو منتهي الصلاحية');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      await api.post('/auth/email/resend', { email });
      toast.success('تم إعادة إرسال رمز التحقق');
      setTimer(60);
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setResending(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <button className="back-btn" onClick={() => navigate('/auth')}>
          <ArrowLeft size={16} /> رجوع
        </button>
        <div className="forgot-icon">📧</div>
        <h2>تأكيد البريد الإلكتروني</h2>
        <p className="reset-email">{email}</p>
        
        <div className="otp-inputs">
          {code.map((digit, i) => (
            <input
              key={i}
              id={`code-${i}`}
              type="text"
              maxLength={1}
              className="otp-input"
              value={digit}
              onChange={(e) => handleCodeChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>
        
        <button className="btn-submit" onClick={handleVerify} disabled={loading}>
          {loading ? <span className="spinner" /> : 'تأكيد البريد'}
        </button>
        
        <div className="resend-area" style={{ textAlign: 'center', marginTop: 20 }}>
          {timer > 0 ? (
            <span style={{ color: '#999', fontSize: 14 }}>
              يمكنك إعادة الإرسال بعد {timer} ثانية
            </span>
          ) : (
            <button 
              onClick={handleResend} 
              disabled={resending}
              style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer' }}
            >
              {resending ? 'جاري...' : 'إعادة إرسال الرمز'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
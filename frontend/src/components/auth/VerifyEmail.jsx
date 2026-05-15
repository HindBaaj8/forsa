// components/auth/VerifyEmail.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Mail, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { sendVerificationCode, verifyCode, resendVerificationCode } from '../../features/auth/authSlice';
import { toast } from 'react-hot-toast';

export default function VerifyEmail({ email, onVerified }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // إرسال الرمز تلقائياً عند فتح الصفحة
    dispatch(sendVerificationCode(email));
    
    // بدء المؤقت
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [dispatch, email]);

  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-input-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const codeString = code.join('');
    if (codeString.length !== 6) {
      toast.error('الرجاء إدخال الرمز المكون من 6 أرقام');
      return;
    }
    
    setLoading(true);
    try {
      await dispatch(verifyCode({ email, code: codeString })).unwrap();
      toast.success('تم التحقق من بريدك الإلكتروني بنجاح');
      if (onVerified) onVerified();
    } catch (error) {
      toast.error(error || 'رمز التحقق غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await dispatch(resendVerificationCode(email)).unwrap();
      toast.success('تم إعادة إرسال رمز التحقق');
      setTimer(60);
      setCanResend(false);
      
      // إعادة تشغيل المؤقت
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      toast.error('فشل إعادة إرسال الرمز');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-email-container">
      <div className="verify-icon">
        <Mail size={48} />
      </div>
      <h2>تحقق من بريدك الإلكتروني</h2>
      <p>قمنا بإرسال رمز التحقق إلى</p>
      <div className="verify-email">{email}</div>
      
      <div className="code-inputs">
        {code.map((digit, index) => (
          <input
            key={index}
            id={`code-input-${index}`}
            type="text"
            maxLength={1}
            className="code-input"
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            autoFocus={index === 0}
          />
        ))}
      </div>
      
      <button 
        className="btn-verify"
        onClick={handleVerify}
        disabled={loading || code.some(d => !d)}
      >
        {loading ? <span className="spinner" /> : <><Check size={16} /> تأكيد</>}
      </button>
      
      <div className="resend-section">
        {canResend ? (
          <button className="btn-resend" onClick={handleResend} disabled={resending}>
            <RefreshCw size={14} /> {resending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
          </button>
        ) : (
          <span className="timer">يمكنك إعادة الإرسال بعد {timer} ثانية</span>
        )}
      </div>
      
      <div className="verify-note">
        <AlertCircle size={14} />
        <span>لم تصلك الرسالة؟ تحقق من مجلد البريد العشوائي (Spam)</span>
      </div>
    </div>
  );
}
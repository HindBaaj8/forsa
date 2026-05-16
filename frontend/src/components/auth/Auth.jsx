// frontend/src/components/auth/Auth.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import '../../styles/Auth.css';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [role, setRole] = useState('client');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      const response = await api.post('/auth/login', { 
        email: loginEmail, 
        password: loginPassword 
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('تم تسجيل الدخول بنجاح');
      
      // التوجيه حسب الدور
      if (user.role === 'client') {
        window.location.href = '/client';
      } else if (user.role === 'worker') {
        window.location.href = '/worker';
      } else if (user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      const message = error.response?.data?.message || 'فشل تسجيل الدخول';
      setErrors({ general: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

 const handleRegister = async (e) => {
  e.preventDefault();
  
  console.log('📤 Register data:', {  // ✅ أضف هذا
    first_name: firstName,
    last_name: lastName,
    email: email,
    phone: phone,
    city: city,
    password: password,
    password_confirmation: confirmPassword,
    role: role,
  });
    
    // Validation
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = 'الاسم الأول مطلوب';
    if (!lastName.trim()) newErrors.lastName = 'الاسم الأخير مطلوب';
    if (!email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'صيغة البريد غير صحيحة';
    if (!phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب';
    if (!password) newErrors.password = 'كلمة المرور مطلوبة';
    else if (password.length < 8) newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    if (password !== confirmPassword) newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.post('/auth/register', {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        city: city,
        password: password,
        password_confirmation: confirmPassword,
        role: role,
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('تم إنشاء الحساب بنجاح');
      
      // التوجيه حسب الدور
      if (user.role === 'client') {
        window.location.href = '/client';
      } else if (user.role === 'worker') {
        window.location.href = '/worker';
      } else if (user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.errors || 'فشل إنشاء الحساب';
      if (typeof message === 'object') {
        setErrors(message);
        toast.error('يرجى التحقق من البيانات');
      } else {
        setErrors({ general: message });
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-left__brand" onClick={() => navigate('/')}>
            <div className="auth-left__brand-icon">🔍</div>
            <span className="auth-left__brand-name">
              فرصة <span className="auth-left__brand-gold">عمل</span>
            </span>
          </div>
          <div className="auth-left__content">
            <div className="auth-left__icon">👋</div>
            <h2>مرحباً بك</h2>
            <p>منصة الخدمات الأولى في المغرب</p>
          </div>
        </div>
        
        <div className="auth-right">
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              تسجيل الدخول
            </button>
            <button 
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              حساب جديد
            </button>
          </div>
          
          {isLogin ? (
            // ✅ Login Form
            <form onSubmit={handleLogin}>
              {errors.general && <div className="error-box">{errors.general}</div>}
              
              <div className="form-group">
                <label className="form-label">البريد الإلكتروني</label>
                <input
                  type="email"
                  className="form-input"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">كلمة المرور</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div className="form-meta">
                <label className="form-check">
                  <input type="checkbox" /> تذكّرني
                </label>
                {/* ✅ زر "نسيت كلمة المرور" يروح لـ /forgot-password */}
                <button 
                  type="button" 
                  className="form-link" 
                  onClick={() => navigate('/forgot-password')}
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'جاري...' : 'تسجيل الدخول'}
              </button>
            </form>
          ) : (
            // Register Form
            <form onSubmit={handleRegister}>
              {errors.general && <div className="error-box">{errors.general}</div>}
              
              <div className="role-picker">
                <div 
                  className={`role-card ${role === 'worker' ? 'active' : ''}`}
                  onClick={() => setRole('worker')}
                >
                  <div className="role-card__icon">💼</div>
                  <div className="role-card__label">صاحب مهنة</div>
                </div>
                <div 
                  className={`role-card ${role === 'client' ? 'active' : ''}`}
                  onClick={() => setRole('client')}
                >
                  <div className="role-card__icon">🙋</div>
                  <div className="role-card__label">عميل</div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">الاسم الأول</label>
                  <input
                    type="text"
                    className="form-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="أحمد"
                  />
                  {errors.firstName && <span className="form-err">{errors.firstName}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">الاسم الأخير</label>
                  <input
                    type="text"
                    className="form-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="العلوي"
                  />
                  {errors.lastName && <span className="form-err">{errors.lastName}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">البريد الإلكتروني</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                />
                {errors.email && <span className="form-err">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">رقم الهاتف</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0612345678"
                />
                {errors.phone && <span className="form-err">{errors.phone}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">المدينة</label>
                <input
                  type="text"
                  className="form-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="الدار البيضاء"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">كلمة المرور</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                {errors.password && <span className="form-err">{errors.password}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">تأكيد كلمة المرور</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <span className="form-err">{errors.confirmPassword}</span>}
              </div>
              
              <label className="form-terms">
                <input type="checkbox" required />
                <span>أوافق على <a href="#">شروط الاستخدام</a></span>
              </label>
              
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'جاري...' : 'إنشاء الحساب'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
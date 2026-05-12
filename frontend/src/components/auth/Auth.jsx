// src/pages/Auth.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import '../styles/Auth.css';
import { 
  Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, Check, AlertCircle,
  Shield, Smartphone, ChevronLeft
} from 'lucide-react';
import '../styles/Auth.css';

const maskEmail = (e) => {
  const [u, d] = e.split('@');
  if (!d) return e;
  return `${u.slice(0, 2)}${'•'.repeat(Math.max(u.length - 2, 3))}@${d}`;
};

// ==================== OTP INPUT ====================
function OTPInput({ value, onChange }) {
  const refs = useRef([]);
  useEffect(() => { refs.current[0]?.focus(); }, []);

  const handleChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...value]; next[i] = v; onChange(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };
  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };
  const handlePaste = (e) => {
    const t = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (t.length === 6) { onChange(t.split('')); refs.current[5]?.focus(); }
  };

  return (
    <div className="otp-wrap" onPaste={handlePaste}>
      {value.map((d, i) => (
        <input key={i} ref={el => refs.current[i] = el}
          className={`otp-input${d ? ' filled' : ''}`}
          inputMode="numeric" maxLength={1} value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)} />
      ))}
    </div>
  );
}

// ==================== RESEND TIMER ====================
function ResendTimer({ onResend }) {
  const [sec, setSec] = useState(45);
  useEffect(() => {
    if (sec <= 0) return;
    const t = setTimeout(() => setSec(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sec]);
  return (
    <div className="resend-row">
      لم تصلك الرسالة؟{' '}
      {sec > 0
        ? <strong>أعد المحاولة بعد {sec} ثانية</strong>
        : <button className="form-link" onClick={() => { setSec(45); onResend(); }}>إعادة الإرسال</button>
      }
    </div>
  );
}

// ==================== LOGIN FORM ====================
function LoginForm({ onSwitch }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('creds');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState(['','','','','','']);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCreds = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/login', { email, password: pass });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('تم تسجيل الدخول بنجاح');
      
      if (user.role === 'client') navigate('/client');
      else if (user.role === 'worker') navigate('/worker');
      else if (user.role === 'admin') navigate('/admin');
    } catch (error) {
      const message = error.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      setErrors({ general: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTP = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    navigate('/client');
  };

  if (step === 'otp') return (
    <>
      <button className="auth-back" onClick={() => setStep('creds')}>
        <ArrowLeft size={16} /> الرجوع
      </button>
      <div className="auth-icon-large">🔐</div>
      <h1 className="auth-title">التحقق من هويتك</h1>
      <p className="auth-sub">أرسلنا رمزاً من ٦ أرقام إلى بريدك الإلكتروني</p>
      <div className="email-chip">
        <Mail size={14} />
        <span>{maskEmail(email)}</span>
      </div>
      <form onSubmit={handleOTP}>
        <OTPInput value={otp} onChange={setOtp} />
        {errors.otp && <span className="form-err">{errors.otp}</span>}
        <button className="btn-submit" type="submit"
          disabled={otp.some(d => !d) || loading} style={{marginTop:22}}>
          {loading ? <span className="spinner"/> : <><Check size={16} /> تأكيد الدخول</>}
        </button>
      </form>
      <ResendTimer onResend={() => {}} />
    </>
  );

  return (
    <>
      <h1 className="auth-title">تسجيل الدخول</h1>
      <p className="auth-sub">أدخل بياناتك للوصول إلى حسابك</p>
      
      {errors.general && (
        <div className="error-box">
          <AlertCircle size={14} /> {errors.general}
        </div>
      )}
      
      <form onSubmit={handleCreds}>
        <div className="form-group">
          <label className="form-label">البريد الإلكتروني <span className="req">*</span></label>
          <div className="field-wrap">
            <Mail size={16} className="field-icon" />
            <input 
              className="form-input"
              type="email"
              placeholder="example@email.com" 
              value={email}
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">كلمة المرور <span className="req">*</span></label>
          <div className="field-wrap">
            <input 
              className={`form-input ${showPw ? '' : 'has-eye'}`}
              type={showPw ? 'text' : 'password'} 
              placeholder="••••••••" 
              value={pass}
              onChange={e => setPass(e.target.value)} 
            />
            <button type="button" className="field-eye" onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        
        <div className="form-meta">
          <label className="form-check">
            <input type="checkbox" /> تذكّرني
          </label>
          <button type="button" className="form-link" onClick={() => navigate('/auth?mode=forgot')}>
            نسيت كلمة المرور؟
          </button>
        </div>
        
        <button className="btn-submit" type="submit" disabled={loading}>
          {loading ? <span className="spinner"/> : <>متابعة <ChevronLeft size={16} /></>}
        </button>
      </form>
      
      <div className="form-divider">أو</div>
      <button className="btn-google">الدخول بحساب Google</button>
      
      <div className="auth-footer">
        ليس لديك حساب؟{' '}
        <button className="form-link" onClick={onSwitch}>سجّل الآن</button>
      </div>
    </>
  );
}

// ==================== REGISTER FORM ====================
function RegisterForm({ onSwitch }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('form');
  const [role, setRole] = useState('client');
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', password:'' });
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState(['','','','','','']);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'الاسم الأول مطلوب';
    if (!form.lastName.trim()) e.lastName = 'الاسم الأخير مطلوب';
    if (!form.email) e.email = 'البريد مطلوب';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'صيغة البريد غير صحيحة';
    if (!form.phone.trim()) e.phone = 'رقم الهاتف مطلوب';
    if (!form.password) e.password = 'كلمة المرور مطلوبة';
    else if (form.password.length < 8) e.password = '٨ أحرف على الأقل';
    return e;
  };

  const handleForm = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    
    setLoading(true);
    
    try {
      const response = await api.post('/register', {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        password_confirmation: form.password,
        role: role,
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('تم إنشاء الحساب بنجاح');
      
      navigate(role === 'client' ? '/client' : '/worker');
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.errors || 'حدث خطأ';
      setErrors({ general: typeof message === 'string' ? message : 'فشل إنشاء الحساب' });
      toast.error('فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  const handleOTP = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    
    localStorage.setItem('token', 'mock-token-' + Date.now());
    localStorage.setItem('user', JSON.stringify({
      id: Date.now(),
      email: form.email,
      role: role,
      first_name: form.firstName,
      last_name: form.lastName,
      phone: form.phone,
    }));
    
    setStep('done');
    setLoading(false);
    toast.success('تم تأكيد البريد الإلكتروني بنجاح');
  };

  if (step === 'done') return (
    <div className="auth-success">
      <div className="auth-success__icon">🎉</div>
      <h1 className="auth-success__title">مرحباً بك في فرصة عمل!</h1>
      <p className="auth-success__desc">تم إنشاء حسابك بنجاح. يمكنك الآن الاستفادة من جميع خدمات المنصة.</p>
      <button className="btn-submit btn-submit--gold"
        onClick={() => navigate(role === 'client' ? '/client' : '/worker')}>
        الذهاب إلى حسابي <ChevronLeft size={16} />
      </button>
    </div>
  );

  if (step === 'otp') return (
    <>
      <button className="auth-back" onClick={() => setStep('form')}>
        <ArrowLeft size={16} /> الرجوع
      </button>
      <div className="auth-icon-large">📨</div>
      <h1 className="auth-title">تأكيد البريد الإلكتروني</h1>
      <p className="auth-sub">أرسلنا رمزاً من ٦ أرقام إلى بريدك للتحقق من حسابك</p>
      <div className="email-chip">
        <Mail size={14} />
        <span>{maskEmail(form.email)}</span>
      </div>
      <form onSubmit={handleOTP}>
        <OTPInput value={otp} onChange={setOtp} />
        {errors.otp && <span className="form-err">{errors.otp}</span>}
        <button className="btn-submit" type="submit"
          disabled={otp.some(d=>!d)||loading} style={{marginTop:22}}>
          {loading ? <span className="spinner"/> : 'تأكيد الحساب ✓'}
        </button>
      </form>
      <ResendTimer onResend={() => {}} />
    </>
  );

  return (
    <>
      <h1 className="auth-title">إنشاء حساب جديد</h1>
      <p className="auth-sub">اختر نوع الحساب المناسب لك</p>

      <div className="role-picker">
        <div className={`role-card ${role === 'worker' ? 'active' : ''}`} onClick={() => setRole('worker')}>
          <div className="role-card__icon">💼</div>
          <div className="role-card__label">صاحب مهنة</div>
          <div className="role-card__sub">كنعرض خدماتي</div>
        </div>
        <div className={`role-card ${role === 'client' ? 'active' : ''}`} onClick={() => setRole('client')}>
          <div className="role-card__icon">🙋</div>
          <div className="role-card__label">عميل</div>
          <div className="role-card__sub">كنقلب على خدمة</div>
        </div>
      </div>

      {errors.general && (
        <div className="error-box">{errors.general}</div>
      )}

      <form onSubmit={handleForm}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">الاسم الأول <span className="req">*</span></label>
            <div className="field-wrap">
              <User size={16} className="field-icon" />
              <input 
                className="form-input"
                placeholder="أحمد" 
                value={form.firstName}
                onChange={e => setForm({...form, firstName: e.target.value})}
              />
            </div>
            {errors.firstName && <span className="form-err">{errors.firstName}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">الاسم الأخير <span className="req">*</span></label>
            <div className="field-wrap">
              <User size={16} className="field-icon" />
              <input 
                className="form-input"
                placeholder="العلوي" 
                value={form.lastName}
                onChange={e => setForm({...form, lastName: e.target.value})}
              />
            </div>
            {errors.lastName && <span className="form-err">{errors.lastName}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">البريد الإلكتروني <span className="req">*</span></label>
          <div className="field-wrap">
            <Mail size={16} className="field-icon" />
            <input 
              className="form-input"
              type="email" 
              placeholder="example@email.com" 
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>
          {errors.email && <span className="form-err">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">رقم الهاتف <span className="req">*</span></label>
          <div className="field-wrap">
            <Smartphone size={16} className="field-icon" />
            <input 
              className="form-input"
              type="tel" 
              placeholder="0612345678" 
              value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})}
            />
          </div>
          {errors.phone && <span className="form-err">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">كلمة المرور <span className="req">*</span></label>
          <div className="field-wrap">
            <input 
              className="form-input"
              type={showPw ? 'text' : 'password'} 
              placeholder="٨ أحرف على الأقل" 
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />
            <button type="button" className="field-eye" onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <span className="form-err">{errors.password}</span>}
          {!errors.password && form.password.length >= 8 && <span className="form-hint">✓ كلمة مرور قوية</span>}
        </div>

        <label className="form-terms">
          <input type="checkbox" required />
          <span>أوافق على <a href="#">شروط الاستخدام</a> و <a href="#">سياسة الخصوصية</a></span>
        </label>

        <button className="btn-submit" type="submit" disabled={loading}>
          {loading ? <span className="spinner"/> : <>إنشاء الحساب <ChevronLeft size={16} /></>}
        </button>
      </form>
      
      <div className="auth-footer">
        لديك حساب؟{' '}
        <button className="form-link" onClick={onSwitch}>تسجيل الدخول</button>
      </div>
    </>
  );
}

// ==================== FORGOT PASSWORD ====================
function ForgotForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const sendResetLink = async () => {
    setLoading(true);
    try {
      await api.post('/forgot-password', { email });
      toast.success('تم إرسال رابط إعادة التعيين');
      setStep('reset');
    } catch (error) {
      setErrors({ email: 'البريد الإلكتروني غير موجود' });
      toast.error('البريد الإلكتروني غير موجود');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (pass.length < 8) {
      setErrors({ pass: '٨ أحرف على الأقل' });
      return;
    }
    if (pass !== confirm) {
      setErrors({ confirm: 'كلمتا المرور غير متطابقتين' });
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/reset-password', {
        email,
        token,
        password: pass,
        password_confirmation: confirm
      });
      toast.success('تم تغيير كلمة المرور بنجاح');
      navigate('/auth?mode=login');
    } catch (error) {
      setErrors({ general: 'الرابط غير صالح أو منتهي الصلاحية' });
      toast.error('فشل تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'email') return (
    <>
      <button className="auth-back" onClick={() => navigate('/auth?mode=login')}>
        <ArrowLeft size={16} /> الرجوع لتسجيل الدخول
      </button>
      <h1 className="auth-title">استرجاع كلمة المرور</h1>
      <p className="auth-sub">أدخل بريدك الإلكتروني وسنرسل إليك رابط إعادة التعيين</p>
      <form onSubmit={e => { e.preventDefault(); sendResetLink(); }}>
        <div className="form-group">
          <label className="form-label">البريد الإلكتروني</label>
          <div className="field-wrap">
            <Mail size={16} className="field-icon" />
            <input 
              className="form-input"
              type="email"
              placeholder="example@email.com" 
              value={email}
              onChange={e=>{setEmail(e.target.value);setErrors({});}} 
            />
          </div>
          {errors.email && <span className="form-err">{errors.email}</span>}
        </div>
        <button className="btn-submit" type="submit" disabled={loading}>
          {loading ? <span className="spinner"/> : <>إرسال الرابط <ChevronLeft size={16} /></>}
        </button>
      </form>
    </>
  );

  if (step === 'reset') return (
    <>
      <button className="auth-back" onClick={() => setStep('email')}>
        <ArrowLeft size={16} /> الرجوع
      </button>
      <div className="auth-icon-large">🔑</div>
      <h1 className="auth-title">إعادة تعيين كلمة المرور</h1>
      <p className="auth-sub">أدخل رمز التحقق وكلمة المرور الجديدة</p>
      <div className="form-group">
        <label className="form-label">رمز التحقق</label>
        <input 
          className="form-input"
          placeholder="أدخل الرمز المرسل إلى بريدك"
          value={token}
          onChange={e=>setToken(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="form-label">كلمة المرور الجديدة</label>
        <div className="field-wrap">
          <input 
            className="form-input"
            type={showPw ? 'text' : 'password'} 
            placeholder="••••••••"
            value={pass} 
            onChange={e=>{setPass(e.target.value);setErrors({});}} 
          />
          <button type="button" className="field-eye" onClick={()=>setShowPw(!showPw)}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.pass && <span className="form-err">{errors.pass}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">تأكيد كلمة المرور</label>
        <div className="field-wrap">
          <input 
            className="form-input"
            type={showPw ? 'text' : 'password'} 
            placeholder="••••••••"
            value={confirm} 
            onChange={e=>{setConfirm(e.target.value);setErrors({});}} 
          />
        </div>
        {errors.confirm && <span className="form-err">{errors.confirm}</span>}
      </div>
      <button className="btn-submit" onClick={resetPassword} disabled={loading}>
        {loading?<span className="spinner"/>:<>حفظ كلمة المرور <ChevronLeft size={16} /></>}
      </button>
    </>
  );

  return (
    <div className="auth-success">
      <div className="auth-success__icon">✅</div>
      <h1 className="auth-success__title">تم تغيير كلمة المرور</h1>
      <p className="auth-success__desc">يمكنك الآن تسجيل الدخول بكلمة مرورك الجديدة</p>
      <button className="btn-submit" onClick={() => navigate('/auth?mode=login')}>
        تسجيل الدخول <ChevronLeft size={16} />
      </button>
    </div>
  );
}

// ==================== LEFT PANEL ====================
const PANELS = {
  login: {
    icon: '👋',
    titleText: <>مرحباً بك<br /><em>من جديد</em></>,
    desc: 'ادخل إلى حسابك واستمر في رحلتك مع فرصة عمل — فرص الشغل بين يديك.',
    extra: (
      <div className="auth-left__security">
        <Shield size={14} /> دخول آمن
        <div>محمي بالتحقق الثنائي عبر البريد الإلكتروني</div>
      </div>
    ),
  },
  register: {
    icon: '🚀',
    titleText: <>انضم إلينا<br /><em>اليوم</em></>,
    desc: 'أنشئ حسابك مجاناً وابدأ في البحث عن الخدمة التي تحتاجها أو اعرض مهارتك.',
    extra: (
      <div className="auth-left__feats">
        {['تسجيل مجاني ١٠٠٪','تحقق آمن بخطوتين','بداية فورية بدون تعقيد'].map(t => (
          <div key={t} className="auth-left__feat">
            <div className="auth-left__feat-ico">✓</div>{t}
          </div>
        ))}
      </div>
    ),
  },
  forgot: {
    icon: '🔑',
    titleText: <>نسيت كلمة<br /><em>المرور؟</em></>,
    desc: 'لا تقلق — في ٣ خطوات بسيطة نعيد إليك الوصول لحسابك بكل أمان.',
    extra: (
      <div className="auth-left__steps">
        {['أدخل بريدك الإلكتروني','تحقق بالرمز المُرسَل','حدد كلمة مرور جديدة'].map((t,i) => (
          <div key={t} className="auth-left__step">
            <div className="auth-left__step-n">{i+1}</div>
            <div className="auth-left__step-t">{t}</div>
          </div>
        ))}
      </div>
    ),
  },
};

// ==================== MAIN AUTH ====================
export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const raw = searchParams.get('mode') || 'login';
  const mode = ['login','register','forgot'].includes(raw) ? raw : 'login';
  const setMode = m => navigate(`/auth?mode=${m}`, { replace: true });

  const panel = PANELS[mode];

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left__brand" onClick={() => navigate('/')}>
          <div className="auth-left__brand-icon">🔍</div>
          <span className="auth-left__brand-name">
            فرصة <span className="auth-left__brand-gold">عمل</span>
          </span>
        </div>

        <div className="auth-left__body">
          <div className="auth-left__icon">{panel.icon}</div>
          <h2 className="auth-left__title">{panel.titleText}</h2>
          <p className="auth-left__desc">{panel.desc}</p>
          {panel.extra}
        </div>

        <div className="auth-left__copy">
          © {new Date().getFullYear()} فرصة عمل — جميع الحقوق محفوظة
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          {mode !== 'forgot' && (
            <div className="auth-tabs">
              <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
                تسجيل الدخول
              </button>
              <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
                حساب جديد
              </button>
            </div>
          )}
          {mode === 'login' && <LoginForm onSwitch={() => setMode('register')} />}
          {mode === 'register' && <RegisterForm onSwitch={() => setMode('login')} />}
          {mode === 'forgot' && <ForgotForm />}
        </div>
      </div>
    </div>
  );
}
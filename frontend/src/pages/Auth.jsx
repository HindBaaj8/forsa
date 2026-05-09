// pages/Auth.jsx - Version avec lucide-react icons
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  User,
  Phone,
  ArrowLeft,
  Check,
  AlertCircle,
  Search,
  Bell,
  Home,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Trash2,
  Edit,
  Star,
  MessageCircle,
  Heart,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  PhoneCall,
  Shield,
  Award,
  Briefcase,
  Tool,
  Wrench,
  ClipboardList,
  FileText,
  CreditCard,
  Smartphone,
  AtSign,
  UserCheck,
  UserX,
  UserPlus,
  UsersRound,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  RefreshCw,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import '../styles/Auth.css';

/* ── MOCK USERS FOR TESTING ── */
const MOCK_USERS = {
  'client@test.com': { 
    password: '12345678', 
    role: 'client', 
    first_name: 'أحمد', 
    last_name: 'العلوي',
    phone: '0612345678',
    city: 'الدار البيضاء'
  },
  'worker@test.com': { 
    password: '12345678', 
    role: 'worker', 
    first_name: 'كريم', 
    last_name: 'السوسي',
    phone: '0612345680',
    city: 'مراكش',
  },
  'admin@test.com': { 
    password: 'admin123', 
    role: 'admin', 
    first_name: 'أحمد', 
    last_name: 'المدير',
    phone: '0612345690',
    city: 'الدار البيضاء'
  },
};

/* ── helpers ─────────────────────────── */
const maskEmail = (e) => {
  const [u, d] = e.split('@');
  if (!d) return e;
  return `${u.slice(0, 2)}${'•'.repeat(Math.max(u.length - 2, 3))}@${d}`;
};

/* ── OTP Input ───────────────────────── */
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

/* ── Resend Timer ────────────────────── */
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

/* ════════════════════════════════════════
   LOGIN FORM
════════════════════════════════════════ */
function LoginForm({ onSwitch }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('creds');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState(['','','','','','']);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!email) e.email = 'البريد الإلكتروني مطلوب';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'صيغة البريد غير صحيحة';
    if (!pass) e.pass = 'كلمة المرور مطلوبة';
    return e;
  };

  const handleCreds = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    
    const user = MOCK_USERS[email];
    
    if (user && user.password === pass) {
      localStorage.setItem('token', 'mock-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        city: user.city,
      }));
      
      toast.success('تم تسجيل الدخول بنجاح');
      
      if (user.role === 'client') {
        navigate('/client');
      } else if (user.role === 'worker') {
        navigate('/worker');
      } else if (user.role === 'admin') {
        navigate('/admin');
      }
    } else {
      setErrors({ general: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    setLoading(false);
  };

  const handleOTP = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    
    const user = MOCK_USERS[email];
    if (user && user.role === 'client') {
      navigate('/client');
    } else if (user && user.role === 'worker') {
      navigate('/worker');
    } else if (user && user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/worker');
    }
  };

  if (step === 'otp') return (
    <>
      <button className="auth-back" onClick={() => setStep('creds')}>
        <ArrowLeft size={16} /> الرجوع
      </button>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
      <h1 className="auth-title">التحقق من هويتك</h1>
      <p className="auth-sub">أرسلنا رمزاً من ٦ أرقام إلى بريدك الإلكتروني</p>
      <div className="email-chip">
        <Mail size={14} />
        <span>{maskEmail(email)}</span>
      </div>
      <form onSubmit={handleOTP}>
        <OTPInput value={otp} onChange={setOtp} />
        {errors.otp && <span className="form-err" style={{marginTop:8,display:'block'}}>{errors.otp}</span>}
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
      
      <div style={{
        background: 'var(--g50)',
        border: '1px solid var(--g100)',
        borderRadius: 10,
        padding: '10px 14px',
        marginBottom: 16,
        fontSize: 12,
        color: 'var(--g700)',
      }}>
        <strong>📝 للاختبار:</strong><br />
        عميل: client@test.com / 12345678<br />
        مهني: worker@test.com / 12345678<br />
        مدير: admin@test.com / admin123
      </div>
      
      {errors.general && (
        <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,
          padding:'10px 14px',marginBottom:16,fontSize:13,color:'#991b1b',fontWeight:600}}>
          <AlertCircle size={14} style={{display:'inline',marginLeft:6}} />
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleCreds}>
        <div className="form-group">
          <label className="form-label">
            البريد الإلكتروني <span className="req">*</span>
          </label>
          <div className="field-wrap">
            <Mail size={16} className="field-icon" />
            <input 
              className={`form-input${errors.email?' err':''}`} 
              type="email"
              placeholder="example@email.com" 
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(er => ({...er,email:''})); }} 
            />
          </div>
          {errors.email && <span className="form-err">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label className="form-label">
            كلمة المرور <span className="req">*</span>
          </label>
          {/* ← حذفنا Lock icon — Eye وحده يكفي */}
          <div className="field-wrap">
            <input 
              className={`form-input has-eye${errors.pass?' err':''}`}
              type={showPw?'text':'password'} 
              placeholder="••••••••" 
              value={pass}
              onChange={e => { setPass(e.target.value); setErrors(er => ({...er,pass:''})); }} 
            />
            <button type="button" className="field-eye" onClick={() => setShowPw(s=>!s)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.pass && <span className="form-err">{errors.pass}</span>}
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
      
      <button className="btn-google">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        الدخول بحساب Google
      </button>
      
      <div className="auth-footer">
        ليس لديك حساب؟{' '}
        <button className="form-link" onClick={onSwitch}>سجّل الآن</button>
      </div>
    </>
  );
}

/* ════════════════════════════════════════
   REGISTER FORM
════════════════════════════════════════ */
function RegisterForm({ onSwitch }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('form');
  const [role, setRole] = useState('client');
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', password:'' });
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState(['','','','','','']);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const f = (key) => ({
    value: form[key],
    onChange: e => { setForm(p => ({...p,[key]:e.target.value})); setErrors(er => ({...er,[key]:''})); },
  });

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'الاسم الأول مطلوب';
    if (!form.lastName.trim())  e.lastName  = 'الاسم الأخير مطلوب';
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
    await new Promise(r => setTimeout(r, 1000));
    
    localStorage.setItem('temp_user', JSON.stringify({
      email: form.email,
      password: form.password,
      role: role,
      first_name: form.firstName,
      last_name: form.lastName,
      phone: form.phone,
    }));
    
    toast.success('تم إنشاء الحساب بنجاح، يرجى تأكيد بريدك الإلكتروني');
    setStep('otp');
    setLoading(false);
  };

  const handleOTP = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    
    const tempUser = JSON.parse(localStorage.getItem('temp_user') || '{}');
    
    localStorage.setItem('token', 'mock-token-' + Date.now());
    localStorage.setItem('user', JSON.stringify({
      id: Date.now(),
      email: tempUser.email,
      role: tempUser.role,
      first_name: tempUser.first_name,
      last_name: tempUser.last_name,
      phone: tempUser.phone,
    }));
    
    localStorage.removeItem('temp_user');
    
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
        onClick={() => navigate(role === 'client' ? '/client' : role === 'worker' ? '/worker' : '/admin')}>
        الذهاب إلى حسابي <ChevronLeft size={16} />
      </button>
    </div>
  );

  if (step === 'otp') return (
    <>
      <button className="auth-back" onClick={() => setStep('form')}>
        <ArrowLeft size={16} /> الرجوع
      </button>
      <div style={{fontSize:40,marginBottom:12}}>📨</div>
      <h1 className="auth-title">تأكيد البريد الإلكتروني</h1>
      <p className="auth-sub">أرسلنا رمزاً من ٦ أرقام إلى بريدك للتحقق من حسابك</p>
      <div className="email-chip">
        <Mail size={14} />
        <span>{maskEmail(form.email)}</span>
      </div>
      <form onSubmit={handleOTP}>
        <OTPInput value={otp} onChange={setOtp} />
        {errors.otp && <span className="form-err" style={{marginTop:8,display:'block'}}>{errors.otp}</span>}
        <button className="btn-submit" type="submit"
          disabled={otp.some(d=>!d)||loading} style={{marginTop:22}}>
          {loading ? <span className="spinner"/> :
            (role==='client' ? 'تأكيد الحساب كعميل ✓' : role==='worker' ? 'تأكيد الحساب كمهني ✓' : 'تأكيد الحساب كمدير ✓')}
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
        <div className={`role-card${role==='worker'?' active':''}`} onClick={() => setRole('worker')}>
          <div className="role-card__icon">💼</div>
          <div className="role-card__label">صاحب مهنة</div>
          <div className="role-card__sub">كنعرض خدماتي</div>
        </div>
        <div className={`role-card${role==='client'?' active':''}`} onClick={() => setRole('client')}>
          <div className="role-card__icon">🙋</div>
          <div className="role-card__label">عميل</div>
          <div className="role-card__sub">كنقلب على خدمة</div>
        </div>
      </div>

      <form onSubmit={handleForm}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">الاسم الأول <span className="req">*</span></label>
            <div className="field-wrap">
              <User size={16} className="field-icon" />
              <input className={`form-input${errors.firstName?' err':''}`} placeholder="أحمد" {...f('firstName')} />
            </div>
            {errors.firstName && <span className="form-err">{errors.firstName}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">الاسم الأخير <span className="req">*</span></label>
            <div className="field-wrap">
              <User size={16} className="field-icon" />
              <input className={`form-input${errors.lastName?' err':''}`} placeholder="العلوي" {...f('lastName')} />
            </div>
            {errors.lastName && <span className="form-err">{errors.lastName}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">البريد الإلكتروني <span className="req">*</span></label>
          <div className="field-wrap">
            <Mail size={16} className="field-icon" />
            <input className={`form-input${errors.email?' err':''}`} type="email" placeholder="example@email.com" {...f('email')} />
          </div>
          {errors.email && <span className="form-err">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">رقم الهاتف <span className="req">*</span></label>
          <div className="field-wrap">
            <Smartphone size={16} className="field-icon" />
            <input className={`form-input${errors.phone?' err':''}`} type="tel" placeholder="0612345678" {...f('phone')} />
          </div>
          {errors.phone && <span className="form-err">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">كلمة المرور <span className="req">*</span></label>
          {/* ← حذفنا Lock icon — Eye وحده يكفي */}
          <div className="field-wrap">
            <input className={`form-input has-eye${errors.password?' err':''}`}
              type={showPw?'text':'password'} placeholder="٨ أحرف على الأقل" {...f('password')} />
            <button type="button" className="field-eye" onClick={() => setShowPw(s=>!s)}>
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

/* ════════════════════════════════════════
   FORGOT PASSWORD
════════════════════════════════════════ */
function ForgotForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const go = async (fn) => { 
    setLoading(true); 
    await new Promise(r => setTimeout(r, 800)); 
    fn(); 
    setLoading(false); 
  };

  if (step === 'email') return (
    <>
      <button className="auth-back" onClick={() => navigate('/auth?mode=login')}>
        <ArrowLeft size={16} /> الرجوع لتسجيل الدخول
      </button>
      <h1 className="auth-title">استرجاع كلمة المرور</h1>
      <p className="auth-sub">أدخل بريدك الإلكتروني وسنرسل إليك رمز التحقق</p>
      <form onSubmit={e => { 
        e.preventDefault(); 
        if(!email){
          setErrors({email:'البريد مطلوب'});
          return;
        } 
        go(()=>setStep('otp')); 
      }}>
        <div className="form-group">
          <label className="form-label">البريد الإلكتروني</label>
          <div className="field-wrap">
            <Mail size={16} className="field-icon" />
            <input 
              className={`form-input${errors.email?' err':''}`} 
              type="email"
              placeholder="example@email.com" 
              value={email}
              onChange={e=>{setEmail(e.target.value);setErrors({});}} 
            />
          </div>
          {errors.email && <span className="form-err">{errors.email}</span>}
        </div>
        <button className="btn-submit" type="submit" disabled={loading}>
          {loading ? <span className="spinner"/> : <>إرسال الرمز <ChevronLeft size={16} /></>}
        </button>
      </form>
    </>
  );

  if (step === 'otp') return (
    <>
      <button className="auth-back" onClick={() => setStep('email')}>
        <ArrowLeft size={16} /> الرجوع
      </button>
      <div style={{fontSize:40,marginBottom:12}}>🛡️</div>
      <h1 className="auth-title">أدخل رمز التحقق</h1>
      <p className="auth-sub">أرسلنا رمزاً من ٦ أرقام إلى بريدك</p>
      <div className="email-chip">
        <Mail size={14} />
        <span>{maskEmail(email)}</span>
      </div>
      <form onSubmit={e=>{e.preventDefault();go(()=>setStep('reset'));}}>
        <OTPInput value={otp} onChange={setOtp} />
        <button className="btn-submit" type="submit"
          disabled={otp.some(d=>!d)||loading} style={{marginTop:22}}>
          {loading?<span className="spinner"/>:<>تأكيد الرمز <ChevronLeft size={16} /></>}
        </button>
      </form>
      <ResendTimer onResend={()=>{}} />
    </>
  );

  if (step === 'reset') return (
    <>
      <button className="auth-back" onClick={()=>setStep('otp')}>
        <ArrowLeft size={16} /> الرجوع
      </button>
      <div style={{fontSize:40,marginBottom:12}}>🔑</div>
      <h1 className="auth-title">كلمة المرور الجديدة</h1>
      <p className="auth-sub">اختر كلمة مرور قوية ولا تشاركها مع أحد</p>
      <form onSubmit={e=>{
        e.preventDefault();
        if(pass.length<8){
          setErrors({pass:'٨ أحرف على الأقل'});
          return;
        }
        if(pass!==confirm){
          setErrors({confirm:'كلمتا المرور غير متطابقتين'});
          return;
        }
        go(()=>setStep('done'));
      }}>
        <div className="form-group">
          <label className="form-label">كلمة المرور الجديدة</label>
          {/* ← حذفنا Lock icon */}
          <div className="field-wrap">
            <input 
              className={`form-input has-eye${errors.pass?' err':''}`}
              type={showPw?'text':'password'} 
              placeholder="••••••••"
              value={pass} 
              onChange={e=>{setPass(e.target.value);setErrors({});}} 
            />
            <button type="button" className="field-eye" onClick={()=>setShowPw(s=>!s)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.pass && <span className="form-err">{errors.pass}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">تأكيد كلمة المرور</label>
          {/* ← حذفنا Lock icon — ما عندهاش eye، padding عادي */}
          <div className="field-wrap">
            <input 
              className={`form-input${errors.confirm?' err':''}`}
              type={showPw?'text':'password'} 
              placeholder="••••••••"
              value={confirm} 
              onChange={e=>{setConfirm(e.target.value);setErrors({});}} 
            />
          </div>
          {errors.confirm && <span className="form-err">{errors.confirm}</span>}
        </div>
        <button className="btn-submit" type="submit" disabled={loading}>
          {loading?<span className="spinner"/>:<>حفظ كلمة المرور <ChevronLeft size={16} /></>}
        </button>
      </form>
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

/* ════════════════════════════════════════
   LEFT PANEL CONFIGS
════════════════════════════════════════ */
const PANELS = {
  login: {
    icon: '👋',
    titleText: <>مرحباً بك<br /><em>من جديد</em></>,
    desc: 'ادخل إلى حسابك واستمر في رحلتك مع فرصة عمل — فرص الشغل بين يديك.',
    extra: (
      <div style={{marginTop:24,background:'rgba(255,255,255,.1)',borderRadius:14,padding:'16px 18px'}}>
        <div style={{fontSize:13,fontWeight:700,color:'rgba(255,255,255,.9)',marginBottom:6}}>
          <Shield size={14} style={{display:'inline',marginLeft:6}} /> دخول آمن
        </div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.65)',fontWeight:500,lineHeight:1.6}}>
          محمي بالتحقق الثنائي عبر البريد الإلكتروني
        </div>
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

/* ════════════════════════════════════════
   MAIN AUTH PAGE
════════════════════════════════════════ */
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
          <div style={{width:36,height:36,borderRadius:9,background:'rgba(255,255,255,.18)',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🔍</div>
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
              <button className={`auth-tab${mode==='login'?' active':''}`} onClick={()=>setMode('login')}>
                تسجيل الدخول
              </button>
              <button className={`auth-tab${mode==='register'?' active':''}`} onClick={()=>setMode('register')}>
                حساب جديد
              </button>
            </div>
          )}
          {mode==='login'    && <LoginForm    onSwitch={()=>setMode('register')} />}
          {mode==='register' && <RegisterForm onSwitch={()=>setMode('login')} />}
          {mode==='forgot'   && <ForgotForm />}
        </div>
      </div>
    </div>
  );
}
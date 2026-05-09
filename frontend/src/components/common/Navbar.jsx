import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Navbar.css';

/* ضعي مسار الشعار الحقيقي:
   import logo from '../assets/logo.png'; */

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { label: 'الخدمات',  path: '/services' },
    { label: 'كيف يعمل', path: '/how-it-works' },
    { label: 'من نحن',   path: '/about' },
  ];

  return (
    <>
      <nav className="nav">
        {/* شعار */}
        <div className="nav__logo" onClick={() => navigate('/')}>
          {/* <img src={logo} alt="فرصة عمل" className="nav__logo-img" /> */}
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg,#1e3a6e,#2e5ba8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🔍</div>
          <div>
            <div className="nav__logo-text">فرصة عمل</div>
            <span className="nav__logo-sub">فرص الشغل بين يديك</span>
          </div>
        </div>

        {/* روابط */}
        <div className="nav__links">
          {links.map(l => (
            <button key={l.path} className="nav__link" onClick={() => navigate(l.path)}>
              {l.label}
            </button>
          ))}
        </div>

        {/* أزرار */}
        <div className="nav__actions">
          <button className="nav__btn-ghost" onClick={() => navigate('/auth?mode=login')}>
            تسجيل الدخول
          </button>
          <button className="nav__btn-gold" onClick={() => navigate('/auth?mode=register')}>
            إنشاء حساب مجاناً
          </button>
        </div>

        {/* موبايل */}
        <button className="nav__burger" onClick={() => setOpen(o => !o)} aria-label="القائمة">
          <span /><span /><span />
        </button>
      </nav>

      <div className={`nav__mobile${open ? ' open' : ''}`}>
        {links.map(l => (
          <button key={l.path} className="nav__link" onClick={() => { navigate(l.path); setOpen(false); }}>
            {l.label}
          </button>
        ))}
        <button className="nav__btn-ghost" onClick={() => { navigate('/auth?mode=login'); setOpen(false); }}>
          تسجيل الدخول
        </button>
        <button className="nav__btn-gold" onClick={() => { navigate('/auth?mode=register'); setOpen(false); }}>
          إنشاء حساب مجاناً
        </button>
      </div>
    </>
  );
}

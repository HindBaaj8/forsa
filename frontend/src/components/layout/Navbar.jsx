import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu, X, LogIn, UserPlus, Bell } from 'lucide-react';
import { selectIsAuthenticated, selectUser } from '../../features/auth/authSelectors';
import './styles/Dashboard.css';
export default function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  return (
    <>
      <nav className="nav">
        <div className="nav__logo" onClick={() => navigate('/')}>
          <div className="nav__logo-img">🔍</div>
          <div className="nav__logo-text">
            فرصة <span className="nav__logo-sub">عمل</span>
          </div>
        </div>

        <div className="nav__links">
          <Link to="/" className="nav__link">الرئيسية</Link>
          <Link to="/services" className="nav__link">الخدمات</Link>
          <Link to="/how-it-works" className="nav__link">كيف يعمل</Link>
          <Link to="/about" className="nav__link">من نحن</Link>
        </div>

        <div className="nav__actions">
          {!isAuthenticated ? (
            <>
              <button className="nav__btn-ghost" onClick={() => navigate('/auth?mode=login')}>
                <LogIn size={16} /> تسجيل الدخول
              </button>
              <button className="nav__btn-gold" onClick={() => navigate('/auth?mode=register')}>
                <UserPlus size={16} /> حساب جديد
              </button>
            </>
          ) : (
            <div className="nav__user">
              <span>{user?.first_name}</span>
              <button onClick={() => navigate('/notifications')}>
                <Bell size={18} />
              </button>
            </div>
          )}
        </div>

        <button className="nav__burger" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <div className={`nav__mobile ${mobileOpen ? 'open' : ''}`}>
        <Link to="/" className="nav__link" onClick={() => setMobileOpen(false)}>الرئيسية</Link>
        <Link to="/services" className="nav__link" onClick={() => setMobileOpen(false)}>الخدمات</Link>
        <Link to="/how-it-works" className="nav__link" onClick={() => setMobileOpen(false)}>كيف يعمل</Link>
        <Link to="/about" className="nav__link" onClick={() => setMobileOpen(false)}>من نحن</Link>
        {!isAuthenticated ? (
          <>
            <button className="nav__btn-ghost" onClick={() => { navigate('/auth?mode=login'); setMobileOpen(false); }}>
              <LogIn size={16} /> تسجيل الدخول
            </button>
            <button className="nav__btn-gold" onClick={() => { navigate('/auth?mode=register'); setMobileOpen(false); }}>
              <UserPlus size={16} /> حساب جديد
            </button>
          </>
        ) : (
          <button className="nav__btn-gold" onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}>
            لوحة التحكم
          </button>
        )}
      </div>
    </>
  );
}
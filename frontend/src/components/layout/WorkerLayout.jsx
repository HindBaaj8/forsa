import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { selectUser } from '../../features/auth/authSelectors';
import '../../styles/Dashboard.css';

export default function WorkerLayout({ children, title }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = useSelector(selectUser);
  const location = useLocation();

  // ✅ إغلاق القائمة عند تغيير الصفحة (للـ mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // ✅ كشف التمرير لتغيير الـ shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ منع التمرير خلف القائمة عندما تكون مفتوحة
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  return (
    <div className="worker-layout">
      {/* ✅ Overlay للـ mobile */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}
      
      <div className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <Sidebar role={user?.role} onClose={() => setMobileOpen(false)} />
      </div>
      
      <div className="worker-main">
        <div className={`topbar-wrapper ${scrolled ? 'scrolled' : ''}`}>
          <Topbar 
            title={title} 
            onMenuClick={() => setMobileOpen(!mobileOpen)}
            mobileMenuOpen={mobileOpen}
          />
        </div>
        <div className="page-content">
          {children}
        </div>
      </div>

      <style>{`
        .worker-layout {
          min-height: 100vh;
          background: var(--bg-primary, #f7f9fc);
          position: relative;
        }
        
        /* Sidebar Overlay pour mobile */
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 90;
          animation: fadeIn 0.3s ease;
        }
        
        /* Sidebar */
        .sidebar {
          position: fixed;
          top: 0;
          right: 0;
          width: 280px;
          height: 100vh;
          background: linear-gradient(180deg, var(--n800) 0%, var(--n700) 50%, var(--n900) 100%);
          display: flex;
          flex-direction: column;
          z-index: 100;
          overflow-y: auto;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s ease;
        }
        
        /* Desktop */
        .sidebar {
          transform: translateX(0);
        }
        
        /* Mobile */
        @media (max-width: 992px) {
          .sidebar {
            transform: translateX(100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .worker-main {
            margin-right: 0;
          }
        }
        
        /* Desktop margin */
        @media (min-width: 993px) {
          .worker-main {
            margin-right: 280px;
          }
        }
        
        /* Topbar */
        .topbar-wrapper {
          position: sticky;
          top: 0;
          z-index: 50;
          transition: box-shadow 0.3s ease;
        }
        
        .topbar-wrapper.scrolled {
          box-shadow: var(--sh-md);
        }
        
        /* Page Content */
        .page-content {
          padding: 24px;
          animation: fadeIn 0.3s ease;
        }
        
        @media (max-width: 768px) {
          .page-content {
            padding: 16px;
          }
        }
        
        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        /* Scrollbar pour sidebar */
        .sidebar::-webkit-scrollbar {
          width: 4px;
        }
        
        .sidebar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        
        .sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
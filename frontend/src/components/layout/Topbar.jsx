import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Bell, Menu, X, User } from 'lucide-react';
import { selectUser } from '../../features/auth/authSelectors';

export default function Topbar({ title, onMenuClick, notificationCount = 0, mobileMenuOpen = false }) {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="topbar">
      <div className="topbar__left">
        <button className="topbar__menu-btn" onClick={onMenuClick}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="topbar__title">{title}</div>
      </div>

      <div className="topbar__center">
        {/* Desktop Search */}
        <div className="topbar__search desktop-search">
          <Search size={18} />
          <input type="text" placeholder="ابحث عن خدمة، مهني..." />
          <button className="search-btn">بحث</button>
        </div>
      </div>

      <div className="topbar__right">
        {/* Mobile Search Toggle */}
        <button className="topbar__search-toggle" onClick={() => setSearchOpen(!searchOpen)}>
          <Search size={20} />
        </button>

        <div className="topbar__notif" onClick={() => navigate('/notifications')}>
          <Bell size={20} />
          {notificationCount > 0 && <div className="topbar__notif-dot">{notificationCount > 9 ? '9+' : notificationCount}</div>}
        </div>

        <div className="topbar__user" onClick={() => navigate('/worker/profile')}>
          <div className="topbar__user-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" />
            ) : (
              <User size={18} />
            )}
          </div>
          <span className="topbar__user-name">{user?.first_name}</span>
        </div>
      </div>

      {/* Mobile Search Modal */}
      {searchOpen && (
        <div className="topbar__search-mobile">
          <div className="topbar__search-mobile-header">
            <button onClick={() => setSearchOpen(false)}>
              <X size={24} />
            </button>
            <div className="topbar__search-mobile-input">
              <Search size={18} />
              <input type="text" placeholder="ابحث عن خدمة، مهني..." autoFocus />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .topbar {
          height: 70px;
          background: white;
          border-bottom: 1px solid var(--gray200);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          gap: 16px;
        }

        .topbar__left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .topbar__title {
          font-size: 20px;
          font-weight: 900;
          color: var(--text1);
        }

        .topbar__menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .topbar__menu-btn:hover {
          background: var(--gray100);
        }

        .topbar__center {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        /* Desktop Search */
        .topbar__search {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--gray50);
          border: 1px solid var(--gray200);
          border-radius: 50px;
          padding: 0 8px 0 16px;
          transition: all 0.2s;
          min-width: 400px;
        }

        .topbar__search:focus-within {
          border-color: var(--g500);
          box-shadow: 0 0 0 3px rgba(212, 160, 23, 0.1);
        }

        .topbar__search input {
          flex: 1;
          border: none;
          background: none;
          outline: none;
          padding: 12px 0;
          font-size: 14px;
        }

        .topbar__search input::placeholder {
          color: var(--gray400);
        }

        .search-btn {
          background: var(--n700);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 8px 20px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .search-btn:hover {
          background: var(--n800);
        }

        .topbar__right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .topbar__search-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
        }

        .topbar__search-toggle:hover {
          background: var(--gray100);
        }

        .topbar__notif {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--gray200);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .topbar__notif:hover {
          background: var(--gray50);
          transform: scale(1.05);
        }

        .topbar__notif-dot {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--error);
          color: white;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid white;
        }

        .topbar__user {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 40px;
          transition: all 0.2s;
        }

        .topbar__user:hover {
          background: var(--gray50);
        }

        .topbar__user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--g500), var(--g400));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--n900);
          overflow: hidden;
        }

        .topbar__user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .topbar__user-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text1);
        }

        /* Mobile Search Modal */
        .topbar__search-mobile {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          z-index: 200;
          animation: slideDown 0.3s ease;
        }

        .topbar__search-mobile-header {
          padding: 16px;
          border-bottom: 1px solid var(--gray200);
        }

        .topbar__search-mobile-input {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--gray50);
          border: 1px solid var(--gray200);
          border-radius: 50px;
          padding: 0 16px;
          margin-top: 12px;
        }

        .topbar__search-mobile-input input {
          flex: 1;
          border: none;
          background: none;
          outline: none;
          padding: 14px 0;
          font-size: 16px;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 992px) {
          .topbar__menu-btn {
            display: block;
          }

          .desktop-search {
            display: none !important;
          }

          .topbar__search-toggle {
            display: block;
          }

          .topbar__user-name {
            display: none;
          }

          .topbar__right {
            gap: 8px;
          }
        }

        @media (max-width: 480px) {
          .topbar {
            padding: 0 16px;
          }

          .topbar__title {
            font-size: 16px;
          }

          .topbar__notif {
            width: 36px;
            height: 36px;
          }

          .topbar__user-avatar {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </div>
  );
}
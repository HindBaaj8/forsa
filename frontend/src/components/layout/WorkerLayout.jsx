import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { selectUser } from '../../features/auth/authSelectors';

export default function WorkerLayout({ children, title }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useSelector(selectUser);

  return (
    <div className="worker-layout">
      <div className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <Sidebar role={user?.role} onClose={() => setMobileOpen(false)} />
      </div>
      <div className="worker-main">
        <Topbar title={title} onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
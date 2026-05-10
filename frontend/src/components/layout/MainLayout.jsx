// components/layout/MainLayout.jsx
import { useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ChatDrawer from '../chat/ChatDrawer';

export default function MainLayout({ children, title }) {
  const { user } = useSelector((state) => state.auth);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const layoutClass = user?.role === 'worker' ? 'worker-layout' : 'client-layout';
  const mainClass = user?.role === 'worker' ? 'worker-main' : 'client-main';

  return (
    <div className={layoutClass}>
      <Sidebar />
      <main className={mainClass}>
        <Topbar title={title} onChatToggle={() => setIsChatOpen(!isChatOpen)} />
        <div className="page-content">{children}</div>
      </main>
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} user={user} />
    </div>
  );
}
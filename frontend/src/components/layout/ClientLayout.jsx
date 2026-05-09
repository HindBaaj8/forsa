// components/layout/ClientLayout.jsx
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function ClientLayout({ children, title }) {
  return (
    <div className="client-layout">
      <Sidebar />
      <main className="client-main">
        <Topbar title={title} />
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
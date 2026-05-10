// components/layout/ClientLayout.jsx
import MainLayout from './MainLayout';

export default function ClientLayout({ children, title }) {
  return <MainLayout title={title}>{children}</MainLayout>;
}
// components/layout/WorkerLayout.jsx
import MainLayout from './MainLayout';

export default function WorkerLayout({ children, title }) {
  return <MainLayout title={title}>{children}</MainLayout>;
}
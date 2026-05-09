// src/components/admin/AdminBadge.jsx
export default function AdminBadge({ type, label }) {
  const map = { active:"active", pending:"pending", blocked:"blocked", progress:"progress", done:"done", worker:"worker", client:"client", admin:"admin" };
  const txt = { active:"● نشط", pending:"● معلق", blocked:"● محظور", progress:"● جاري", done:"● مكتمل" };
  return <span className={`badge badge-${map[type]||type}`}>{txt[type] || label}</span>;
}
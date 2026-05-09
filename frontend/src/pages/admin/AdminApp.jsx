// src/pages/admin/AdminApp.jsx
import { useState } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminRequests from './AdminRequests';
import AdminWorkers from './AdminWorkers';
import AdminCategories from './AdminCategories';
import AdminFinance from './AdminFinance';
import AdminSettings from './AdminSettings';
import AdminAlerts from './AdminAlerts';
import AdminChatModal from './AdminMessages';
export default function AdminApp() {
  const [page, setPage] = useState("dashboard");
  const { users, setUsers, requests, setRequests, workers, setWorkers, categories, setCategories } = useAdminData();

  const usersCount = users.length;
  const pendingRequestsCount = requests.filter(r => r.status === "pending").length;
  const pendingWorkersCount = workers.filter(w => w.status === "pending").length;

  const props = {
    page, 
    setPageState: setPage,
    users, 
    setUsers,
    requests, 
    setRequests,
    workers, 
    setWorkers,
    categories, 
    setCategories,
    usersCount, 
    pendingRequestsCount, 
    pendingWorkersCount
  };

  return (
    <>
      {page === "dashboard" && <AdminDashboard {...props} />}
      {page === "users" && <AdminUsers {...props} />}
      {page === "requests" && <AdminRequests {...props} />}
      {page === "workers" && <AdminWorkers {...props} />}
      {page === "categories" && <AdminCategories {...props} />}
      {page === "finance" && <AdminFinance {...props} />}
      {page === "settings" && <AdminSettings {...props} />}
      {page === "alerts" && <AdminAlerts {...props} />}
      {page === "chatmodal" && <AdminChatModal {...props}/>}
    </>
  );
}
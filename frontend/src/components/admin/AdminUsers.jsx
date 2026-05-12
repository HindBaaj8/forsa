import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, UserPlus, Edit, Trash2, Ban, CheckCircle, Eye } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { getUsers, banUser, activateUser, deleteUser } from '../../features/admin/adminSlice';
import { toast } from 'react-hot-toast';

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.admin);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(search.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(search.toLowerCase()) ||
                         user.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleBan = async (id) => {
    await dispatch(banUser(id));
    toast.success('تم حظر المستخدم');
  };

  const handleActivate = async (id) => {
    await dispatch(activateUser(id));
    toast.success('تم تفعيل المستخدم');
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      await dispatch(deleteUser(id));
      toast.success('تم حذف المستخدم');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <AdminLayout title="إدارة المستخدمين">
      <div className="page-header">
        <h1 className="page-header__title">المستخدمين</h1>
        <p className="page-header__sub">إدارة جميع مستخدمي المنصة</p>
      </div>

      <div className="users-toolbar">
        <div className="filters-row">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              className="search-inp" 
              placeholder="بحث..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="select-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">جميع الأدوار</option>
            <option value="client">عميل</option>
            <option value="worker">مهني</option>
            <option value="admin">مدير</option>
          </select>
          <select className="select-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="pending">معلق</option>
            <option value="blocked">محظور</option>
          </select>
        </div>
        <Button variant="gold" icon={UserPlus}>إضافة مستخدم</Button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>البريد</th>
                <th>الهاتف</th>
                <th>الدور</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers?.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="td-user">
                      <div className="td-av">{user.first_name?.[0]}{user.last_name?.[0]}</div>
                      <div>
                        <div className="td-name">{user.first_name} {user.last_name}</div>
                        <div className="td-sub">{user.city}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td><span className={`badge badge--${user.role}`}>{user.role === 'client' ? 'عميل' : user.role === 'worker' ? 'مهني' : 'مدير'}</span></td>
                  <td><span className={`badge badge--${user.status}`}>{user.status === 'active' ? 'نشط' : user.status === 'pending' ? 'معلق' : 'محظور'}</span></td>
                  <td>{user.created_at?.split('T')[0]}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn" onClick={() => { setSelectedUser(user); setModalOpen(true); }}><Eye size={16} /></button>
                      <button className="action-btn"><Edit size={16} /></button>
                      {user.status === 'blocked' ? (
                        <button className="action-btn success" onClick={() => handleActivate(user.id)}><CheckCircle size={16} /></button>
                      ) : (
                        <button className="action-btn warning" onClick={() => handleBan(user.id)}><Ban size={16} /></button>
                      )}
                      <button className="action-btn danger" onClick={() => handleDelete(user.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="تفاصيل المستخدم" size="lg">
        {selectedUser && (
          <div className="user-details">
            <div className="user-details__header">
              <div className="user-avatar-large">{selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}</div>
              <div>
                <h3>{selectedUser.first_name} {selectedUser.last_name}</h3>
                <p className="text-muted">{selectedUser.email}</p>
              </div>
            </div>
            <div className="user-details__grid">
              <div><strong>الهاتف:</strong> {selectedUser.phone || 'غير محدد'}</div>
              <div><strong>المدينة:</strong> {selectedUser.city || 'غير محدد'}</div>
              <div><strong>الدور:</strong> {selectedUser.role === 'client' ? 'عميل' : selectedUser.role === 'worker' ? 'مهني' : 'مدير'}</div>
              <div><strong>الحالة:</strong> {selectedUser.status}</div>
              <div><strong>تاريخ التسجيل:</strong> {selectedUser.created_at?.split('T')[0]}</div>
              <div><strong>آخر نشاط:</strong> {selectedUser.last_seen_at?.split('T')[0] || 'غير معروف'}</div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
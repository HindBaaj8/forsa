// src/components/admin/AdminUsers.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Edit, Trash2, Ban, CheckCircle, Eye, RefreshCw, Filter, X, Mail, Phone, MapPin, Calendar, Shield, AlertTriangle } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

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
    setConfirmModalOpen(false);
    await dispatch(banUser(id));
    toast.success('تم حظر المستخدم بنجاح');
    dispatch(getUsers());
  };

  const handleActivate = async (id) => {
    setConfirmModalOpen(false);
    await dispatch(activateUser(id));
    toast.success('تم تفعيل المستخدم بنجاح');
    dispatch(getUsers());
  };

  const handleDelete = async (id) => {
    setConfirmModalOpen(false);
    await dispatch(deleteUser(id));
    toast.success('تم حذف المستخدم بنجاح');
    dispatch(getUsers());
  };

  const handleRefresh = () => {
    dispatch(getUsers());
    toast.success('تم تحديث البيانات');
  };

  const openConfirmModal = (type, userId, userName) => {
    setActionType({ type, userId, userName });
    setConfirmModalOpen(true);
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return '👑';
      case 'worker': return '🔧';
      case 'client': return '👤';
      default: return '👤';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return { text: '🟢 نشط', class: 'badge--success' };
      case 'pending': return { text: '🟡 معلق', class: 'badge--warning' };
      case 'blocked': return { text: '🔴 محظور', class: 'badge--error' };
      default: return { text: '⚪ غير معروف', class: 'badge--info' };
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <AdminLayout title="إدارة المستخدمين">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="page-header">
          <motion.h1 
            className="page-header__title"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            👥 المستخدمين
          </motion.h1>
          <motion.p 
            className="page-header__sub"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            إدارة جميع مستخدمي المنصة
          </motion.p>
        </div>

        <motion.div 
          className="users-toolbar"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="filters-row">
            <div className="search-wrap">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                className="search-inp" 
                placeholder="بحث عن مستخدم..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <motion.button 
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter size={16} />
              {showFilters ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
            </motion.button>

            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  className="filters-group"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <select className="select-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="all">جميع الأدوار</option>
                    <option value="client">👤 عميل</option>
                    <option value="worker">🔧 مهني</option>
                    <option value="admin">👑 مدير</option>
                  </select>
                  <select className="select-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">جميع الحالات</option>
                    <option value="active">🟢 نشط</option>
                    <option value="pending">🟡 معلق</option>
                    <option value="blocked">🔴 محظور</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="gold" icon={UserPlus}>إضافة مستخدم</Button>
            </motion.div>
            
            <motion.button 
              className="refresh-btn"
              onClick={handleRefresh}
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <RefreshCw size={18} />
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card-title">
            <span>📋 قائمة المستخدمين</span>
            <span className="users-count">{filteredUsers?.length || 0} مستخدم</span>
          </div>
          
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
                <AnimatePresence>
                  {filteredUsers?.map((user, index) => {
                    const statusBadge = getStatusBadge(user.status);
                    return (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                      >
                        <td style={{ cursor: 'pointer' }} onClick={() => { setSelectedUser(user); setModalOpen(true); }}>
                          <div className="td-user">
                            <motion.div 
                              className="td-av"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </motion.div>
                            <div>
                              <div className="td-name">{user.first_name} {user.last_name}</div>
                              <div className="td-sub">{user.city || 'مدينة غير محددة'}</div>
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phone || 'غير محدد'}</td>
                        <td>
                          <motion.span 
                            className={`badge badge--${user.role}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {getRoleIcon(user.role)} {user.role === 'client' ? 'عميل' : user.role === 'worker' ? 'مهني' : 'مدير'}
                          </motion.span>
                        </td>
                        <td>
                          <motion.span 
                            className={`badge ${statusBadge.class}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {statusBadge.text}
                          </motion.span>
                        </td>
                        <td>{user.created_at?.split('T')[0]}</td>
                        <td>
                          <div className="action-buttons">
                            <motion.button 
                              className="action-btn"
                              onClick={() => { setSelectedUser(user); setModalOpen(true); }}
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.9 }}
                              title="عرض التفاصيل"
                            >
                              <Eye size={16} />
                            </motion.button>
                            <motion.button 
                              className="action-btn"
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.9 }}
                              title="تعديل"
                            >
                              <Edit size={16} />
                            </motion.button>
                            {user.status === 'blocked' ? (
                              <motion.button 
                                className="action-btn success"
                                onClick={() => openConfirmModal('activate', user.id, `${user.first_name} ${user.last_name}`)}
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                title="تفعيل المستخدم"
                              >
                                <CheckCircle size={16} />
                              </motion.button>
                            ) : user.status !== 'blocked' && user.role !== 'admin' ? (
                              <motion.button 
                                className="action-btn warning"
                                onClick={() => openConfirmModal('ban', user.id, `${user.first_name} ${user.last_name}`)}
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                title="حظر المستخدم"
                              >
                                <Ban size={16} />
                              </motion.button>
                            ) : null}
                            {user.role !== 'admin' && (
                              <motion.button 
                                className="action-btn danger"
                                onClick={() => openConfirmModal('delete', user.id, `${user.first_name} ${user.last_name}`)}
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                title="حذف المستخدم"
                              >
                                <Trash2 size={16} />
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* Modal تفاصيل المستخدم */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="تفاصيل المستخدم" size="lg">
        {selectedUser && (
          <motion.div 
            className="user-details"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="user-details__header">
              <motion.div 
                className="user-avatar-large"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
              </motion.div>
              <div>
                <h3>{selectedUser.first_name} {selectedUser.last_name}</h3>
                <p className="text-muted">{selectedUser.email}</p>
                <span className={`badge badge--${selectedUser.role} mt-2`}>
                  {getRoleIcon(selectedUser.role)} {selectedUser.role === 'client' ? 'عميل' : selectedUser.role === 'worker' ? 'مهني' : 'مدير'}
                </span>
              </div>
            </div>
            
            <div className="user-details__grid">
              <div>
                <strong><Mail size={14} /> البريد:</strong> 
                <p>{selectedUser.email}</p>
              </div>
              <div>
                <strong><Phone size={14} /> الهاتف:</strong> 
                <p>{selectedUser.phone || 'غير محدد'}</p>
              </div>
              <div>
                <strong><MapPin size={14} /> المدينة:</strong> 
                <p>{selectedUser.city || 'غير محدد'}</p>
              </div>
              <div>
                <strong><Calendar size={14} /> تاريخ التسجيل:</strong> 
                <p>{selectedUser.created_at?.split('T')[0]}</p>
              </div>
              <div>
                <strong><Shield size={14} /> الحالة:</strong> 
                <p>
                  <span className={`badge ${getStatusBadge(selectedUser.status).class}`}>
                    {getStatusBadge(selectedUser.status).text}
                  </span>
                </p>
              </div>
              <div>
                <strong>🆔 رقم المستخدم:</strong> 
                <p>#{selectedUser.id}</p>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn--ghost" onClick={() => setModalOpen(false)}>إغلاق</button>
              {selectedUser.status === 'blocked' ? (
                <button className="btn btn--success" onClick={() => {
                  setModalOpen(false);
                  openConfirmModal('activate', selectedUser.id, `${selectedUser.first_name} ${selectedUser.last_name}`);
                }}>
                  <CheckCircle size={16} /> تفعيل المستخدم
                </button>
              ) : selectedUser.role !== 'admin' ? (
                <button className="btn btn--warning" onClick={() => {
                  setModalOpen(false);
                  openConfirmModal('ban', selectedUser.id, `${selectedUser.first_name} ${selectedUser.last_name}`);
                }}>
                  <Ban size={16} /> حظر المستخدم
                </button>
              ) : null}
              {selectedUser.role !== 'admin' && (
                <button className="btn btn--danger" onClick={() => {
                  setModalOpen(false);
                  openConfirmModal('delete', selectedUser.id, `${selectedUser.first_name} ${selectedUser.last_name}`);
                }}>
                  <Trash2 size={16} /> حذف المستخدم
                </button>
              )}
            </div>
          </motion.div>
        )}
      </Modal>

      {/* Modal تأكيد الإجراء */}
      <Modal isOpen={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} title="تأكيد الإجراء" size="sm">
        {actionType && (
          <motion.div 
            className="confirm-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="confirm-icon">
              {actionType.type === 'ban' && <Ban size={48} color="#f59e0b" />}
              {actionType.type === 'activate' && <CheckCircle size={48} color="#10b981" />}
              {actionType.type === 'delete' && <AlertTriangle size={48} color="#ef4444" />}
            </div>
            <h3>
              {actionType.type === 'ban' && 'حظر المستخدم'}
              {actionType.type === 'activate' && 'تفعيل المستخدم'}
              {actionType.type === 'delete' && 'حذف المستخدم'}
            </h3>
            <p>
              هل أنت متأكد من {actionType.type === 'ban' ? 'حظر' : actionType.type === 'activate' ? 'تفعيل' : 'حذف'} المستخدم
              <br />
              <strong>"{actionType.userName}"</strong>؟
            </p>
            <div className="modal-actions">
              <button className="btn btn--ghost" onClick={() => setConfirmModalOpen(false)}>إلغاء</button>
              <button 
                className={`btn btn--${actionType.type === 'ban' ? 'warning' : actionType.type === 'activate' ? 'success' : 'danger'}`}
                onClick={() => {
                  if (actionType.type === 'ban') handleBan(actionType.userId);
                  else if (actionType.type === 'activate') handleActivate(actionType.userId);
                  else if (actionType.type === 'delete') handleDelete(actionType.userId);
                }}
              >
                تأكيد
              </button>
            </div>
          </motion.div>
        )}
      </Modal>
    </AdminLayout>
  );
}
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import WorkerLayout from '../layout/WorkerLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import { getWorkerSchedule, updateAppointmentStatus } from '../../features/worker/workerSlice';
import { toast } from 'react-hot-toast';

export default function WorkerSchedule() {
  const dispatch = useDispatch();
  const { schedule, isLoading } = useSelector((state) => state.worker);
  const [view, setView] = useState('upcoming');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    dispatch(getWorkerSchedule({ date: selectedDate, view }));
  }, [dispatch, selectedDate, view]);

  const handleStatus = async (id, status) => {
    await dispatch(updateAppointmentStatus({ id, status }));
    toast.success(status === 'confirmed' ? 'تم تأكيد الموعد' : 'تم إلغاء الموعد');
    dispatch(getWorkerSchedule({ date: selectedDate, view }));
  };

  const appointments = schedule?.appointments || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <WorkerLayout title="جدول المواعيد">
      <div className="page-header"><h1 className="page-header__title">جدول المواعيد</h1><p className="page-header__sub">مواعيدك القادمة مع العملاء</p></div>

      <div className="schedule-tabs"><button className={`schedule-tab ${view === 'upcoming' ? 'active' : ''}`} onClick={() => setView('upcoming')}>📅 المواعيد القادمة</button><button className={`schedule-tab ${view === 'past' ? 'active' : ''}`} onClick={() => setView('past')}>⏪ المواعيد السابقة</button></div>

      {view === 'upcoming' && (<div className="schedule-date-picker"><label>اختر التاريخ:</label><input type="date" className="form-input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ width: 'auto' }} /></div>)}

      {appointments.length === 0 ? (<div className="empty-state"><CalendarIcon size={48} /><p>لا توجد مواعيد</p></div>) : (
        <div className="schedule-list">{appointments.map(app => (<div key={app.id} className="schedule-card"><div className="schedule-card__header"><div className="schedule-card__client"><div className="schedule-card__client-av">{app.client_name?.[0]}</div><div><div className="schedule-card__client-name">{app.client_name}</div><div className="schedule-card__client-phone">📞 {app.client_phone}</div></div></div><Badge type={app.status}>{app.status === 'scheduled' ? 'مجدول' : app.status === 'confirmed' ? 'مؤكد' : 'مكتمل'}</Badge></div>
          <div className="schedule-card__details"><div><CalendarIcon size={16} /> {app.date}</div><div><Clock size={16} /> {app.time}</div><div><MapPin size={16} /> {app.address}</div></div>
          <div className="schedule-card__actions">{app.status === 'scheduled' && (<><button className="btn btn--success btn--sm" onClick={() => handleStatus(app.id, 'confirmed')}><CheckCircle size={14} /> تأكيد</button><button className="btn btn--danger btn--sm" onClick={() => handleStatus(app.id, 'cancelled')}><XCircle size={14} /> إلغاء</button></>)}</div></div>))}</div>
      )}
    </WorkerLayout>
  );
}
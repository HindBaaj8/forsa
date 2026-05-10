// pages/worker/WorkerSchedule.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWorkerSchedule, updateScheduleStatus } from '../../features/worker/workerSlice';
import WorkerLayout from '../../components/layout/WorkerLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
// pages/worker/WorkerSchedule.jsx
import { Link } from 'react-router-dom';  // ✅ أضف هذا السطر في أول الملف

export default function WorkerSchedule() {
  const dispatch = useDispatch();
  const { schedule, isLoading } = useSelector((state) => state.worker);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState('upcoming'); // upcoming, past, all

  useEffect(() => {
    dispatch(getWorkerSchedule({ date: selectedDate, view }));
  }, [dispatch, selectedDate, view]);

  const handleStatusUpdate = async (scheduleId, status) => {
    try {
      await dispatch(updateScheduleStatus({ id: scheduleId, status })).unwrap();
      toast.success('تم تحديث حالة الموعد');
      dispatch(getWorkerSchedule({ date: selectedDate, view }));
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <span className="badge badge--pending">📅 مجدول</span>;
      case 'confirmed':
        return <span className="badge badge--active">✅ مؤكد</span>;
      case 'completed':
        return <span className="badge badge--completed">🎉 مكتمل</span>;
      case 'cancelled':
        return <span className="badge badge--cancel">❌ ملغي</span>;
      default:
        return <span className="badge badge--pending">{status}</span>;
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const appointments = schedule?.appointments || [];

  return (
    <WorkerLayout title="جدول المواعيد">
      <div className="page-header">
        <div className="page-header__title">جدول المواعيد</div>
        <div className="page-header__sub">مواعيدك القادمة مع العملاء</div>
      </div>

      {/* View Tabs */}
      <div className="schedule-tabs">
        <button 
          className={`schedule-tab ${view === 'upcoming' ? 'active' : ''}`}
          onClick={() => setView('upcoming')}
        >
          📅 المواعيد القادمة
        </button>
        <button 
          className={`schedule-tab ${view === 'past' ? 'active' : ''}`}
          onClick={() => setView('past')}
        >
          ⏪ المواعيد السابقة
        </button>
        <button 
          className={`schedule-tab ${view === 'all' ? 'active' : ''}`}
          onClick={() => setView('all')}
        >
          📋 جميع المواعيد
        </button>
      </div>

      {/* Date Picker (for upcoming view) */}
      {view === 'upcoming' && (
        <div className="schedule-date-picker">
          <label>اختر التاريخ:</label>
          <input
            type="date"
            className="form-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: 'auto', minWidth: 200 }}
          />
        </div>
      )}

      {/* Schedule List */}
      {appointments.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>لا توجد مواعيد</div>
            <div style={{ color: 'var(--text3)' }}>
              {view === 'upcoming' 
                ? 'ستظهر هنا المواعيد القادمة بعد قبول الطلبات'
                : view === 'past'
                ? 'لا توجد مواعيد سابقة'
                : 'لم يتم جدولة أي مواعيد بعد'}
            </div>
          </div>
        </div>
      ) : (
        <div className="schedule-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="schedule-card">
              <div className="schedule-card__header">
                <div className="schedule-card__client">
                  <div className="schedule-card__client-av">
                    {appointment.client_name?.[0] || 'ع'}
                  </div>
                  <div>
                    <div className="schedule-card__client-name">{appointment.client_name}</div>
                    <div className="schedule-card__client-phone">📞 {appointment.client_phone}</div>
                  </div>
                </div>
                {getStatusBadge(appointment.status)}
              </div>

              <div className="schedule-card__body">
                <div className="schedule-card__service">
                  <div className="schedule-card__service-title">{appointment.service_name}</div>
                  <p className="schedule-card__service-desc">{appointment.description}</p>
                </div>

                <div className="schedule-card__details">
                  <div className="schedule-card__detail">
                    <span>📅</span>
                    <div>
                      <div className="schedule-card__detail-label">التاريخ</div>
                      <div>{appointment.date}</div>
                    </div>
                  </div>
                  <div className="schedule-card__detail">
                    <span>⏰</span>
                    <div>
                      <div className="schedule-card__detail-label">الوقت</div>
                      <div>{appointment.time}</div>
                    </div>
                  </div>
                  <div className="schedule-card__detail">
                    <span>📍</span>
                    <div>
                      <div className="schedule-card__detail-label">العنوان</div>
                      <div>{appointment.address}</div>
                    </div>
                  </div>
                  <div className="schedule-card__detail">
                    <span>💰</span>
                    <div>
                      <div className="schedule-card__detail-label">السعر</div>
                      <div className="schedule-card__price">{appointment.price} درهم</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="schedule-card__actions">
                {appointment.status === 'scheduled' && (
                  <>
                    <button 
                      className="btn btn--success btn--sm"
                      onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                    >
                      ✓ تأكيد الموعد
                    </button>
                    <button 
                      className="btn btn--danger btn--sm"
                      onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                    >
                      ✗ إلغاء الموعد
                    </button>
                  </>
                )}
                {appointment.status === 'confirmed' && (
                  <button 
                    className="btn btn--navy btn--sm"
                    onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                  >
                    🎉 إكمال الموعد
                  </button>
                )}
                {appointment.status === 'completed' && (
                  <Link to={`/worker/review/${appointment.order_id}`}>
                    <button className="btn btn--ghost btn--sm">
                      📝 عرض تقييم العميل
                    </button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .schedule-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--gray200);
          padding-bottom: 12px;
        }
        
        .schedule-tab {
          background: none;
          border: none;
          padding: 8px 20px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text3);
          cursor: pointer;
          border-radius: 30px;
          transition: all 0.2s;
        }
        
        .schedule-tab:hover {
          background: var(--n50);
          color: var(--n700);
        }
        
        .schedule-tab.active {
          background: var(--n700);
          color: white;
        }
        
        .schedule-date-picker {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding: 12px 16px;
          background: var(--white);
          border-radius: 12px;
          border: 1px solid var(--gray200);
        }
        
        .schedule-date-picker label {
          font-weight: 700;
          font-size: 14px;
          color: var(--text1);
        }
        
        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .schedule-card {
          background: var(--white);
          border: 1px solid var(--gray200);
          border-radius: 20px;
          padding: 20px;
          transition: all 0.2s;
        }
        
        .schedule-card:hover {
          box-shadow: var(--sh-md);
        }
        
        .schedule-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .schedule-card__client {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .schedule-card__client-av {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--n700), var(--n500));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
        }
        
        .schedule-card__client-name {
          font-size: 15px;
          font-weight: 700;
        }
        
        .schedule-card__client-phone {
          font-size: 12px;
          color: var(--text3);
          margin-top: 2px;
        }
        
        .schedule-card__body {
          margin-bottom: 16px;
        }
        
        .schedule-card__service {
          background: var(--n50);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 16px;
        }
        
        .schedule-card__service-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--n700);
          margin-bottom: 4px;
        }
        
        .schedule-card__service-desc {
          font-size: 13px;
          color: var(--text2);
          line-height: 1.5;
        }
        
        .schedule-card__details {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 12px 0;
          border-top: 1px solid var(--gray100);
          border-bottom: 1px solid var(--gray100);
        }
        
        .schedule-card__detail {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .schedule-card__detail > span {
          font-size: 20px;
        }
        
        .schedule-card__detail-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text3);
          text-transform: uppercase;
        }
        
        .schedule-card__price {
          font-size: 16px;
          font-weight: 800;
          color: var(--g500);
        }
        
        .schedule-card__actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        
        @media (max-width: 768px) {
          .schedule-card__details {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .schedule-card__actions {
            flex-direction: column;
          }
          
          .schedule-card__actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </WorkerLayout>
  );
}
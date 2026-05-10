// pages/client/ClientFavorites.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFavorites, removeFavorite } from '../../features/favorites/favoritesSlice';
import { startConversation } from '../../features/messages/messagesSlice';
import ClientLayout from '../../components/layout/ClientLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ClientFavorites() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { favorites, isLoading } = useSelector((state) => state.favorites);
  const [startingChat, setStartingChat] = useState(null);

  useEffect(() => {
    dispatch(getFavorites());
  }, [dispatch]);

  const handleRemoveFavorite = async (id) => {
    try {
      await dispatch(removeFavorite(id)).unwrap();
      toast.success('تم الإزالة من المفضلة');
    } catch (err) {
      toast.error(err.message || 'حدث خطأ');
    }
  };

  const handleContact = async (workerId, workerName) => {
    setStartingChat(workerId);
    try {
      // Start or get existing conversation
      const result = await dispatch(startConversation({ worker_id: workerId })).unwrap();
      // Navigate to messages page with the conversation
      navigate('/client/messages');
      toast.success(`تم بدء محادثة مع ${workerName}`);
    } catch (err) {
      toast.error('حدث خطأ في بدء المحادثة');
    } finally {
      setStartingChat(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <ClientLayout title="المفضلة">
      <div className="page-header">
        <div className="page-header__title">المهنيون المفضلون</div>
        <div className="page-header__sub">{favorites?.length || 0} مهني في قائمة المفضلة</div>
      </div>
      
      {favorites?.length === 0 ? (
        <div className="empty-state">
          <div style={{fontSize: 48, marginBottom: 16, opacity: 0.5}}>❤️</div>
          <div style={{fontWeight: 700, fontSize: 18, marginBottom: 8}}>لا توجد مهنيين مفضلين</div>
          <div style={{fontSize: 13, color: 'var(--text3)', marginBottom: 20}}>
            أضف المهنيين الذين تثق بهم إلى المفضلة للوصول السريع
          </div>
          <button className="btn btn--navy" onClick={() => navigate('/client/search')}>
            🔍 ابحث عن مهنيين
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {favorites?.map(worker => (
            <div key={worker.id} className="card" style={{transition: 'all 0.2s'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 14}}>
                <div className="badge badge--active">
                  <span>❤️</span> مفضّل
                </div>
                <button 
                  style={{
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: 18, 
                    color: 'var(--error)',
                    padding: '4px 8px',
                    borderRadius: 8,
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => handleRemoveFavorite(worker.id)}
                >
                  ✕
                </button>
              </div>
              
              <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14}}>
                <div className="job-av" style={{width: 48, height: 48, fontSize: 18, borderRadius: 14}}>
                  {worker.name?.[0] || worker.first_name?.[0] || 'م'}
                </div>
                <div>
                  <div style={{fontWeight: 800, fontSize: 15, color: 'var(--text1)', marginBottom: 2}}>
                    {worker.name || `${worker.first_name} ${worker.last_name}`}
                  </div>
                  <div style={{fontSize: 12, color: 'var(--text3)', fontWeight: 600}}>
                    {worker.specialty || worker.role} · 📍 {worker.city}
                  </div>
                  <div style={{fontSize: 12, color: 'var(--g500)', fontWeight: 700, marginTop: 2}}>
                    ⭐ {worker.rating || '4.5'} ({worker.total_reviews || 0} تقييم)
                  </div>
                </div>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10}}>
                <span style={{fontWeight: 800, color: 'var(--n700)', fontSize: 14}}>
                  {worker.price ? `${worker.price} درهم/ساعة` : 'احصل على عرض سعر'}
                </span>
                <button 
                  className="btn btn--navy btn--sm" 
                  onClick={() => handleContact(worker.id, worker.name)}
                  disabled={startingChat === worker.id}
                >
                  {startingChat === worker.id ? 'جاري...' : 'تواصل →'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ClientLayout>
  );
}
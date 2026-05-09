// pages/client/ClientFavorites.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFavorites, removeFavorite } from '../../features/favorites/favoritesSlice';
import ClientLayout from '../../components/layout/ClientLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ClientFavorites() {
  const dispatch = useDispatch();
  const { favorites, isLoading } = useSelector((state) => state.favorites);

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

  const handleContact = (workerId) => {
    // TODO: Implement contact logic
    console.log('Contact worker:', workerId);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <ClientLayout title="المفضلة">
      <div className="page-header">
        <div className="page-header__title">المهنيون المفضلون</div>
        <div className="page-header__sub">{favorites?.length || 0} مهني في قائمة المفضلة</div>
      </div>
      <div className="grid-3">
        {favorites?.map(worker => (
          <div key={worker.id} className="card">
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 14}}>
              <div className="badge badge--active">مفضّل ❤️</div>
              <button 
                style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--error)'}}
                onClick={() => handleRemoveFavorite(worker.id)}
              >
                ✕
              </button>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14}}>
              <div className="job-av" style={{width: 48, height: 48, fontSize: 18, borderRadius: 14}}>
                {worker.name?.[0] || 'م'}
              </div>
              <div>
                <div style={{fontWeight: 800, fontSize: 15, color: 'var(--text1)', marginBottom: 2}}>{worker.name}</div>
                <div style={{fontSize: 12, color: 'var(--text3)', fontWeight: 600}}>{worker.role} · 📍 {worker.city}</div>
                <div style={{fontSize: 12, color: 'var(--g500)', fontWeight: 700, marginTop: 2}}>⭐ {worker.rating}</div>
              </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontWeight: 800, color: 'var(--n700)', fontSize: 14}}>{worker.price}</span>
              <button 
                className="btn btn--navy btn--sm" 
                onClick={() => handleContact(worker.id)}
              >
                تواصل →
              </button>
            </div>
          </div>
        ))}
      </div>
      {favorites?.length === 0 && (
        <div className="empty-state">
          <div style={{fontSize: 40, marginBottom: 12}}>❤️</div>
          <div style={{fontWeight: 700}}>لا توجد مهنيين مفضلين</div>
          <div style={{fontSize: 13, color: 'var(--text3)', marginTop: 8}}>
            أضف المهنيين الذين تثق بهم إلى المفضلة للوصول السريع
          </div>
        </div>
      )}
    </ClientLayout>
  );
}
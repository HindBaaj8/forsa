import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, Trash2, MessageCircle, Star } from 'lucide-react';
import ClientLayout from '../layout/ClientLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import { getFavorites, removeFavorite } from '../../features/client/clientSlice';
import { toast } from 'react-hot-toast';

export default function ClientFavorites() {
  const dispatch = useDispatch();
  const { favorites, isLoading } = useSelector((state) => state.client);

  useEffect(() => {
    dispatch(getFavorites());
  }, [dispatch]);

  const handleRemove = async (id, name) => {
    if (window.confirm(`هل أنت متأكد من إزالة ${name} من المفضلة؟`)) {
      await dispatch(removeFavorite(id));
      toast.success('تم الإزالة من المفضلة');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <ClientLayout title="المفضلة">
      <div className="page-header">
        <h1 className="page-header__title">المهنيون المفضلون</h1>
        <p className="page-header__sub">{favorites?.length || 0} مهني في قائمة المفضلة</p>
      </div>

      {favorites?.length === 0 ? (
        <div className="empty-state"><Heart size={48} /><h3>لا توجد مهنيين مفضلين</h3><p>أضف المهنيين الذين تثق بهم إلى المفضلة</p><Link to="/client/search"><button className="btn btn--navy">🔍 ابحث عن مهنيين</button></Link></div>
      ) : (
        <div className="favorites-grid">
          {favorites?.map(worker => (
            <div key={worker.id} className="favorite-card">
              <div className="favorite-card__header">
                <div className="favorite-card__avatar">{worker.name?.[0] || worker.first_name?.[0]}</div>
                <div><div className="favorite-card__name">{worker.name || `${worker.first_name} ${worker.last_name}`}</div><div className="favorite-card__profession">{worker.profession || 'مهني'}</div></div>
                <button className="favorite-card__remove" onClick={() => handleRemove(worker.id, worker.name)}><Trash2 size={16} /></button>
              </div>
              <div className="favorite-card__info"><span>📍 {worker.city}</span><span><Star size={14} /> {worker.rating || 4.5}</span></div>
              <div className="favorite-card__actions">
                <Link to={`/client/messages?worker=${worker.id}`}><button className="btn btn--navy btn--sm"><MessageCircle size={14} /> تواصل</button></Link>
                <Link to={`/worker/${worker.id}`}><button className="btn btn--ghost btn--sm">عرض الملف</button></Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </ClientLayout>
  );
}
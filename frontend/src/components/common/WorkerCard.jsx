import React from 'react';
import { Star, MapPin, Briefcase, MessageCircle, Heart } from 'lucide-react';

export default function WorkerCard({ 
  worker, 
  service, 
  isFavorite = false,
  onContact, 
  onFavorite,
  showActions = true
}) {
  // استخراج البيانات من worker أو service
  const data = worker || service?.worker || service;
  const title = service?.title || data?.profession || 'خدمة';
  const name = data?.first_name ? `${data.first_name} ${data.last_name || ''}` : data?.name || 'عامل';
  const rating = data?.rating || service?.rating || 0;
  const location = service?.location || data?.location || 'غير محدد';
  const price = service?.price || data?.price;
  const completedOrders = data?.completed_orders || service?.completed_orders || 0;
  
  return (
    <div className="worker-result-card">
      <div className="worker-result-header">
        <div className="worker-avatar">
          {name.charAt(0)}
        </div>
        <div className="worker-info-header">
          <div className="worker-name">
            {name}
            {/* ✅ badge premium */}
            {data?.is_premium && (
              <span className="premium-badge" title="عضو مميز">
                ⭐ Premium
              </span>
            )}
          </div>
          <div className="worker-profession">{title}</div>
        </div>
        <div className="worker-rating">
          <Star size={14} /> {rating}
        </div>
      </div>
      
      <div className="worker-info">
        <span><MapPin size={14} /> {location}</span>
        <span><Briefcase size={14} /> {completedOrders} طلب</span>
      </div>
      
      {service?.description && (
        <div className="worker-bio">
          {service.description.substring(0, 100)}...
        </div>
      )}
      
      {price && (
        <div className="worker-price">{price} درهم</div>
      )}
      
      {showActions && (
        <div className="worker-actions">
          {onContact && (
            <button 
              className="btn btn--navy btn--sm"
              onClick={onContact}
            >
              <MessageCircle size={14} /> تواصل الآن
            </button>
          )}
          {onFavorite && (
            <button 
              className={`btn btn--sm ${isFavorite ? 'btn--danger' : 'btn--ghost'}`}
              onClick={onFavorite}
            >
              <Heart size={14} /> {isFavorite ? 'مفضل' : 'حفظ'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
// components/client/ClientSearch.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Star, MapPin, Briefcase, MessageCircle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../layout/ClientLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import '../../styles/Dashboard.css';

export default function ClientSearch() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // جلب الخدمات مع منع الكاش
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        _: Date.now() // ✅ منع الكاش
      };
      if (searchTerm) params.search = searchTerm;
      if (category) params.category_id = category;
      if (city) params.city = city;
      
      const response = await api.get('/services', { params });
      console.log('📦 Services response:', response.data);
      
      // ✅ استخراج الخدمات بالشكل الصحيح
      let servicesData = [];
      if (response.data?.data?.data) {
        servicesData = response.data.data.data;
      } else if (response.data?.data) {
        servicesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        servicesData = response.data;
      } else {
        servicesData = [];
      }
      
      setServices(servicesData);
      console.log('✅ Services loaded:', servicesData.length);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('حدث خطأ في تحميل الخدمات');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, category, city]);

  // جلب الفلاتر
  const fetchFilters = async () => {
    try {
      const categoriesRes = await api.get('/categories');
      setCategories(categoriesRes.data || []);
      
      const servicesRes = await api.get('/services');
      let servicesList = [];
      if (servicesRes.data?.data?.data) {
        servicesList = servicesRes.data.data.data;
      } else if (servicesRes.data?.data) {
        servicesList = servicesRes.data.data;
      } else if (Array.isArray(servicesRes.data)) {
        servicesList = servicesRes.data;
      }
      
      const citiesList = [...new Set(servicesList.map(s => s.location).filter(Boolean))];
      setCities(citiesList);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  // جلب المفضلة
  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  // التواصل مع المهني
  const handleContact = async (workerId, workerName) => {
    if (!user) {
      toast.error('الرجاء تسجيل الدخول أولاً');
      navigate('/auth?mode=login');
      return;
    }
    
    if (!workerId) {
      toast.error('بيانات العامل غير مكتملة');
      return;
    }
    
    console.log('📤 Starting conversation with:', { workerId, workerName });
    
    try {
      await api.post('/conversations', { worker_id: Number(workerId) });
      toast.success(`تم بدء محادثة مع ${workerName}`);
      navigate('/client/messages');
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('حدث خطأ في بدء المحادثة');
    }
  };

  // إضافة/إزالة من المفضلة
  const handleFavorite = async (workerId) => {
    if (!user) {
      toast.error('الرجاء تسجيل الدخول أولاً');
      navigate('/auth?mode=login');
      return;
    }
    
    const isFavorite = favorites.some(f => (f.worker_id || f.id) === workerId);
    
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${workerId}`);
        setFavorites(favorites.filter(f => (f.worker_id || f.id) !== workerId));
        toast.success('تم الإزالة من المفضلة');
      } else {
        const response = await api.post(`/favorites/${workerId}`);
        setFavorites([...favorites, response.data?.data || response.data]);
        toast.success('تم الإضافة إلى المفضلة');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('حدث خطأ');
    }
  };

  // التحقق من المفضلة
  const isFavorite = (workerId) => {
    return favorites.some(f => (f.worker_id || f.id) === workerId);
  };

  // تحديث يدوي
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    await fetchFavorites();
    setRefreshing(false);
    toast.success('تم تحديث الخدمات');
  };

  useEffect(() => {
    fetchServices();
    fetchFilters();
    fetchFavorites();
  }, []);

  // تحديث عند تغيير الفلاتر
  useEffect(() => {
    fetchServices();
  }, [category, city]);

  // بحث مع تأخير
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') fetchServices();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (loading) return <LoadingSpinner />;

  return (
    <ClientLayout title="البحث عن خدمات">
      <div className="search-hero">
        <h1>ابحث عن أفضل المهنيين</h1>
        <p>آلاف المهنيين في انتظار خدمتك</p>
        <div className="search-box-large">
          <input 
            type="text" 
            placeholder="عن أي خدمة تبحث؟ كهربائي، سباك، مصمم..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn--gold" onClick={fetchServices}>
            <Search size={18} /> بحث
          </button>
          <button 
            className="btn btn--ghost" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            🔄 {refreshing ? 'جاري التحديث...' : 'تحديث'}
          </button>
        </div>
      </div>

      <div className="search-filters">
        <div className="filters-panel">
          <select 
            className="filter-select" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">جميع الفئات</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
          <select 
            className="filter-select" 
            value={city} 
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">جميع المدن</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn btn--navy btn--sm" onClick={fetchServices}>
            تطبيق
          </button>
        </div>
      </div>

      <div className="workers-results">
        <div className="results-count">
          {services.length} خدمة متاحة
          <button onClick={handleRefresh} className="refresh-btn" disabled={refreshing}>
            🔄
          </button>
        </div>
        <div className="workers-grid">
          {services.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48 }}>🔍</div>
              <h3>لا توجد خدمات</h3>
              <p>حاول البحث بكلمات مختلفة</p>
              <button onClick={handleRefresh} className="btn btn--navy">
                🔄 تحديث
              </button>
            </div>
          ) : (
            services.map(service => (
              <div key={service.id} className="worker-result-card">
                <div className="worker-result-header">
                  <div className="worker-avatar">
                    {service.worker?.first_name?.[0] || service.worker?.first_name?.charAt(0) || 'م'}
                  </div>
                  <div>
                    <div className="worker-name">
                      {service.worker?.first_name || 'عامل'} {service.worker?.last_name || ''}
                    </div>
                    <div className="worker-profession">{service.category?.name || 'خدمة'}</div>
                  </div>
                  <div className="worker-rating">
                    <Star size={14} /> {service.worker?.rating || service.rating || 0}
                  </div>
                </div>
                <div className="worker-info">
                  <span><MapPin size={14} /> {service.location || service.city || 'غير محدد'}</span>
                  <span><Briefcase size={14} /> {service.worker?.completed_orders || 0} طلب</span>
                </div>
                <div className="worker-bio">{service.description?.substring(0, 100) || 'لا يوجد وصف'}...</div>
                <div className="worker-price">{service.price || service.budget} درهم</div>
                <div className="worker-actions">
                  <button 
                    className="btn btn--navy btn--sm"
                    onClick={() => handleContact(service.worker_id || service.worker?.id, service.worker?.first_name || 'العامل')}
                  >
                    <MessageCircle size={14} /> تواصل الآن
                  </button>
                  <button 
                    className={`btn btn--sm ${isFavorite(service.worker_id || service.worker?.id) ? 'btn--danger' : 'btn--ghost'}`}
                    onClick={() => handleFavorite(service.worker_id || service.worker?.id)}
                  >
                    <Heart size={14} /> {isFavorite(service.worker_id || service.worker?.id) ? 'مفضل' : 'حفظ'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .refresh-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          margin-left: 10px;
          padding: 4px 8px;
          border-radius: 8px;
          transition: all 0.3s;
        }
        .refresh-btn:hover {
          background: #f0f0f0;
        }
        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .search-box-large {
          display: flex;
          gap: 10px;
        }
        .search-box-large input {
          flex: 1;
        }
      `}</style>
    </ClientLayout>
  );
}
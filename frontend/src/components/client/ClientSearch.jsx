// components/client/ClientSearch.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Star, MapPin, Briefcase, MessageCircle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../layout/ClientLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import ServicesMap from './ServicesMap';
import WorkerCard from '../common/WorkerCard';
import '../../styles/Dashboard.css';

export default function ClientSearch() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [viewMode, setViewMode] = useState('list');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // جلب الخدمات
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (category) params.category_id = category;
      if (city) params.city = city;
      
      const response = await api.get('/services', { params });
      
      let servicesData = [];
      if (response.data?.data?.data) {
        servicesData = response.data.data.data;
      } else if (response.data?.data) {
        servicesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        servicesData = response.data;
      }
      
      setServices(servicesData);
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

  const isFavorite = (workerId) => {
    return favorites.some(f => (f.worker_id || f.id) === workerId);
  };

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

  useEffect(() => {
    fetchServices();
  }, [category, city]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') fetchServices();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ✅ معالجة اختيار خدمة من الخريطة
  const handleServiceSelect = (service) => {
    console.log('Service selected from map:', service);
    toast.success(`تم اختيار: ${service.title}`);
  };

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

      {/* ✅ أزرار تبديل العرض */}
      <div className="view-toggle" style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'flex-end' }}>
        <button 
          className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} 
          onClick={() => setViewMode('list')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            background: viewMode === 'list' ? '#2c3e50' : 'white',
            color: viewMode === 'list' ? 'white' : '#333',
            cursor: 'pointer'
          }}
        >
          📋 قائمة
        </button>
        <button 
          className={`view-btn ${viewMode === 'map' ? 'active' : ''}`} 
          onClick={() => setViewMode('map')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            background: viewMode === 'map' ? '#2c3e50' : 'white',
            color: viewMode === 'map' ? 'white' : '#333',
            cursor: 'pointer'
          }}
        >
          🗺️ خريطة
        </button>
      </div>

      {/* عرض حسب الوضع المختار */}
      {viewMode === 'map' ? (
        <ServicesMap 
          categoryId={category || null}
          searchTerm={searchTerm || ''}
          onServiceSelect={handleServiceSelect}
        />
      ) : (
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
                <WorkerCard
                  key={service.id}
                  worker={service.worker || service.user}
                  service={service}
                  isFavorite={isFavorite(service.worker_id || service.user_id)}
                  onContact={() => handleContact(
                    service.worker_id || service.user_id, 
                    service.worker?.first_name || service.user?.first_name
                  )}
                  onFavorite={() => handleFavorite(service.worker_id || service.user_id)}
                  showActions={true}
                />
              ))
            )}
          </div>
        </div>
      )}
    </ClientLayout>
  );
}
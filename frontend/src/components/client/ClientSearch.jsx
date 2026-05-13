// components/client/ClientSearch.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Filter, Star, MapPin, Briefcase, Phone, Mail, Heart, MessageCircle } from 'lucide-react';
import ClientLayout from '../layout/ClientLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import '../../styles/Dashboard.css';

export default function ClientSearch() {
  const dispatch = useDispatch();
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

  useEffect(() => {
    fetchServices();
    fetchFilters();
    fetchFavorites();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (category) params.category_id = category;
      if (city) params.city = city;
      
      const response = await api.get('/services', { params });
      const servicesData = response.data?.data?.data || [];
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('حدث خطأ في تحميل الخدمات');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const categoriesRes = await api.get('/categories');
      setCategories(categoriesRes.data);
      
      const servicesRes = await api.get('/services');
      const servicesList = servicesRes.data?.data?.data || [];
      const citiesList = [...new Set(servicesList.map(s => s.location).filter(Boolean))];
      setCities(citiesList);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  // ✅ دالة التواصل مع المهني
  const handleContact = async (workerId, workerName) => {
    if (!user) {
      toast.error('الرجاء تسجيل الدخول أولاً');
      navigate('/auth?mode=login');
      return;
    }
    
    try {
      // إنشاء محادثة جديدة
      const response = await api.post('/conversations', { worker_id: workerId });
      const conversation = response.data?.data || response.data;
      
      toast.success(`تم بدء محادثة مع ${workerName}`);
      navigate('/client/messages');
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('حدث خطأ في بدء المحادثة');
    }
  };

  // ✅ دالة إضافة/إزالة من المفضلة
  const handleFavorite = async (workerId) => {
    if (!user) {
      toast.error('الرجاء تسجيل الدخول أولاً');
      navigate('/auth?mode=login');
      return;
    }
    
    const isFavorite = favorites.some(f => f.worker_id === workerId || f.id === workerId);
    
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

  // ✅ دالة التحقق من المفضلة
  const isFavorite = (workerId) => {
    return favorites.some(f => (f.worker_id || f.id) === workerId);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') fetchServices();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchServices();
  }, [category, city]);

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
        <div className="results-count">{services.length} خدمة متاحة</div>
        <div className="workers-grid">
          {services.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48 }}>🔍</div>
              <h3>لا توجد خدمات</h3>
              <p>حاول البحث بكلمات مختلفة</p>
            </div>
          ) : (
            services.map(service => (
              <div key={service.id} className="worker-result-card">
                <div className="worker-result-header">
                  <div className="worker-avatar">
                    {service.worker?.first_name?.[0] || 'م'}
                  </div>
                  <div>
                    <div className="worker-name">
                      {service.worker?.first_name} {service.worker?.last_name}
                    </div>
                    <div className="worker-profession">{service.category?.name}</div>
                  </div>
                  <div className="worker-rating">
                    <Star size={14} /> {service.worker?.rating || 0}
                  </div>
                </div>
                <div className="worker-info">
                  <span><MapPin size={14} /> {service.location}</span>
                  <span><Briefcase size={14} /> {service.worker?.completed_orders || 0} طلب</span>
                </div>
                <div className="worker-bio">{service.description?.substring(0, 100)}...</div>
                <div className="worker-price">{service.price} درهم/ساعة</div>
                <div className="worker-actions">
                  <button 
                    className="btn btn--navy btn--sm"
                    onClick={() => handleContact(service.worker_id, service.worker?.first_name)}
                  >
                    <MessageCircle size={14} /> تواصل
                  </button>
                  <button 
                    className={`btn btn--sm ${isFavorite(service.worker_id) ? 'btn--danger' : 'btn--ghost'}`}
                    onClick={() => handleFavorite(service.worker_id)}
                  >
                    <Heart size={14} /> {isFavorite(service.worker_id) ? 'مفضل' : 'حفظ'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
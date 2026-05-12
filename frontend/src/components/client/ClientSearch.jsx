import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Filter, Star, MapPin, Briefcase } from 'lucide-react';
import ClientLayout from '../layout/ClientLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import { searchWorkers, getFilters } from '../../features/client/clientSlice';
import '../../styles/Client.css'; // فقط إذا styles داخل components
export default function ClientSearch() {
  const dispatch = useDispatch();
  const { workers, filters, isLoading } = useSelector((state) => state.client);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(getFilters());
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(searchWorkers({ query: searchQuery, category, city }));
  };

  useEffect(() => {
    handleSearch();
  }, [category, city]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <ClientLayout title="البحث عن خدمات">
      <div className="search-hero">
        <h1>ابحث عن أفضل المهنيين</h1>
        <p>آلاف المهنيين في انتظار خدمتك</p>
        <div className="search-box-large">
          <input type="text" placeholder="عن أي خدمة تبحث؟ كهربائي، سباك، مصمم..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
          <button className="btn btn--gold" onClick={handleSearch}><Search size={18} /> بحث</button>
        </div>
      </div>

      <div className="search-filters">
        <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}><Filter size={16} /> {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}</button>
        {showFilters && (
          <div className="filters-panel">
            <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">جميع الفئات</option>{filters?.categories?.map(c => <option key={c} value={c}>{c}</option>)}</select>
            <select className="filter-select" value={city} onChange={(e) => setCity(e.target.value)}><option value="">جميع المدن</option>{filters?.cities?.map(c => <option key={c} value={c}>{c}</option>)}</select>
          </div>
        )}
      </div>

      <div className="workers-results">
        <div className="results-count">{workers?.length} مهني متاح</div>
        <div className="workers-grid">
          {workers?.map(worker => (
            <div key={worker.id} className="worker-result-card">
              <div className="worker-result-header">
                <div className="worker-avatar">{worker.name?.[0] || worker.first_name?.[0]}</div>
                <div><div className="worker-name">{worker.name || `${worker.first_name} ${worker.last_name}`}</div><div className="worker-profession">{worker.profession || worker.category}</div></div>
                <div className="worker-rating"><Star size={14} /> {worker.rating || 4.5}</div>
              </div>
              <div className="worker-info"><MapPin size={14} /> {worker.city}<Briefcase size={14} /> {worker.completed_orders || 0} طلب</div>
              <div className="worker-bio">{worker.bio?.substring(0, 100)}...</div>
              <div className="worker-price">من {worker.price || 100} درهم/ساعة</div>
              <div className="worker-actions"><button className="btn btn--navy btn--sm">تواصل</button><button className="btn btn--ghost btn--sm">❤️ حفظ</button></div>
            </div>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
}
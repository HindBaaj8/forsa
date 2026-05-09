// pages/client/ClientSearch.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchWorkers, getFilters } from '../../features/workers/workersSlice';
import ClientLayout from '../../components/layout/ClientLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ClientSearch() {
  const dispatch = useDispatch();
  const { workers, filters, isLoading } = useSelector((state) => state.workers);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('الكل');
  const [city, setCity] = useState('');

  useEffect(() => {
    dispatch(getFilters());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(searchWorkers({ query: q, category: cat, city }));
    }, 500);
    return () => clearTimeout(timer);
  }, [q, cat, city, dispatch]);

  const handleContact = (workerId) => {
    // TODO: Implement contact logic
    console.log('Contact worker:', workerId);
  };

  if (isLoading && workers.length === 0) return <LoadingSpinner />;

  return (
    <ClientLayout title="البحث عن خدمة">
      <div style={{display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap'}}>
        <div className="field-wrap" style={{flex: 1, minWidth: 200}}>
          <span className="field-icon">🔍</span>
          <input 
            className="form-input" 
            placeholder="ابحث باسم المهني أو نوع الخدمة..."
            value={q} 
            onChange={e => setQ(e.target.value)} 
            style={{paddingRight: 44}} 
          />
        </div>
        <select 
          className="form-input" 
          style={{flex: '0 0 160px', paddingRight: 14, cursor: 'pointer'}}
          value={city} 
          onChange={e => setCity(e.target.value)}
        >
          <option value="">كل المدن</option>
          {filters.cities?.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div style={{display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap'}}>
        {filters.categories?.map(c => (
          <button 
            key={c} 
            onClick={() => setCat(c)}
            className={`category-chip ${cat === c ? 'active' : ''}`}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid-2">
            {workers?.map((worker, i) => (
              <div key={i} className="svc-card-client">
                <div className="svc-card-client__top">
                  <span className="svc-card-client__cat">{worker.role}</span>
                  {worker.urgent && <span className="svc-card-client__urgent">🔴 متاح الآن</span>}
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12}}>
                  <div className="job-av" style={{width: 48, height: 48, fontSize: 18, borderRadius: 14}}>
                    {worker.name?.[0] || 'م'}
                  </div>
                  <div>
                    <div className="svc-card-client__title" style={{marginBottom: 2}}>{worker.name}</div>
                    <div style={{fontSize: 12, color: 'var(--text3)', fontWeight: 600}}>
                      📍 {worker.city} · ⭐ {worker.rating} ({worker.reviews} تقييم)
                    </div>
                  </div>
                </div>
                <div className="svc-card-client__meta">
                  {worker.tags?.map(t => <span key={t}>{t}</span>)}
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span className="svc-card-client__price">{worker.price}</span>
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
          {workers?.length === 0 && (
            <div className="empty-state">
              <div style={{fontSize: 40, marginBottom: 12}}>🔍</div>
              <div style={{fontWeight: 700}}>لم نجد نتائج — جرّب كلمات بحث أخرى</div>
            </div>
          )}
        </>
      )}
    </ClientLayout>
  );
}
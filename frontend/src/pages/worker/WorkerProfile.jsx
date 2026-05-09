// pages/worker/WorkerProfile.jsx
import { useSelector } from 'react-redux';
import WorkerLayout from '../../components/layout/WorkerLayout';

export default function WorkerProfile() {
  const { user } = useSelector((state) => state.auth);
  
  return (
    <WorkerLayout title="الملف الشخصي">
      <div className="page-header">
        <div className="page-header__title">الملف الشخصي</div>
        <div className="page-header__sub">معلوماتك الشخصية والمهنية</div>
      </div>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #1e3a6e, #2e5ba8)',
            color: 'white', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 24, fontWeight: 'bold'
          }}>
            {user?.first_name?.[0] || user?.last_name?.[0] || 'م'}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{user?.first_name} {user?.last_name}</div>
            <div style={{ color: 'var(--text3)' }}>كهربائي معتمد</div>
            <div style={{ color: 'var(--g500)', fontSize: 13, marginTop: 4 }}>⭐ 4.8 (156 تقييم)</div>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">الاسم الأول</label>
            <input className="form-input" defaultValue={user?.first_name || ''} />
          </div>
          <div className="form-group">
            <label className="form-label">الاسم الأخير</label>
            <input className="form-input" defaultValue={user?.last_name || ''} />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">البريد الإلكتروني</label>
          <input className="form-input" value={user?.email || ''} disabled />
        </div>
        
        <div className="form-group">
          <label className="form-label">رقم الهاتف</label>
          <input className="form-input" defaultValue={user?.phone || ''} />
        </div>
        
        <div className="form-group">
          <label className="form-label">المدينة</label>
          <input className="form-input" defaultValue={user?.city || ''} />
        </div>
        
        <div className="form-group">
          <label className="form-label">المهنة</label>
          <input className="form-input" defaultValue="كهربائي معتمد" />
        </div>
        
        <div className="form-group">
          <label className="form-label">سنوات الخبرة</label>
          <input className="form-input" defaultValue="5" type="number" />
        </div>
        
        <div className="form-group">
          <label className="form-label">وصف الخدمات</label>
          <textarea className="form-input" rows="3" defaultValue="متخصص في تركيب وصيانة جميع أنواع المكيفات والأنظمة الكهربائية" />
        </div>
        
        <button className="btn btn--navy">حفظ التغييرات</button>
      </div>
    </WorkerLayout>
  );
}
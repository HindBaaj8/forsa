import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Camera, Star, Briefcase, MapPin, Phone, Mail } from 'lucide-react';
import WorkerLayout from '../layout/WorkerLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import Input from '../common/Input';
import Button from '../common/Button';
import { updateWorkerProfile } from '../../features/worker/workerSlice';
import { toast } from 'react-hot-toast';

export default function WorkerProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.worker);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '', city: '', profession: '', experience: '', bio: '' });

  useEffect(() => {
    if (user) setFormData({ first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || '', city: user.city || '', profession: user.profession || '', experience: user.experience || '', bio: user.bio || '' });
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    await dispatch(updateWorkerProfile(formData));
    toast.success('تم تحديث الملف الشخصي');
    setLoading(false);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <WorkerLayout title="الملف الشخصي">
      <div className="profile-grid">
        <div className="profile-sidebar">
          <div className="profile-avatar"><div className="profile-avatar-large">{user?.first_name?.[0]}{user?.last_name?.[0]}</div><button className="profile-avatar-upload"><Camera size={16} /></button></div>
          <div className="profile-name">{user?.first_name} {user?.last_name}</div>
          <div className="profile-profession">{formData.profession || 'مهني'}</div>
          <div className="profile-rating"><Star size={14} /> {user?.rating || 0} ({user?.total_reviews || 0} تقييم)</div>
          <div className="profile-stats"><div><div className="profile-stat__num">{user?.completed_orders || 0}</div><div className="profile-stat__label">طلب مكتمل</div></div><div><div className="profile-stat__num">{user?.experience || 0}</div><div className="profile-stat__label">سنوات الخبرة</div></div></div>
        </div>

        <div className="profile-form"><div className="card"><h3 className="card-title">المعلومات الشخصية</h3>
          <div className="form-row"><Input label="الاسم الأول" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} /><Input label="الاسم الأخير" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} /></div>
          <Input label="البريد الإلكتروني" value={user?.email} disabled icon={Mail} />
          <div className="form-row"><Input label="رقم الهاتف" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} icon={Phone} /><Input label="المدينة" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} icon={MapPin} /></div>
          <div className="form-row"><Input label="المهنة" value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} icon={Briefcase} /><Input label="سنوات الخبرة" type="number" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">نبذة عني</label><textarea className="form-input" rows="4" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="وصف خبراتك ومهاراتك..." /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button variant="navy" onClick={handleSave} loading={loading}>حفظ التغييرات</Button></div>
        </div></div>
      </div>
    </WorkerLayout>
  );
}
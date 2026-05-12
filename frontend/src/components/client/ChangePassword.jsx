import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Lock, Eye, EyeOff } from 'lucide-react';
import ClientLayout from '../layout/ClientLayout';
import Input from '../common/Input';
import Button from '../common/Button';
import { changePassword } from '../../features/client/clientSlice';
import { toast } from 'react-hot-toast';
import '../../styles/Client.css'; // فقط إذا styles داخل components
export default function ChangePassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [formData, setFormData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!formData.current_password) e.current_password = 'كلمة المرور الحالية مطلوبة';
    if (!formData.new_password) e.new_password = 'كلمة المرور الجديدة مطلوبة';
    else if (formData.new_password.length < 8) e.new_password = 'يجب أن تكون 8 أحرف على الأقل';
    if (formData.new_password !== formData.confirm_password) e.confirm_password = 'كلمتا المرور غير متطابقتين';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await dispatch(changePassword(formData));
    toast.success('تم تغيير كلمة المرور بنجاح');
    navigate('/client/settings');
    setLoading(false);
  };

  return (
    <ClientLayout title="تغيير كلمة المرور">
      <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
        <h3 className="card-title">🔒 تغيير كلمة المرور</h3>
        <div className="form-group"><label className="form-label">كلمة المرور الحالية</label><div className="field-wrap"><input type={showCurrent ? 'text' : 'password'} className="form-input" value={formData.current_password} onChange={(e) => setFormData({ ...formData, current_password: e.target.value })} /><button type="button" className="field-eye" onClick={() => setShowCurrent(!showCurrent)}>{showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>{errors.current_password && <span className="form-err">{errors.current_password}</span>}</div>
        <div className="form-group"><label className="form-label">كلمة المرور الجديدة</label><div className="field-wrap"><input type={showNew ? 'text' : 'password'} className="form-input" value={formData.new_password} onChange={(e) => setFormData({ ...formData, new_password: e.target.value })} /><button type="button" className="field-eye" onClick={() => setShowNew(!showNew)}>{showNew ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>{errors.new_password && <span className="form-err">{errors.new_password}</span>}</div>
        <div className="form-group"><label className="form-label">تأكيد كلمة المرور</label><input type="password" className="form-input" value={formData.confirm_password} onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} />{errors.confirm_password && <span className="form-err">{errors.confirm_password}</span>}</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}><Button variant="ghost" onClick={() => navigate('/client/settings')}>إلغاء</Button><Button variant="navy" onClick={handleSubmit} loading={loading}>تغيير كلمة المرور</Button></div>
      </div>
    </ClientLayout>
  );
}
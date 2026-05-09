// src/pages/admin/AdminSettings.jsx
import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';

export default function AdminSettings({ page, setPageState, usersCount, pendingRequestsCount, pendingWorkersCount }) {
  const [toggles, setToggles] = useState({ notif:true, email:true, sms:false, autoAccept:false, twofa:true, maintenance:false });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type="success") => setToast({ msg, type });
  const toggle = (k) => setToggles(p => ({ ...p, [k]: !p[k] }));

  const settingGroups = [
    { title:"الإشعارات", items:[
      { key:"notif", label:"إشعارات الطلبات الجديدة", sub:"تلقي إشعار عند كل طلب جديد" },
      { key:"email", label:"إشعارات البريد الإلكتروني", sub:"إرسال بريد للمستخدمين عند التحديثات" },
      { key:"sms", label:"الإشعارات عبر SMS", sub:"رسائل نصية للعمليات المهمة" },
    ]},
    { title:"إعدادات النظام", items:[
      { key:"autoAccept", label:"القبول التلقائي للعمال", sub:"قبول العمال الجدد تلقائياً بدون مراجعة" },
      { key:"twofa", label:"المصادقة الثنائية", sub:"تفعيل 2FA لجميع المديرين" },
      { key:"maintenance", label:"وضع الصيانة", sub:"تعطيل المنصة مؤقتاً للصيانة" },
    ]}
  ];

  return (
    <AdminLayout 
      title="الإعدادات" 
      page={page} 
      setPage={setPageState}
      usersCount={usersCount}
      pendingRequestsCount={pendingRequestsCount}
      pendingWorkersCount={pendingWorkersCount}
    >
      <div className="settings-grid">
        <div>
          {settingGroups.map(g => (
            <div className="card" key={g.title} style={{marginBottom:16}}>
              <div className="card-head"><span className="card-title">{g.title}</span></div>
              {g.items.map(item => (
                <div className="settings-row" key={item.key}>
                  <div>
                    <div className="settings-label">{item.label}</div>
                    <div className="settings-sub">{item.sub}</div>
                  </div>
                  <button className={`toggle${toggles[item.key]?" on":""}`} onClick={()=>{toggle(item.key);showToast("تم حفظ الإعداد","success");}} />
                </div>
              ))}
            </div>
          ))}

          <div className="card">
            <div className="card-head"><span className="card-title">معلومات المنصة</span></div>
            {[
              { label:"اسم المنصة", val:"خدمة" },
              { label:"البريد الرسمي", val:"admin@khidma.ma" },
              { label:"الهاتف", val:"+212 600 000 000" },
              { label:"العملة الافتراضية", val:"الدرهم المغربي (MAD)" },
            ].map((f,i) => (
              <div key={i} style={{marginBottom:14}}>
                <label className="form-label">{f.label}</label>
                <input className="form-input" defaultValue={f.val} />
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
              <button className="btn btn-navy" onClick={()=>showToast("✅ تم حفظ المعلومات","success")}>حفظ التغييرات</button>
            </div>
          </div>
        </div>

        <div>
          <div className="profile-card">
            <div className="profile-av">أح</div>
            <div className="profile-name">أحمد المدير</div>
            <div className="profile-role">Super Admin • طنجة</div>
          </div>
          <div className="card" style={{marginBottom:14}}>
            <div className="card-head"><span className="card-title">تغيير كلمة المرور</span></div>
            <div style={{marginBottom:12}}><label className="form-label">كلمة المرور الحالية</label><input className="form-input" type="password" placeholder="••••••••" /></div>
            <div style={{marginBottom:12}}><label className="form-label">كلمة المرور الجديدة</label><input className="form-input" type="password" placeholder="••••••••" /></div>
            <div style={{marginBottom:14}}><label className="form-label">تأكيد كلمة المرور</label><input className="form-input" type="password" placeholder="••••••••" /></div>
            <button className="btn btn-navy btn-full" onClick={()=>showToast("✅ تم تغيير كلمة المرور","success")}>تحديث</button>
          </div>
          <div className="card">
            <div className="card-head"><span className="card-title">إحصاءات المدير</span></div>
            {[
              { label:"طلبات عولجت", val:"1,248" },
              { label:"مستخدمون أضيفوا", val:"87" },
              { label:"تقارير أصدرت", val:"24" },
            ].map((s,i) => (
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<2?"1px solid var(--gray100)":"none"}}>
                <span style={{fontSize:13,color:"var(--text2)"}}>{s.label}</span>
                <span style={{fontSize:13,fontWeight:800,color:"var(--n700)"}}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {toast && <AdminToast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
    </AdminLayout>
  );
}
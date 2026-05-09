// src/components/admin/AdminToast.jsx
import { useEffect } from 'react';

export default function AdminToast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const bg = type === "success" ? "#dcfce7" : type === "error" ? "#fee2e2" : "#dbe7ff";
  const color = type === "success" ? "#166534" : type === "error" ? "#991b1b" : "#1e3f7a";
  return (
    <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:bg,color,padding:"12px 24px",borderRadius:50,fontFamily:"Cairo",fontWeight:800,fontSize:13,zIndex:9999,boxShadow:"0 8px 24px rgba(0,0,0,.12)",animation:"slideUp .2s"}}>
      {msg}
    </div>
  );
}
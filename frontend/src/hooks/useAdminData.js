// src/hooks/useAdminData.js
import { useState } from 'react';

export const INITIAL_USERS = [
  { id:1, name:"ياسين بنعلي", email:"yassin@email.com", phone:"0612-345678", city:"الدار البيضاء", role:"client", status:"active", date:"2024-01-15", orders:12, color:"#1e3f7a" },
  { id:2, name:"فاطمة الزهراء", email:"fatima@email.com", phone:"0623-456789", city:"الرباط", role:"worker", status:"active", date:"2023-11-20", orders:45, color:"#d4a017" },
  { id:3, name:"عمر المنصور", email:"omar@email.com", phone:"0634-567890", city:"فاس", role:"client", status:"active", date:"2024-02-03", orders:7, color:"#7c3aed" },
  { id:4, name:"سارة البوهالي", email:"sara@email.com", phone:"0645-678901", city:"مراكش", role:"client", status:"blocked", date:"2023-09-14", orders:3, color:"#dc2626" },
  { id:5, name:"محمد العزيز", email:"moh@email.com", phone:"0656-789012", city:"طنجة", role:"worker", status:"active", date:"2023-07-22", orders:89, color:"#059669" },
  { id:6, name:"نور الهدى", email:"nour@email.com", phone:"0667-890123", city:"أكادير", role:"client", status:"pending", date:"2024-03-01", orders:1, color:"#0891b2" },
  { id:7, name:"خالد الناصر", email:"khalid@email.com", phone:"0678-901234", city:"الدار البيضاء", role:"admin", status:"active", date:"2023-01-01", orders:0, color:"#7c3aed" },
  { id:8, name:"أمينة الشريف", email:"amina@email.com", phone:"0689-012345", city:"الرباط", role:"client", status:"active", date:"2024-01-28", orders:5, color:"#be185d" },
  { id:9, name:"حسن المرابط", email:"hassan@email.com", phone:"0690-123456", city:"مكناس", role:"worker", status:"active", date:"2023-10-05", orders:62, color:"#1e3f7a" },
  { id:10, name:"إيمان التازي", email:"iman@email.com", phone:"0601-234567", city:"وجدة", role:"client", status:"active", date:"2024-02-18", orders:9, color:"#d4a017" },
  { id:11, name:"سمير حداد", email:"samir@email.com", phone:"0611-222333", city:"طنجة", role:"worker", status:"pending", date:"2024-03-10", orders:0, color:"#059669" },
  { id:12, name:"رشيدة المالكي", email:"rachida@email.com", phone:"0622-333444", city:"الدار البيضاء", role:"client", status:"active", date:"2024-01-05", orders:18, color:"#be185d" },
];

export const REQUESTS = [
  { id:"#1054", title:"إصلاح تسرب مياه", category:"سباكة", client:"ياسين بنعلي", worker:"محمد العزيز", price:"350 د", date:"2024-03-15", status:"active", city:"الدار البيضاء", desc:"تسرب في الحمام الرئيسي، الأنبوب تحت الحوض." },
  { id:"#1053", title:"تركيب لوحة كهربائية", category:"كهرباء", client:"فاطمة الزهراء", worker:"كريم البكر", price:"580 د", date:"2024-03-14", status:"pending", city:"الرباط", desc:"تركيب لوحة توزيع جديدة للشقة." },
  { id:"#1052", title:"دهان صالون وغرفتين", category:"دهان", client:"عمر المنصور", worker:"علي الشريف", price:"1,200 د", date:"2024-03-13", status:"progress", city:"فاس", desc:"دهان شقة كاملة بألوان محددة." },
  { id:"#1051", title:"تنسيق حديقة منزلية", category:"بستنة", client:"أمينة الشريف", worker:"حسن المرابط", price:"220 د", date:"2024-03-12", status:"done", city:"الرباط", desc:"تنسيق وتقليم الأشجار والزهور." },
  { id:"#1050", title:"تركيب مكيف هواء", category:"كهرباء", client:"رشيدة المالكي", worker:"محمد العزيز", price:"450 د", date:"2024-03-11", status:"active", city:"الدار البيضاء", desc:"تركيب وحدة مكيف split 18000 BTU." },
  { id:"#1049", title:"إصلاح سقف مسرب", category:"بناء", client:"إيمان التازي", worker:"كريم البكر", price:"800 د", date:"2024-03-10", status:"done", city:"وجدة", desc:"إصلاح تسرب السقف بعد الأمطار." },
];

export const WORKERS = [
  { id:1, name:"محمد العزيز", specialty:"سباكة وكهرباء", city:"الدار البيضاء", rating:4.9, orders:89, earnings:"12,450 د", status:"active", color:"#059669", initials:"مع" },
  { id:2, name:"كريم البكر", specialty:"كهرباء عامة", city:"الرباط", rating:4.7, orders:54, earnings:"8,200 د", status:"active", color:"#1e3f7a", initials:"كب" },
  { id:3, name:"علي الشريف", specialty:"دهان وديكور", city:"فاس", rating:4.8, orders:71, earnings:"10,800 د", status:"active", color:"#7c3aed", initials:"عش" },
  { id:4, name:"حسن المرابط", specialty:"بستنة وتنسيق", city:"الرباط", rating:4.6, orders:62, earnings:"7,900 د", status:"active", color:"#d4a017", initials:"حم" },
  { id:5, name:"سمير حداد", specialty:"نجارة وصيانة", city:"طنجة", rating:0, orders:0, earnings:"0 د", status:"pending", color:"#0891b2", initials:"سح" },
  { id:6, name:"يوسف الأمين", specialty:"سباكة", city:"مراكش", rating:4.5, orders:38, earnings:"5,600 د", status:"blocked", color:"#dc2626", initials:"يأ" },
];

export const CHART_DATA = [
  { day:"ح", val:42 }, { day:"ن", val:67 }, { day:"ث", val:35 }, { day:"ر", val:78 },
  { day:"خ", val:55 }, { day:"ج", val:90 }, { day:"س", val:63 },
];

export const transactions = [
  { id:"T001", type:"in", desc:"دفعة طلب #1054 — ياسين بنعلي", amount:"350 د", date:"2024-03-15", method:"بطاقة بنكية" },
  { id:"T002", type:"in", desc:"دفعة طلب #1053 — فاطمة الزهراء", amount:"580 د", date:"2024-03-14", method:"نقدي" },
  { id:"T003", type:"out", desc:"عمولة عامل — محمد العزيز", amount:"-87 د", date:"2024-03-14", method:"تحويل بنكي" },
  { id:"T004", type:"in", desc:"دفعة طلب #1052 — عمر المنصور", amount:"1,200 د", date:"2024-03-13", method:"بطاقة بنكية" },
  { id:"T005", type:"out", desc:"عمولة عامل — علي الشريف", amount:"-300 د", date:"2024-03-13", method:"تحويل بنكي" },
  { id:"T006", type:"in", desc:"دفعة طلب #1051 — أمينة الشريف", amount:"220 د", date:"2024-03-12", method:"نقدي" },
  { id:"T007", type:"in", desc:"دفعة طلب #1050 — رشيدة المالكي", amount:"450 د", date:"2024-03-11", method:"بطاقة بنكية" },
  { id:"T008", type:"out", desc:"رسوم منصة الدفع", amount:"-120 د", date:"2024-03-10", method:"خصم تلقائي" },
];

export const useAdminData = () => {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [requests, setRequests] = useState(REQUESTS);
  const [workers, setWorkers] = useState(WORKERS);
  const [categories, setCategories] = useState([
    { id:1, name:"سباكة", icon:"🚿", workers:18, requests:124, status:"active" },
    { id:2, name:"كهرباء", icon:"⚡", workers:14, requests:98, status:"active" },
    { id:3, name:"دهان", icon:"🎨", workers:22, requests:87, status:"active" },
    { id:4, name:"نجارة", icon:"🪚", workers:9, requests:43, status:"active" },
    { id:5, name:"بستنة", icon:"🌿", workers:7, requests:31, status:"active" },
    { id:6, name:"تنظيف", icon:"🧹", workers:31, requests:156, status:"active" },
    { id:7, name:"بناء", icon:"🏗️", workers:11, requests:52, status:"active" },
    { id:8, name:"تكييف", icon:"❄️", workers:8, requests:39, status:"inactive" },
  ]);

  return { users, setUsers, requests, setRequests, workers, setWorkers, categories, setCategories };
};
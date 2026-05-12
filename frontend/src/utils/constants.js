// API Endpoints
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// User Roles
export const ROLES = {
  CLIENT: 'client',
  WORKER: 'worker',
  ADMIN: 'admin',
};

// Request Status
export const REQUEST_STATUS = {
  PENDING: 'pending',
  IN_DISCUSSION: 'in_discussion',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Order Status
export const ORDER_STATUS = {
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
};

// Payment Status
export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
};

// Categories
export const CATEGORIES = [
  { value: 'electrical', label: 'كهرباء', icon: '⚡' },
  { value: 'plumbing', label: 'سباكة', icon: '💧' },
  { value: 'carpentry', label: 'نجارة', icon: '🔨' },
  { value: 'cleaning', label: 'تنظيف', icon: '🧹' },
  { value: 'cooking', label: 'طبخ', icon: '🍳' },
  { value: 'design', label: 'تصميم', icon: '🎨' },
  { value: 'teaching', label: 'تعليم', icon: '📚' },
  { value: 'transport', label: 'نقل', icon: '🚚' },
];

// Cities
export const CITIES = [
  'الدار البيضاء', 'الرباط', 'طنجة', 'مراكش', 'فاس', 
  'مكناس', 'أكادير', 'وجدة', 'تطوان', 'سلا',
];
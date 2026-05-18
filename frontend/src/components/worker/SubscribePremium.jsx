import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Crown, Check, CreditCard, Building2, Upload, Star, 
  Shield, ArrowLeft, Zap, Calendar, Award, TrendingUp, 
  MessageCircle, BarChart3, Sparkles, X 
} from 'lucide-react';
import PaymentModal from '../common/PaymentModal';  // ✅ مرة وحدة فقط
// فـ SubscribePremium.jsx أضف
import '../../styles/Premium.css';

export default function SubscribePremium() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [plans, setPlans] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showManualModal, setShowManualModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [bankInfo, setBankInfo] = useState(null);
    const [receiptFile, setReceiptFile] = useState(null);
    const [paymentId, setPaymentId] = useState(null);
    const [hoveredPlan, setHoveredPlan] = useState(null);
    const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);

    // ✅ تحقق من الدور بعد كل الـ Hooks
    useEffect(() => {
        if (user?.role !== 'worker') {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchPlans();
        checkStatus();
        
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('status') === 'success') {
            toast.success('🎉 تم تفعيل البريميوم بنجاح!');
            checkStatus();
            window.history.replaceState({}, '', '/worker/subscribe');
        }
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await api.get('/premium/plans');
            setPlans(response.data.plans);
        } catch (error) {
            console.error('Error fetching plans:', error);
            toast.error('حدث خطأ في تحميل الخطط');
        }
    };

    const checkStatus = async () => {
        try {
            const response = await api.get('/premium/status');
            setStatus(response.data);
        } catch (error) {
            console.error('Error checking status:', error);
        }
    };

    // ✅ تعديل: فتح مودال الدفع بدل التوجيه المباشر
    const handleCardPayment = (planId) => {
        const plan = plans.find(p => p.id === planId);
        setSelectedPlanForPayment(plan);
        setShowPaymentModal(true);
    };

    // ✅ معالجة نجاح الدفع (Mock)
    const handlePaymentSuccess = async () => {
        if (!selectedPlanForPayment) return;
        
        setLoading(true);
        try {
            const response = await api.post('/premium/card-payment', { 
                plan_id: selectedPlanForPayment.id 
            });
            if (response.data.success) {
                toast.success('🎉 تم تفعيل البريميوم بنجاح!');
                checkStatus();
            } else {
                toast.error(response.data.message || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('حدث خطأ في تفعيل البريميوم');
        } finally {
            setLoading(false);
        }
    };

    const handleManualRequest = async (planId) => {
        setLoading(true);
        try {
            const response = await api.post('/premium/manual-request', { plan_id: planId });
            if (response.data.success) {
                setBankInfo(response.data.bank_info);
                setPaymentId(response.data.payment_id);
                setSelectedPlan(planId);
                setShowManualModal(true);
            }
        } catch (error) {
            toast.error('حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadReceipt = async () => {
        if (!receiptFile) {
            toast.error('الرجاء اختيار ملف الإثبات');
            return;
        }

        const formData = new FormData();
        formData.append('payment_id', paymentId);
        formData.append('receipt', receiptFile);

        setLoading(true);
        try {
            await api.post('/premium/upload-receipt', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('تم رفع الإثبات، في انتظار المراجعة');
            setShowManualModal(false);
            setReceiptFile(null);
        } catch (error) {
            toast.error('حدث خطأ في رفع الملف');
        } finally {
            setLoading(false);
        }
    };

    // ✅ إذا كان Client، يظهر Loading مؤقت أو يعيد التوجيه
    if (user?.role !== 'worker') {
        return null;
    }

    if (status?.is_premium) {
        return (
            <div className="premium-success-container">
                <div className="premium-success-card">
                    <div className="premium-success-icon">
                        <Crown size={80} className="crown-animation" />
                    </div>
                    <div className="premium-check-animation">✓</div>
                    <h1>🎉 أنت عضو Premium!</h1>
                    <p>اشتراكك نشط حتى</p>
                    <div className="premium-success-date">
                        <Calendar size={20} />
                        {status.premium_until ? new Date(status.premium_until).toLocaleDateString('ar', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : 'غير محدد'}
                    </div>
                    <div className="premium-days-badge">
                        ⏰ متبقي <strong>{status.days_left}</strong> يوماً
                    </div>
                    <div className="premium-features-summary">
                        <div className="feature-summary-item">
                            <Zap size={16} /> عروض بلا حدود
                        </div>
                        <div className="feature-summary-item">
                            <BarChart3 size={16} /> تحليلات متقدمة
                        </div>
                        <div className="feature-summary-item">
                            <Award size={16} /> ظهور مميز
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/worker/dashboard')}
                        className="btn-premium-back"
                    >
                        العودة للوحة التحكم
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="premium-container">
            {/* Hero Section */}
            <div className="premium-hero">
                <button 
                    onClick={() => navigate('/worker/dashboard')}
                    className="back-button"
                >
                    <ArrowLeft size={18} />
                    العودة
                </button>
                <div className="premium-hero-content">
                    <div className="premium-hero-icon">
                        <Shield size={56} />
                        <Sparkles size={24} className="sparkle-icon" />
                    </div>
                    <h1>⭐ عضوية <span className="gradient-text">Premium</span></h1>
                    <p>ارتقِ بخدمتك واستفد من المزايا الحصرية</p>
                </div>
            </div>

            {/* Features Banner */}
            <div className="features-banner">
                <div className="feature-banner-item">
                    <Zap size={20} className="feature-banner-icon" />
                    <span>عروض غير محدودة</span>
                </div>
                <div className="feature-banner-item">
                    <BarChart3 size={20} className="feature-banner-icon" />
                    <span>تحليلات متقدمة</span>
                </div>
                <div className="feature-banner-item">
                    <Award size={20} className="feature-banner-icon" />
                    <span>ظهور مميز في البحث</span>
                </div>
                <div className="feature-banner-item">
                    <MessageCircle size={20} className="feature-banner-icon" />
                    <span>أولوية الدعم</span>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="plans-grid">
                {plans.map((plan) => (
                    <div 
                        key={plan.id} 
                        className={`plan-card ${hoveredPlan === plan.id ? 'hovered' : ''} ${plan.id === 'premium_yearly' ? 'popular' : ''}`}
                        onMouseEnter={() => setHoveredPlan(plan.id)}
                        onMouseLeave={() => setHoveredPlan(null)}
                    >
                        {plan.id === 'premium_yearly' && (
                            <div className="popular-badge">
                                <Star size={12} fill="#FFD700" />
                                الأكثر توفيراً
                            </div>
                        )}
                        <div className="plan-card-header">
                            <div className="plan-icon">
                                {plan.id === 'premium_monthly' ? (
                                    <Crown size={48} />
                                ) : (
                                    <Award size={48} />
                                )}
                            </div>
                            <h3 className="plan-name">{plan.name}</h3>
                            <div className="plan-price">
                                <span className="price-amount">{plan.price}</span>
                                <span className="price-currency">درهم</span>
                                <span className="price-period">/{plan.interval === 'month' ? 'شهر' : 'سنة'}</span>
                            </div>
                            {plan.id === 'premium_yearly' && (
                                <div className="saving-badge">
                                    وفر 15%
                                </div>
                            )}
                        </div>
                        
                        <div className="plan-card-body">
                            <ul className="plan-features">
                                {plan.features.map((feature, i) => (
                                    <li key={i}>
                                        <Check size={18} className="feature-check" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="plan-card-footer">
                            <button
                                onClick={() => handleCardPayment(plan.id)}
                                disabled={loading}
                                className="btn-premium-card"
                            >
                                <CreditCard size={18} />
                                {loading ? 'جاري...' : 'دفع بالبطاقة البنكية'}
                            </button>
                            <button
                                onClick={() => handleManualRequest(plan.id)}
                                disabled={loading}
                                className="btn-premium-manual"
                            >
                                <Building2 size={18} />
                                تحويل بنكي
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Guarantee */}
            <div className="payment-guarantee">
                <Shield size={20} />
                <span>الدفع عبر Konnect - آمن ومشفر 100%</span>
            </div>

            {/* ✅ Modal للدفع بالبطاقة (Mock) */}
            {showPaymentModal && selectedPlanForPayment && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                    amount={selectedPlanForPayment.price}
                    planName={selectedPlanForPayment.name}
                />
            )}

            {/* Modal للتحويل البنكي */}
            {showManualModal && bankInfo && (
                <div className="modal-overlay" onClick={() => setShowManualModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>معلومات التحويل البنكي</h3>
                            <button className="modal-close" onClick={() => setShowManualModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="bank-info-card">
                                <div className="bank-info-row">
                                    <span className="bank-label">البنك:</span>
                                    <span className="bank-value">{bankInfo.bank_name}</span>
                                </div>
                                <div className="bank-info-row">
                                    <span className="bank-label">اسم الحساب:</span>
                                    <span className="bank-value">{bankInfo.account_name}</span>
                                </div>
                                <div className="bank-info-row">
                                    <span className="bank-label">رقم الحساب:</span>
                                    <span className="bank-value">{bankInfo.account_number}</span>
                                </div>
                                <div className="bank-info-row highlight">
                                    <span className="bank-label">RIB:</span>
                                    <span className="bank-value">{bankInfo.rib}</span>
                                </div>
                                <div className="bank-info-row highlight">
                                    <span className="bank-label">المبلغ:</span>
                                    <span className="bank-value">{bankInfo.amount} درهم</span>
                                </div>
                                <div className="bank-info-row">
                                    <span className="bank-label">المرجع:</span>
                                    <span className="bank-value">{bankInfo.reference}</span>
                                </div>
                            </div>
                            
                            <div className="upload-section">
                                <label className="upload-label">
                                    <Upload size={18} />
                                    رفع إثبات الدفع
                                </label>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setReceiptFile(e.target.files[0])}
                                    className="upload-input"
                                />
                                {receiptFile && (
                                    <p className="upload-filename">{receiptFile.name}</p>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                onClick={handleUploadReceipt}
                                disabled={loading}
                                className="btn-upload"
                            >
                                {loading ? 'جاري الرفع...' : 'تأكيد الرفع'}
                            </button>
                            <button
                                onClick={() => setShowManualModal(false)}
                                className="btn-cancel"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Styles */}
        </div>
    );
}
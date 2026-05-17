// src/components/worker/BuyFeatured.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { Star, CreditCard, X, Clock, Wallet, ArrowLeft } from 'lucide-react';

export default function BuyFeatured({ serviceId, serviceTitle, onClose, onSuccess }) {
    const { user } = useSelector((state) => state.auth);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [purchaseId, setPurchaseId] = useState(null);
    const [step, setStep] = useState('packages'); // packages, method, bank
    const [bankInfo, setBankInfo] = useState(null);
    const [receipt, setReceipt] = useState(null);

    useEffect(() => {
        fetchPricing();
    }, []);

    const fetchPricing = async () => {
        try {
            const response = await api.get('/featured/pricing');
            setPackages(response.data.packages || []);
        } catch (error) {
            console.error('Error fetching pricing:', error);
            toast.error('حدث خطأ في تحميل الأسعار');
        }
    };

    // ✅ إنشاء طلب شراء
    const handlePurchase = async (pkg) => {
        setSelectedPackage(pkg);
        setLoading(true);
        
        try {
            const response = await api.post('/featured/purchase', {
                service_id: serviceId,
                days: pkg.days,
                payment_method: null
            });
            
            if (response.data.success) {
                setPurchaseId(response.data.purchase.id);
                setStep('method');
                toast.success('تم إنشاء طلب الشراء');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    // ✅ طريقة الدفع بالبطاقة (Konnect)
    const handleCardPayment = async () => {
        setLoading(true);
        try {
            const response = await api.post('/payments/card/create', {
                purchase_id: purchaseId
            });
            
            if (response.data.success) {
                window.location.href = response.data.payment_url;
            }
        } catch (error) {
            toast.error('حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    // ✅ طريقة الدفع اليدوي (تحويل بنكي)
    const handleManualPayment = async () => {
        setLoading(true);
        try {
            const response = await api.post('/payments/manual/request', { 
                purchase_id: purchaseId 
            });
            
            if (response.data.success) {
                setBankInfo(response.data.bank_info);
                setStep('bank');
            }
        } catch (error) {
            toast.error('حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    // ✅ رفع إثبات الدفع
    const handleUploadReceipt = async () => {
        if (!receipt) {
            toast.error('الرجاء اختيار ملف الإثبات');
            return;
        }
        
        const formData = new FormData();
        formData.append('purchase_id', purchaseId);
        formData.append('receipt', receipt);
        
        setLoading(true);
        try {
            await api.post('/payments/manual/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('تم رفع الإثبات، في انتظار المراجعة');
            onClose();
        } catch (error) {
            toast.error('حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    // ✅ العودة للخطوة السابقة
    const handleBack = () => {
        if (step === 'method') {
            setStep('packages');
            setPurchaseId(null);
        } else if (step === 'bank') {
            setStep('method');
            setBankInfo(null);
            setReceipt(null);
        }
    };

    // ========== STEP 1: عرض الباقات ==========
    if (step === 'packages') {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="featured-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                    
                    <div className="featured-header">
                        <Star size={32} color="#f39c12" />
                        <h2>⭐ مميز خدمتك</h2>
                        <p>اجعل خدمة <strong>"{serviceTitle}"</strong> تظهر في أعلى نتائج البحث</p>
                    </div>
                    
                    <div className="packages-grid">
                        {packages.map((pkg) => (
                            <div key={pkg.days} className="package-card">
                                <div className="package-days">
                                    <Clock size={16} /> {pkg.days} أيام
                                </div>
                                <div className="package-price">
                                    <Wallet size={20} /> {pkg.price} درهم
                                </div>
                                {pkg.old_price && (
                                    <div className="package-old-price">
                                        كان <span>{pkg.old_price} درهم</span>
                                    </div>
                                )}
                                <div className="package-saving">
                                    {pkg.days === 30 && <span>🔥 وفر 201 درهم</span>}
                                    {pkg.days === 7 && <span>⭐ الأكثر اختياراً</span>}
                                    {pkg.days === 3 && <span>📢 للتجربة</span>}
                                </div>
                                <button 
                                    className="btn-buy"
                                    onClick={() => handlePurchase(pkg)}
                                    disabled={loading}
                                >
                                    <CreditCard size={16} />
                                    {loading && selectedPackage?.days === pkg.days ? 'جاري...' : `شراء ${pkg.price} درهم`}
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="featured-info">
                        <p>✨ مميزات الخدمة المميزة:</p>
                        <ul>
                            <li>⭐ تظهر في أعلى نتائج البحث</li>
                            <li>🏷️ علامة "مميز" بجانب الخدمة</li>
                            <li>📈 زيادة المشاهدات بنسبة تصل إلى 300%</li>
                            <li>⏱️ تبدأ الميزة فوراً بعد تأكيد الدفع</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // ========== STEP 2: اختيار طريقة الدفع ==========
    if (step === 'method') {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="payment-method-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                    <button className="modal-back" onClick={handleBack}>
                        <ArrowLeft size={16} /> رجوع
                    </button>
                    
                    <div className="payment-method-header">
                        <Wallet size={48} color="#f39c12" />
                        <h2>اختر طريقة الدفع</h2>
                        <p>المبلغ: <strong>{selectedPackage?.price} درهم</strong> لمدة {selectedPackage?.days} أيام</p>
                    </div>
                    
                    <div className="payment-methods">
                        <button className="payment-method-card" onClick={handleCardPayment} disabled={loading}>
                            <CreditCard size={24} />
                            <div>
                                <strong>💳 بطاقة بنكية</strong>
                                <span>دفع فوري عبر الإنترنت</span>
                            </div>
                        </button>
                        
                        <button className="payment-method-manual" onClick={handleManualPayment} disabled={loading}>
                            <Wallet size={24} />
                            <div>
                                <strong>🏦 تحويل بنكي / يدوي</strong>
                                <span>ستتلقى معلومات الحساب</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========== STEP 3: عرض معلومات التحويل البنكي (RIB) ==========
    if (step === 'bank' && bankInfo) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="bank-info-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                    <button className="modal-back" onClick={handleBack}>
                        <ArrowLeft size={16} /> رجوع
                    </button>
                    
                    <div className="bank-info-header">
                        <Wallet size={48} color="#27ae60" />
                        <h2>🏦 معلومات التحويل البنكي</h2>
                        <p>قم بتحويل المبلغ المطلوب إلى الحساب البنكي أدناه</p>
                    </div>
                    
                    <div className="bank-info-details">
                        <div className="bank-info-row">
                            <span>المبلغ المطلوب:</span>
                            <strong className="amount">{bankInfo.amount} درهم</strong>
                        </div>
                        <div className="bank-info-row">
                            <span>اسم البنك:</span>
                            <strong>{bankInfo.bank_name || bankInfo.bank}</strong>
                        </div>
                        <div className="bank-info-row">
                            <span>اسم الحساب:</span>
                            <strong>{bankInfo.account_name}</strong>
                        </div>
                        <div className="bank-info-row">
                            <span>رقم الحساب:</span>
                            <strong>{bankInfo.account_number}</strong>
                        </div>
                        <div className="bank-info-row">
                            <span>RIB:</span>
                            <strong className="rib">{bankInfo.rib}</strong>
                            <button className="copy-btn" onClick={() => {
                                navigator.clipboard.writeText(bankInfo.rib);
                                toast.success('تم نسخ RIB');
                            }}>📋 نسخ</button>
                        </div>
                        <div className="bank-info-row">
                            <span>Swift Code:</span>
                            <strong>{bankInfo.swift}</strong>
                        </div>
                        <div className="bank-info-row">
                            <span>مرجع التحويل:</span>
                            <strong>{bankInfo.reference}</strong>
                        </div>
                        <div className="bank-info-note">
                            💡 ملاحظة: يرجى وضع المرجع في خانة التعليق عند التحويل
                        </div>
                    </div>
                    
                    <div className="receipt-upload">
                        <label className="upload-label">
                            <input 
                                type="file" 
                                accept="image/*,.pdf" 
                                onChange={(e) => setReceipt(e.target.files[0])} 
                                className="upload-input" 
                            />
                            <span>📎 رفع إثبات الدفع (صورة أو PDF)</span>
                        </label>
                        {receipt && <p className="upload-success">✓ تم اختيار: {receipt.name}</p>}
                    </div>
                    
                    <button 
                        className="btn-submit-receipt" 
                        onClick={handleUploadReceipt} 
                        disabled={loading || !receipt}
                    >
                        {loading ? 'جاري الرفع...' : 'تأكيد وإرسال الإثبات'}
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
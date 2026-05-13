import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CreditCard, Plus, Trash2, Star, Loader, 
  Building, Smartphone, Landmark, Truck, 
  CheckCircle, AlertCircle, Banknote,
  Shield, Lock
} from 'lucide-react';
import ClientLayout from '../layout/ClientLayout';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { getPayments, confirmPayment, createPaymentIntent } from '../../features/payment/paymentSlice';
import { toast } from 'react-hot-toast';

// طرق الدفع المتاحة
const PAYMENT_METHODS = [
  {
    id: 'card',
    name: 'بطاقة ائتمانية',
    icon: CreditCard,
    description: 'Visa, Mastercard',
    color: '#4F46E5',
    fields: ['card_number', 'expiry', 'cvv', 'card_name']
  },
  {
    id: 'cash',
    name: 'الدفع عند الاستلام',
    icon: Banknote,
    description: 'ادفع نقداً عند استلام الخدمة',
    color: '#10B981',
    fields: []
  },
  {
    id: 'bank_transfer',
    name: 'تحويل بنكي',
    icon: Building,
    description: 'تحويل من حسابك البنكي',
    color: '#3B82F6',
    fields: ['bank_name', 'account_number', 'account_name', 'transfer_receipt']
  },
  {
    id: 'agency',
    name: 'الدفع عبر وكالة',
    icon: Landmark,
    description: 'ادفع في أقرب وكالة',
    color: '#F59E0B',
    fields: ['agency_code', 'phone_number']
  },
  {
    id: 'mobile_money',
    name: 'محفظة إلكترونية',
    icon: Smartphone,
    description: 'Orange Money, MTN Money',
    color: '#EC4899',
    fields: ['provider', 'phone_number', 'pin']
  }
];

export default function PaymentMethods() {
  const dispatch = useDispatch();
  const { payments, isLoading } = useSelector((state) => state.payment);
  const { user } = useSelector((state) => state.auth);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [formData, setFormData] = useState({
    // Card fields
    card_number: '',
    expiry: '',
    cvv: '',
    card_name: '',
    save_card: true,
    
    // Bank transfer fields
    bank_name: '',
    account_number: '',
    account_name: '',
    transfer_receipt: null,
    
    // Agency fields
    agency_code: '',
    phone_number: '',
    
    // Mobile money fields
    provider: 'orange',
    pin: '',
  });

  useEffect(() => {
    dispatch(getPayments());
    loadSavedCards();
    loadBankAccounts();
  }, [dispatch]);

  const loadSavedCards = () => {
    // جلب البطاقات المحفوظة من localStorage
    const saved = localStorage.getItem('saved_cards');
    if (saved) {
      setSavedCards(JSON.parse(saved));
    } else {
      // بيانات تجريبية
      setSavedCards([
        { id: 1, last4: '4242', brand: 'visa', expiry: '12/25', isDefault: true },
        { id: 2, last4: '1234', brand: 'mastercard', expiry: '08/26', isDefault: false }
      ]);
    }
  };

  const loadBankAccounts = () => {
    const saved = localStorage.getItem('bank_accounts');
    if (saved) {
      setBankAccounts(JSON.parse(saved));
    }
  };

  const saveCard = (cardData) => {
    const newCard = {
      id: Date.now(),
      last4: cardData.card_number.slice(-4),
      brand: cardData.card_number.startsWith('4') ? 'visa' : 'mastercard',
      expiry: cardData.expiry,
      name: cardData.card_name,
      isDefault: savedCards.length === 0,
      createdAt: new Date().toISOString()
    };
    
    const updatedCards = [...savedCards, newCard];
    setSavedCards(updatedCards);
    localStorage.setItem('saved_cards', JSON.stringify(updatedCards));
    toast.success('تم حفظ البطاقة بنجاح');
    return newCard;
  };

  const handleDeleteCard = (cardId) => {
    const updatedCards = savedCards.filter(c => c.id !== cardId);
    setSavedCards(updatedCards);
    localStorage.setItem('saved_cards', JSON.stringify(updatedCards));
    toast.success('تم حذف البطاقة');
  };

  const handleSetDefaultCard = (cardId) => {
    const updatedCards = savedCards.map(c => ({
      ...c,
      isDefault: c.id === cardId
    }));
    setSavedCards(updatedCards);
    localStorage.setItem('saved_cards', JSON.stringify(updatedCards));
    toast.success('تم تعيين البطاقة كافتراضية');
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('الرجاء اختيار طريقة الدفع');
      return;
    }

    setProcessing(true);
    
    try {
      // محاكاة عملية الدفع حسب الطريقة المختارة
      switch (selectedMethod.id) {
        case 'card':
          await processCardPayment();
          break;
        case 'cash':
          await processCashPayment();
          break;
        case 'bank_transfer':
          await processBankTransfer();
          break;
        case 'agency':
          await processAgencyPayment();
          break;
        case 'mobile_money':
          await processMobileMoney();
          break;
        default:
          toast.error('طريقة دفع غير معروفة');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'فشل الدفع');
    } finally {
      setProcessing(false);
    }
  };

  const processCardPayment = async () => {
    // التحقق من البيانات
    if (!formData.card_number || !formData.expiry || !formData.cvv || !formData.card_name) {
      toast.error('الرجاء إدخال جميع بيانات البطاقة');
      return;
    }

    // محاكاة معالجة الدفع
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // حفظ البطاقة إذا طلب المستخدم
    if (formData.save_card) {
      saveCard(formData);
    }
    
    toast.success('تم الدفع بنجاح عبر البطاقة الائتمانية');
    setModalOpen(false);
    resetForm();
    dispatch(getPayments());
  };

  const processCashPayment = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('تم تأكيد طلب الدفع عند الاستلام');
    setModalOpen(false);
    resetForm();
  };

  const processBankTransfer = async () => {
    if (!formData.bank_name || !formData.account_number || !formData.account_name) {
      toast.error('الرجاء إدخال جميع بيانات التحويل البنكي');
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('تم إرسال طلب التحويل البنكي، سيتم التأكيد خلال 24 ساعة');
    setModalOpen(false);
    resetForm();
  };

  const processAgencyPayment = async () => {
    if (!formData.agency_code || !formData.phone_number) {
      toast.error('الرجاء إدخال رمز الوكالة ورقم الهاتف');
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // عرض رمز الدفع
    const paymentCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    toast.success(
      <div>
        <strong>رمز الدفع الخاص بك:</strong><br />
        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{paymentCode}</span><br />
        قم بزيارة أقرب وكالة مع هذا الرمز
      </div>,
      { duration: 8000 }
    );
    
    setModalOpen(false);
    resetForm();
  };

  const processMobileMoney = async () => {
    if (!formData.phone_number || !formData.pin) {
      toast.error('الرجاء إدخال رقم الهاتف والرمز السري');
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success(`تم الدفع بنجاح عبر ${formData.provider === 'orange' ? 'أورنج موني' : 'إم تي إن موني'}`);
    setModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      card_number: '',
      expiry: '',
      cvv: '',
      card_name: '',
      save_card: true,
      bank_name: '',
      account_number: '',
      account_name: '',
      transfer_receipt: null,
      agency_code: '',
      phone_number: '',
      provider: 'orange',
      pin: '',
    });
    setSelectedMethod(null);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ar-MA');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="badge badge--success"><CheckCircle size={12} /> مدفوع</span>;
      case 'pending':
        return <span className="badge badge--warning"><AlertCircle size={12} /> قيد الانتظار</span>;
      case 'failed':
        return <span className="badge badge--danger">فشل</span>;
      default:
        return <span className="badge badge--secondary">{status}</span>;
    }
  };

  const PaymentMethodCard = ({ method }) => {
    const Icon = method.icon;
    return (
      <div 
        className={`payment-method-card ${selectedMethod?.id === method.id ? 'selected' : ''}`}
        onClick={() => setSelectedMethod(method)}
      >
        <div className="method-icon" style={{ backgroundColor: method.color + '20', color: method.color }}>
          <Icon size={28} />
        </div>
        <div className="method-info">
          <h4>{method.name}</h4>
          <p>{method.description}</p>
        </div>
        {selectedMethod?.id === method.id && (
          <div className="method-check">
            <CheckCircle size={24} color="#10B981" />
          </div>
        )}
      </div>
    );
  };

  const renderPaymentForm = () => {
    if (!selectedMethod) return null;

    switch (selectedMethod.id) {
      case 'card':
        return (
          <div className="payment-form">
            <h4>بيانات البطاقة</h4>
            
            {/* Saved Cards */}
            {savedCards.length > 0 && (
              <div className="saved-cards">
                <label>البطاقات المحفوظة</label>
                {savedCards.map(card => (
                  <div key={card.id} className="saved-card">
                    <div className="card-info">
                      <span className="card-brand">{card.brand === 'visa' ? '💳 Visa' : '💳 Mastercard'}</span>
                      <span className="card-number">•••• {card.last4}</span>
                      <span className="card-expiry">تنتهي {card.expiry}</span>
                      {card.isDefault && <span className="default-badge">افتراضي</span>}
                    </div>
                    <div className="card-actions">
                      {!card.isDefault && (
                        <button onClick={() => handleSetDefaultCard(card.id)}>تعيين افتراضي</button>
                      )}
                      <button onClick={() => handleDeleteCard(card.id)} className="delete-btn">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="divider">
              <span>أو استخدم بطاقة جديدة</span>
            </div>
            
            <Input 
              label="رقم البطاقة" 
              placeholder="1234 5678 9012 3456" 
              value={formData.card_number}
              onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
            />
            <div className="form-row">
              <Input 
                label="تاريخ الانتهاء" 
                placeholder="MM/YY" 
                value={formData.expiry}
                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
              />
              <Input 
                label="CVV" 
                placeholder="123" 
                type="password" 
                value={formData.cvv}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
              />
            </div>
            <Input 
              label="الاسم على البطاقة" 
              placeholder="كما يظهر على البطاقة" 
              value={formData.card_name}
              onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
            />
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.save_card}
                onChange={(e) => setFormData({ ...formData, save_card: e.target.checked })}
              />
              <span>حفظ البطاقة للاستخدام المستقبلي</span>
            </label>
          </div>
        );
        
      case 'bank_transfer':
        return (
          <div className="payment-form">
            <h4>بيانات التحويل البنكي</h4>
            <div className="bank-info-alert">
              <Building size={20} />
              <div>
                <strong>معلومات الحساب البنكي:</strong>
                <p>البنك: Banque Populaire<br />رقم الحساب: 123 456 789 001<br />RIB: 123456789012345678901234</p>
              </div>
            </div>
            <Input 
              label="اسم البنك" 
              placeholder="Banque Populaire, Attijari..." 
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
            />
            <Input 
              label="رقم الحساب" 
              placeholder="رقم الحساب البنكي" 
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
            />
            <Input 
              label="اسم صاحب الحساب" 
              placeholder="الاسم كما يظهر في البنك" 
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
            />
            <div className="file-upload">
              <label>إرفاق إيصال التحويل</label>
              <input type="file" accept="image/*,.pdf" />
              <small>صورة أو PDF للإيصال</small>
            </div>
          </div>
        );
        
      case 'agency':
        return (
          <div className="payment-form">
            <h4>الدفع عبر الوكالة</h4>
            <div className="agency-info">
              <p>يمكنك الدفع في أقرب وكالة من الوكالات التالية:</p>
              <ul>
                <li>📍 Barid Cash</li>
                <li>📍 Wafacash</li>
                <li>📍 Cash Plus</li>
                <li>📍 Poste Maroc</li>
              </ul>
            </div>
            <Input 
              label="رمز الوكالة" 
              placeholder="اختر الوكالة" 
              value={formData.agency_code}
              onChange={(e) => setFormData({ ...formData, agency_code: e.target.value })}
            />
            <Input 
              label="رقم الهاتف" 
              placeholder="لإرسال رمز التأكيد" 
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
          </div>
        );
        
      case 'mobile_money':
        return (
          <div className="payment-form">
            <h4>الدفع عبر المحفظة الإلكترونية</h4>
            <div className="provider-select">
              <label>اختر المحفظة</label>
              <div className="provider-buttons">
                <button 
                  className={`provider-btn ${formData.provider === 'orange' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, provider: 'orange' })}
                >
                  🟠 Orange Money
                </button>
                <button 
                  className={`provider-btn ${formData.provider === 'mtn' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, provider: 'mtn' })}
                >
                  💛 MTN Money
                </button>
              </div>
            </div>
            <Input 
              label="رقم الهاتف" 
              placeholder="0612345678" 
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
            <Input 
              label="الرمز السري" 
              placeholder="****" 
              type="password"
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <ClientLayout title="طرق الدفع">
        <div className="loading-container">
          <Loader className="spinner" size={40} />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="طرق الدفع">
      <div className="payment-methods-page">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-header__title">طرق الدفع</h1>
          <p className="page-header__sub">اختر طريقة الدفع المناسبة لك</p>
        </div>

        {/* Security Badge */}
        <div className="security-badge">
          <Shield size={16} />
          <span>مدفوعات آمنة 100%</span>
          <Lock size={14} />
        </div>

        {/* Payment Methods Grid */}
        <div className="payment-methods-grid">
          {PAYMENT_METHODS.map(method => (
            <PaymentMethodCard key={method.id} method={method} />
          ))}
        </div>

        {/* Selected Method Form */}
        {selectedMethod && (
          <div className="selected-method-container">
            <div className="method-header">
              <h3>إتمام الدفع عبر {selectedMethod.name}</h3>
            </div>
            {renderPaymentForm()}
            <Button 
              variant="navy" 
              onClick={handlePayment} 
              loading={processing}
              full
              style={{ marginTop: 24 }}
            >
              تأكيد الدفع
            </Button>
          </div>
        )}

        {/* Payment History */}
        {payments?.data?.length > 0 && (
          <div className="payment-history">
            <h3>سجل المدفوعات</h3>
            <div className="payments-list">
              {payments.data.map((payment) => (
                <div key={payment.id} className="payment-history-card">
                  <div className="payment-header">
                    <div className="payment-order">طلب #{payment.order_id}</div>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div className="payment-details">
                    <div className="detail">
                      <span>💰 المبلغ</span>
                      <strong>{payment.amount} درهم</strong>
                    </div>
                    <div className="detail">
                      <span>📅 التاريخ</span>
                      <span>{formatDate(payment.paid_at)}</span>
                    </div>
                    <div className="detail">
                      <span>💳 طريقة الدفع</span>
                      <span>
                        {payment.provider === 'stripe' ? 'بطاقة ائتمانية' :
                         payment.provider === 'cash' ? 'دفع عند الاستلام' :
                         payment.provider === 'bank_transfer' ? 'تحويل بنكي' :
                         payment.provider === 'agency' ? 'وكالة' : 
                         payment.provider === 'mobile_money' ? 'محفظة إلكترونية' : payment.provider}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style>{`
        .payment-methods-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-header__title {
          font-size: 28px;
          font-weight: 800;
          color: #1a1a2e;
          margin-bottom: 8px;
        }

        .page-header__sub {
          font-size: 14px;
          color: #666;
        }

        .security-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #e0f2fe;
          color: #0284c7;
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 13px;
          margin-bottom: 24px;
        }

        .payment-methods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .payment-method-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .payment-method-card:hover {
          border-color: #f5b042;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .payment-method-card.selected {
          border-color: #f5b042;
          background: linear-gradient(135deg, #fff8f0, white);
        }

        .method-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
        }

        .method-info h4 {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 4px;
        }

        .method-info p {
          font-size: 12px;
          color: #999;
        }

        .method-check {
          position: absolute;
          top: 12px;
          right: 12px;
        }

        .selected-method-container {
          background: white;
          border-radius: 24px;
          padding: 28px;
          margin-top: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #f0f0f0;
        }

        .method-header h3 {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 24px;
        }

        .payment-form h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 20px;
        }

        .saved-cards {
          margin-bottom: 20px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 16px;
        }

        .saved-cards > label {
          font-size: 13px;
          font-weight: 600;
          color: #666;
          display: block;
          margin-bottom: 12px;
        }

        .saved-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: white;
          border-radius: 12px;
          margin-bottom: 8px;
        }

        .card-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .card-brand {
          font-weight: 600;
        }

        .card-number {
          font-family: monospace;
          font-size: 14px;
        }

        .card-expiry {
          font-size: 12px;
          color: #999;
        }

        .default-badge {
          background: #f5b04220;
          color: #f5b042;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .card-actions button {
          background: none;
          border: none;
          font-size: 12px;
          color: #f5b042;
          cursor: pointer;
        }

        .card-actions .delete-btn {
          color: #dc2626;
        }

        .divider {
          text-align: center;
          margin: 20px 0;
          position: relative;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e5e7eb;
        }

        .divider span {
          background: white;
          padding: 0 12px;
          position: relative;
          font-size: 12px;
          color: #999;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          cursor: pointer;
        }

        .bank-info-alert {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #fef3c7;
          border-radius: 12px;
          margin-bottom: 20px;
          border-right: 4px solid #f5b042;
        }

        .bank-info-alert p {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }

        .file-upload {
          margin-top: 16px;
        }

        .file-upload label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .file-upload input {
          width: 100%;
          padding: 10px;
          border: 1px dashed #ccc;
          border-radius: 12px;
        }

        .file-upload small {
          font-size: 11px;
          color: #999;
        }

        .agency-info {
          background: #e0f2fe;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .agency-info ul {
          margin-top: 8px;
          list-style: none;
        }

        .agency-info li {
          padding: 4px 0;
          font-size: 13px;
        }

        .provider-select {
          margin-bottom: 16px;
        }

        .provider-buttons {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .provider-btn {
          flex: 1;
          padding: 12px;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .provider-btn.active {
          border-color: #f5b042;
          background: #fff8f0;
        }

        .payment-history {
          margin-top: 40px;
        }

        .payment-history h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .payments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .payment-history-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          border: 1px solid #f0f0f0;
        }

        .payment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        .payment-order {
          font-weight: 700;
          color: #1a1a2e;
        }

        .payment-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .detail {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail span:first-child {
          font-size: 11px;
          color: #999;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .badge--success {
          background: #d1fae5;
          color: #065f46;
        }

        .badge--warning {
          background: #fed7aa;
          color: #9b2c1d;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: #f5b042;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .payment-methods-grid {
            grid-template-columns: 1fr;
          }
          
          .payment-details {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .selected-method-container {
            padding: 20px;
          }
          
          .card-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
        }
      `}</style>
    </ClientLayout>
  );
}
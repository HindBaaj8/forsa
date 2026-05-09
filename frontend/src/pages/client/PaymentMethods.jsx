// pages/client/PaymentMethods.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ClientLayout from '../../components/layout/ClientLayout';

export default function PaymentMethods() {
  const navigate = useNavigate();
  const [showAddCard, setShowAddCard] = useState(false);
  const [cards, setCards] = useState([
    {
      id: 1,
      type: 'visa',
      last4: '4242',
      expiry: '12/25',
      name: 'أحمد العلوي',
      isDefault: true,
    },
    {
      id: 2,
      type: 'mastercard',
      last4: '5555',
      expiry: '08/26',
      name: 'أحمد العلوي',
      isDefault: false,
    },
  ]);
  
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  
  const [errors, setErrors] = useState({});

  const getCardIcon = (type) => {
    if (type === 'visa') return '💳';
    if (type === 'mastercard') return '💳';
    return '💳';
  };

  const handleSetDefault = (id) => {
    setCards(cards.map(card => ({
      ...card,
      isDefault: card.id === id,
    })));
    toast.success('تم تعيين البطاقة كبطاقة افتراضية');
  };

  const handleDeleteCard = (id) => {
    setCards(cards.filter(card => card.id !== id));
    toast.success('تم حذف البطاقة');
  };

  const handleAddCard = () => {
    // Validate
    const newErrors = {};
    if (!newCard.cardNumber || newCard.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'رقم البطاقة غير صحيح';
    }
    if (!newCard.expiry) newErrors.expiry = 'تاريخ الانتهاء مطلوب';
    if (!newCard.cvv || newCard.cvv.length < 3) newErrors.cvv = 'رمز CVV غير صحيح';
    if (!newCard.name) newErrors.name = 'الاسم على البطاقة مطلوب';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Add new card
    const newCardData = {
      id: Date.now(),
      type: newCard.cardNumber.startsWith('4') ? 'visa' : 'mastercard',
      last4: newCard.cardNumber.slice(-4),
      expiry: newCard.expiry,
      name: newCard.name,
      isDefault: cards.length === 0,
    };
    
    setCards([...cards, newCardData]);
    setShowAddCard(false);
    setNewCard({ cardNumber: '', expiry: '', cvv: '', name: '' });
    toast.success('تم إضافة البطاقة بنجاح');
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s/g, '').replace(/\D/g, '').slice(0, 16);
    return v.replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <ClientLayout title="طرق الدفع">
      <div className="payment-methods-page">
        <div className="page-header">
          <div className="page-header__title">طرق الدفع</div>
          <div className="page-header__sub">إدارة بطاقات الدفع الخاصة بك</div>
        </div>
        
        {/* Cards List */}
        <div className="cards-list">
          {cards.map(card => (
            <div key={card.id} className="card payment-card">
              <div className="payment-card__header">
                <div className="payment-card__type">
                  <span className="payment-card__icon">{getCardIcon(card.type)}</span>
                  <span className="payment-card__name">
                    {card.type === 'visa' ? 'Visa' : 'Mastercard'} •••• {card.last4}
                  </span>
                </div>
                {card.isDefault && (
                  <span className="badge badge--active">افتراضي</span>
                )}
              </div>
              
              <div className="payment-card__details">
                <div className="payment-card__detail">
                  <span>💳</span>
                  <span>{card.name}</span>
                </div>
                <div className="payment-card__detail">
                  <span>📅</span>
                  <span>تنتهي في {card.expiry}</span>
                </div>
              </div>
              
              <div className="payment-card__actions">
                {!card.isDefault && (
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => handleSetDefault(card.id)}
                  >
                    تعيين كافتراضي
                  </button>
                )}
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => handleDeleteCard(card.id)}
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add Card Button */}
        {!showAddCard ? (
          <button
            className="btn btn--navy btn--full"
            onClick={() => setShowAddCard(true)}
            style={{ marginTop: 20 }}
          >
            + إضافة بطاقة جديدة
          </button>
        ) : (
          <div className="card add-card-form">
            <div className="card-title">
              إضافة بطاقة جديدة
              <button
                className="card-link"
                onClick={() => setShowAddCard(false)}
              >
                إلغاء
              </button>
            </div>
            
            <div className="form-group">
              <label className="form-label">رقم البطاقة *</label>
              <input
                type="text"
                className={`form-input ${errors.cardNumber ? 'err' : ''}`}
                placeholder="1234 5678 9012 3456"
                value={newCard.cardNumber}
                onChange={(e) => {
                  setNewCard({ ...newCard, cardNumber: formatCardNumber(e.target.value) });
                  setErrors({ ...errors, cardNumber: '' });
                }}
              />
              {errors.cardNumber && <span className="form-err">{errors.cardNumber}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">تاريخ الانتهاء *</label>
                <input
                  type="text"
                  className={`form-input ${errors.expiry ? 'err' : ''}`}
                  placeholder="MM/YY"
                  value={newCard.expiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length >= 2) {
                      val = val.slice(0, 2) + '/' + val.slice(2, 4);
                    }
                    setNewCard({ ...newCard, expiry: val });
                    setErrors({ ...errors, expiry: '' });
                  }}
                  maxLength={5}
                />
                {errors.expiry && <span className="form-err">{errors.expiry}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">رمز CVV *</label>
                <input
                  type="password"
                  className={`form-input ${errors.cvv ? 'err' : ''}`}
                  placeholder="123"
                  maxLength={4}
                  value={newCard.cvv}
                  onChange={(e) => {
                    setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, '') });
                    setErrors({ ...errors, cvv: '' });
                  }}
                />
                {errors.cvv && <span className="form-err">{errors.cvv}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">الاسم على البطاقة *</label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'err' : ''}`}
                placeholder="أحمد العلوي"
                value={newCard.name}
                onChange={(e) => {
                  setNewCard({ ...newCard, name: e.target.value });
                  setErrors({ ...errors, name: '' });
                }}
              />
              {errors.name && <span className="form-err">{errors.name}</span>}
            </div>
            
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn--ghost" onClick={() => setShowAddCard(false)}>
                إلغاء
              </button>
              <button className="btn btn--navy" onClick={handleAddCard}>
                إضافة البطاقة
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .payment-methods-page {
          max-width: 700px;
          margin: 0 auto;
        }
        
        .cards-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .payment-card {
          padding: 20px;
        }
        
        .payment-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .payment-card__type {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .payment-card__icon {
          font-size: 28px;
        }
        
        .payment-card__name {
          font-size: 15px;
          font-weight: 800;
          color: var(--text1);
        }
        
        .payment-card__details {
          display: flex;
          gap: 24px;
          margin-bottom: 16px;
          padding: 12px 0;
          border-top: 1px solid var(--gray100);
          border-bottom: 1px solid var(--gray100);
        }
        
        .payment-card__detail {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text2);
        }
        
        .payment-card__actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        
        .add-card-form {
          margin-top: 20px;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 600px) {
          .payment-card__details {
            flex-direction: column;
            gap: 10px;
          }
          
          .payment-card__actions {
            flex-direction: column;
          }
          
          .payment-card__actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </ClientLayout>
  );
}
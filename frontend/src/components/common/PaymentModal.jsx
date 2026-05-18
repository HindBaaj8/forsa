import React, { useState } from 'react';
import { X, CreditCard, Calendar, Lock } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, onSuccess, amount, planName }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      onSuccess();
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h3>💳 إتمام الدفع</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="payment-amount">
          <span className="amount-label">المبلغ:</span>
          <span className="amount-value">{amount} درهم</span>
          <span className="plan-name">{planName}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card-input-group">
            <label>رقم البطاقة</label>
            <div className="card-input-wrapper">
              <CreditCard size={18} className="input-icon" />
              <input
                type="text"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="card-row">
            <div className="card-input-group half">
              <label>تاريخ الصلاحية</label>
              <div className="card-input-wrapper">
                <Calendar size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="card-input-group half">
              <label>رمز الأمان</label>
              <div className="card-input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="pay-btn">
            {loading ? 'جاري المعالجة...' : `دفع ${amount} درهم`}
          </button>
        </form>

        <p className="payment-note">بيانات تجريبية فقط. لن يتم خصم أي مبلغ حقيقي.</p>
      </div>

      <style>{`
        .payment-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .payment-modal {
          background: white;
          border-radius: 32px;
          width: 90%;
          max-width: 450px;
          overflow: hidden;
        }
        .payment-modal-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #eee;
        }
        .payment-amount {
          padding: 20px;
          text-align: center;
          background: #f8f9fa;
        }
        .amount-value {
          font-size: 32px;
          font-weight: bold;
          color: #FFD700;
          margin: 0 10px;
        }
        form {
          padding: 20px;
        }
        .card-input-group {
          margin-bottom: 20px;
        }
        .card-input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .card-input-wrapper {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }
        .card-input-wrapper input {
          width: 100%;
          padding: 14px 14px 14px 40px;
          border: 1px solid #ddd;
          border-radius: 12px;
          font-size: 16px;
        }
        .card-row {
          display: flex;
          gap: 15px;
        }
        .half {
          flex: 1;
        }
        .pay-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #FFD700, #FFA500);
          border: none;
          border-radius: 12px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          margin-top: 20px;
        }
        .pay-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .payment-note {
          text-align: center;
          font-size: 11px;
          color: #999;
          padding: 0 20px 20px;
        }
      `}</style>
    </div>
  );
}
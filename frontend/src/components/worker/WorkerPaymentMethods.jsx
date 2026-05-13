// components/worker/WorkerPaymentMethods.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, Trash2, Check } from 'lucide-react';
import WorkerLayout from '../layout/WorkerLayout';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import { toast } from 'react-hot-toast';
import '../../styles/Dashboard.css';

export default function WorkerPaymentMethods() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, bank_name: 'BMCE', account_number: '123456789012', account_name: 'أحمد العلوي', is_default: true }
  ]);

  const handleDelete = (id) => {
    setBankAccounts(bankAccounts.filter(a => a.id !== id));
    toast.success('تم حذف الحساب البنكي');
  };

  const handleSetDefault = (id) => {
    setBankAccounts(bankAccounts.map(a => ({ ...a, is_default: a.id === id })));
    toast.success('تم تعيين الحساب كافتراضي');
  };

  return (
    <WorkerLayout title="طرق الدفع">
      <div className="page-header">
        <h1 className="page-header__title">طرق الدفع</h1>
        <p className="page-header__sub">إدارة حساباتك البنكية للسحب</p>
      </div>

      <div className="cards-list">
        {bankAccounts.map(account => (
          <div key={account.id} className="payment-card">
            <div className="payment-card__header">
              <div>
                <span className="payment-card__icon">🏦</span>
                <span className="payment-card__name">{account.bank_name}</span>
              </div>
              {account.is_default && <span className="badge badge--active">افتراضي</span>}
            </div>
            <div className="payment-card__details">
              <span>رقم الحساب: {account.account_number}</span>
              <span>اسم الحساب: {account.account_name}</span>
            </div>
            <div className="payment-card__actions">
              {!account.is_default && (
                <button className="btn btn--ghost btn--sm" onClick={() => handleSetDefault(account.id)}>
                  <Check size={14} /> تعيين كافتراضي
                </button>
              )}
              <button className="btn btn--danger btn--sm" onClick={() => handleDelete(account.id)}>
                <Trash2 size={14} /> حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="gold" full icon={Plus} onClick={() => setModalOpen(true)}>
        إضافة حساب بنكي
      </Button>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="إضافة حساب بنكي" onSave={() => {
        toast.success('تم إضافة الحساب');
        setModalOpen(false);
      }} saveText="إضافة">
        <Input label="اسم البنك" placeholder="BMCE, Attijari, CIH..." />
        <Input label="رقم الحساب" placeholder="123456789012" />
        <Input label="اسم الحساب" placeholder="كما يظهر في البنك" />
      </Modal>
    </WorkerLayout>
  );
}
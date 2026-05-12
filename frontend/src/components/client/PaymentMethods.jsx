import React, { useState } from 'react';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import ClientLayout from '../layout/ClientLayout';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { toast } from 'react-hot-toast';
import '../../styles/Client.css'; // فقط إذا styles داخل components
export default function PaymentMethods() {
  const [cards, setCards] = useState([{ id: 1, last4: '4242', expiry: '12/25', name: 'أحمد العلوي', isDefault: true }]);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDelete = (id) => {
    setCards(cards.filter(c => c.id !== id));
    toast.success('تم حذف البطاقة');
  };

  const handleSetDefault = (id) => {
    setCards(cards.map(c => ({ ...c, isDefault: c.id === id })));
    toast.success('تم تعيين البطاقة كافتراضية');
  };

  return (
    <ClientLayout title="طرق الدفع">
      <div className="page-header"><h1 className="page-header__title">طرق الدفع</h1><p className="page-header__sub">إدارة بطاقات الدفع الخاصة بك</p></div>
      <div className="cards-list">{cards.map(card => (<div key={card.id} className="payment-card"><div className="payment-card__header"><div><span className="payment-card__icon">💳</span><span className="payment-card__name">Visa •••• {card.last4}</span></div>{card.isDefault && <span className="badge badge--active">افتراضي</span>}</div><div className="payment-card__details"><span>📅 تنتهي في {card.expiry}</span><span>👤 {card.name}</span></div><div className="payment-card__actions">{!card.isDefault && <button className="btn btn--ghost btn--sm" onClick={() => handleSetDefault(card.id)}>تعيين كافتراضي</button>}<button className="btn btn--danger btn--sm" onClick={() => handleDelete(card.id)}><Trash2 size={14} /> حذف</button></div></div>))}<Button variant="navy" full icon={Plus} onClick={() => setModalOpen(true)}>إضافة بطاقة جديدة</Button></div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="إضافة بطاقة جديدة" onSave={() => { toast.success('تم إضافة البطاقة'); setModalOpen(false); }} saveText="إضافة">
        <Input label="رقم البطاقة" placeholder="1234 5678 9012 3456" />
        <div className="form-row"><Input label="تاريخ الانتهاء" placeholder="MM/YY" /><Input label="رمز CVV" placeholder="123" type="password" /></div>
        <Input label="الاسم على البطاقة" placeholder="كما يظهر على البطاقة" />
      </Modal>
    </ClientLayout>
  );
}
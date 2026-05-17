import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

export default function AdminManualPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await api.get('/admin/payments/manual/pending');
            setPayments(response.data.data || []);
        } catch (error) {
            toast.error('حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (paymentId) => {
        try {
            await api.post(`/payments/manual/approve/${paymentId}`);
            toast.success('تم قبول الدفع وتفعيل الميزة');
            fetchPayments();
        } catch (error) {
            toast.error('حدث خطأ');
        }
    };

    const handleReject = async (paymentId) => {
        try {
            await api.post(`/payments/manual/reject/${paymentId}`);
            toast.success('تم رفض الدفع');
            fetchPayments();
        } catch (error) {
            toast.error('حدث خطأ');
        }
    };

    return (
        <div className="admin-manual-payments">
            <h2>📎 طلبات الدفع اليدوي</h2>
            {payments.length === 0 ? (
                <p>لا توجد طلبات معلقة</p>
            ) : (
                payments.map(payment => (
                    <div key={payment.id} className="payment-item">
                        <div className="payment-info">
                            <strong>{payment.user?.first_name} {payment.user?.last_name}</strong>
                            <span>{payment.amount} درهم</span>
                            <span>{payment.created_at?.split('T')[0]}</span>
                        </div>
                        <div className="payment-actions">
                            <a href={payment.receipt_url} target="_blank" className="btn-view">
                                <Eye size={16} /> عرض الإثبات
                            </a>
                            <button className="btn-approve" onClick={() => handleApprove(payment.id)}>
                                <CheckCircle size={16} /> قبول
                            </button>
                            <button className="btn-reject" onClick={() => handleReject(payment.id)}>
                                <XCircle size={16} /> رفض
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
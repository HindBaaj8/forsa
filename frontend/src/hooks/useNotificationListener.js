// hooks/useNotificationListener.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEcho } from '../services/echo';
import { getDashboard, getClientRequests } from '../features/client/clientSlice';
import { getWorkerDashboard, getWorkerOrders, getWorkerServices, getWorkerEarnings } from '../features/worker/workerSlice';
import { toast } from 'react-hot-toast';

export const useNotificationListener = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!user) return;
        
        const echo = getEcho();
        if (!echo) return;
        
        const channel = echo.private(`user.${user.id}.notifications`);
        
        channel.listen('.data.updated', (data) => {
            console.log('📢 Realtime update:', data);
            
            switch (data.type) {
                case 'request_created':
                case 'request_updated':
                case 'request_cancelled':
                    if (user.role === 'client') {
                        dispatch(getClientRequests());
                        dispatch(getDashboard());
                    }
                    toast.success(data.message);
                    break;
                    
                case 'service_created':
                case 'service_updated':
                case 'service_deleted':
                    if (user.role === 'worker') {
                        dispatch(getWorkerServices());
                        dispatch(getWorkerDashboard());
                    }
                    toast.success(data.message);
                    break;
                    
                case 'order_accepted':
                case 'order_started':
                case 'order_completed':
                case 'order_cancelled':
                    if (user.role === 'worker') {
                        dispatch(getWorkerOrders());
                        dispatch(getWorkerDashboard());
                    }
                    if (user.role === 'client') {
                        dispatch(getDashboard());
                        dispatch(getClientRequests());
                    }
                    toast.success(data.message);
                    break;
                    
                case 'earnings_updated':
                    if (user.role === 'worker') {
                        dispatch(getWorkerDashboard());
                        dispatch(getWorkerEarnings());
                    }
                    toast.success(data.message);
                    break;
                    
                default:
                    if (user.role === 'client') {
                        dispatch(getDashboard());
                        dispatch(getClientRequests());
                    } else if (user.role === 'worker') {
                        dispatch(getWorkerDashboard());
                        dispatch(getWorkerOrders());
                    }
                    break;
            }
        });
        
        return () => {
            echo.leave(`user.${user.id}.notifications`);
        };
    }, [user, dispatch]);
};
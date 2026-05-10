// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await api.get('/user');
            setUser(response.data);
        } catch (error) {
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            const { token: newToken, user: userData } = response.data;
            
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);
            toast.success('تم تسجيل الدخول بنجاح');
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.message || 'فشل تسجيل الدخول';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/register', userData);
            const { token: newToken, user: userDataResponse } = response.data;
            
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userDataResponse);
            toast.success('تم إنشاء الحساب بنجاح');
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.message || 'فشل إنشاء الحساب';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        toast.success('تم تسجيل الخروج');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            isAuthenticated: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
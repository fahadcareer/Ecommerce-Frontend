import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [globalLoading, setGlobalLoading] = useState(false);

    useEffect(() => {
        // Listen for session expiry from API interceptor
        const handleAuthExpired = (event) => {
            logout();
            toast.warning(event.detail.message);
        };

        window.addEventListener('auth-expired', handleAuthExpired);

        const checkUserLoggedIn = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        checkUserLoggedIn();
        return () => window.removeEventListener('auth-expired', handleAuthExpired);
    }, []);

    const login = async (email, password) => {
        setGlobalLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, ...userData } = res.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            toast.success('Logged in successfully!');
            return res.data;
        } finally {
            setGlobalLoading(false);
        }
    };

    const register = async (userData) => {
        setGlobalLoading(true);
        try {
            const res = await api.post('/auth/register', userData);
            const { token, ...data } = res.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            toast.success('Account created successfully!');
            return res.data;
        } finally {
            setGlobalLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            loading,
            globalLoading,
            setGlobalLoading,
            login,
            logout,
            register,
            isAdmin: user?.role === 'admin'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../services/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            setSettings(res.data.data);
        } catch (err) {
            console.error('Error fetching site settings:', err);
            setError(err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err);
        }
    };

    const loadAll = async () => {
        setLoading(true);
        await Promise.all([fetchSettings(), fetchCategories()]);
        setLoading(false);
    };

    useEffect(() => {
        loadAll();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, categories, loading, error, refreshSettings: loadAll }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    withCredentials: true,
    timeout: 15000, // 15 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * @desc Standardize error objects coming from the API
 */
const normalizeError = (error) => {
    const normalized = {
        message: 'An unexpected error occurred. Please try again.',
        status: error.response?.status || 500,
        errors: error.response?.data?.errors || null,
        code: error.code || 'UNKNOWN_ERROR'
    };

    if (error.response?.data?.message) {
        normalized.message = error.response.data.message;
    } else if (error.code === 'ECONNABORTED') {
        normalized.message = 'The request took too long. Please check your connection.';
    } else if (!error.response) {
        normalized.message = 'Network error. Please check your internet connection.';
    }

    return normalized;
};

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(normalizeError(error))
);

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const normalized = normalizeError(error);

        // 1. Handle Token Expiration (401)
        if (error.response?.status === 401 && !originalRequest._retry) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            window.dispatchEvent(new CustomEvent('auth-expired', {
                detail: { message: 'Your session has expired. Please login again.' }
            }));

            return Promise.reject(normalized);
        }

        // 2. Simple Retry Logic for Network Errors / Timeouts (up to 2 times)
        if (
            (error.code === 'ECONNABORTED' || !error.response) &&
            (!originalRequest._retryCount || originalRequest._retryCount < 2)
        ) {
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
            return api(originalRequest);
        }

        // Global Error Toast (exclude 401 as it has custom event handling)
        if (error.response?.status !== 401) {
            toast.error(normalized.message);
        }

        return Promise.reject(normalized);
    }
);

export default api;

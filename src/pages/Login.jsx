import React, { useState } from 'react';
import { useAuth } from '../context/store/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useDocumentTitle from '../hooks/useDocumentTitle';
import './Auth.css';

const Login = () => {
    useDocumentTitle('Login | Ecommerce');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData.email, formData.password);
            const destination = location.state?.from || '/';
            navigate(destination);
        } catch (err) {
            // Handled by global interceptor
        }
    };

    return (
        <div className="auth-container-wrapper">
            <Navbar />
            <div className="auth-page">
                <div className="auth-form-container">
                    <h1 className="auth-title">Login</h1>
                    <p className="auth-subtitle">Please enter your e-mail and password:</p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-input-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="E-mail"
                                required
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="auth-input-group password-group">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                            <Link to="#" className="forgot-pass">Forgot password?</Link>
                        </div>
                        <button type="submit" className="auth-submit-btn">LOGIN</button>
                    </form>

                    <div className="auth-footer-text">
                        New customer? <Link to="/register">Create an account</Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;

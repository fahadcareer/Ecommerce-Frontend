import React, { useState } from 'react';
import { useAuth } from '../context/store/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Combine names for the backend which expects 'name'
            const combinedData = {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                password: formData.password
            };
            await register(combinedData);
            navigate('/');
        } catch (err) {
            // Handled by global interceptor
        }
    };

    return (
        <div className="auth-container-wrapper">
            <Navbar />
            <div className="auth-page">
                <div className="auth-form-container register-container">
                    <h1 className="auth-title">Register</h1>
                    <p className="auth-subtitle">Please fill in the fields below:</p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-input-group">
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First name"
                                required
                                autoComplete="given-name"
                                value={formData.firstName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="auth-input-group">
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last name"
                                required
                                autoComplete="family-name"
                                value={formData.lastName}
                                onChange={handleInputChange}
                            />
                        </div>
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
                        <div className="auth-input-group">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                        </div>
                        <button type="submit" className="auth-submit-btn">CREATE ACCOUNT</button>
                    </form>

                    <div className="auth-footer-text">
                        Already have an account? <Link to="/login">Login</Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Register;

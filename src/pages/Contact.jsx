import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSettings } from '../context/store/SettingsContext';
import { toast } from 'react-toastify';
import './Contact.css';

const Contact = () => {
    const { settings: siteInfo } = useSettings();
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here (e.g., API call)
        toast.success('Message sent! (Demo)');
    };

    if (loading) return <div className="loader">Loading...</div>;

    return (
        <div className="contact-page">
            <Navbar />
            <div className="contact-container container">
                <header className="contact-header">
                    <h1>Contact Us</h1>
                    <p>Have questions or need assistance? Reach out to us—we're here to help and would love to hear from you!</p>
                </header>

                <div className="contact-content-grid">
                    {/* Left Column: Info */}
                    <div className="contact-info-col">
                        <div className="info-section">
                            <h4>SHOP LOCATION</h4>
                            <p style={{ whiteSpace: 'pre-line' }}>
                                {siteInfo?.footerAddress || 'Address not available.'}
                            </p>
                        </div>
                        <div className="info-section">
                            <h4>CUSTOMER CARE</h4>
                            <p className="highlight">Business Hours</p>
                            <p>{siteInfo?.footerTimings || '9:00 AM - 9:00 PM'}</p>
                            <p>Ph: {siteInfo?.footerWhatsApp || '+91 00000 00000'}</p>
                            <p>Instagram: {siteInfo?.footerInstagram || '@estore'}</p>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="contact-form-col">
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" required />
                            </div>
                            <div className="form-group">
                                <label>E-mail</label>
                                <input type="email" required />
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea rows="6" required></textarea>
                            </div>
                            <button type="submit" className="contact-submit-btn">SUBMIT</button>
                        </form>
                    </div>
                </div>

                <div className="get-direction-section">
                    <h2>Get Direction</h2>
                    {/* Placeholder for map or link. Could also specificy map link in settings if desired. */}
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteInfo?.footerAddress || '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="map-link"
                    >
                        View on Google Maps
                    </a>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Contact;

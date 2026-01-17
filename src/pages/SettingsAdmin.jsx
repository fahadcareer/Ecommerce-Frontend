import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import './AdminPages.css';

const SettingsAdmin = () => {
    const [settings, setSettings] = useState({
        heroImage: '',
        heroImages: [],
        siteName: '',
        siteLogo: '',
        siteFavicon: '',
        footerAbout: '',
        footerAddress: '',
        footerTimings: '',
        footerWhatsApp: '',
        footerInstagram: '',
        newsletterImage: '',
        newsletterImages: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            setSettings(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.patch('/settings', settings);
            toast.success('Settings updated successfully!');
        } catch (error) {
            // Handled by global interceptor
        }
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="settings-admin">
            <div className="page-header">
                <h2>Site Settings</h2>
            </div>

            <div className="admin-form-container card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                <form className="admin-form" onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Branding */}
                        <div className="section">
                            <h3>General Branding</h3>
                            <div className="form-group">
                                <label>Website Logo (Text or Image URL)</label>
                                <input
                                    type="text"
                                    value={settings.siteLogo}
                                    onChange={e => setSettings({ ...settings, siteLogo: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Site Name</label>
                                <input
                                    type="text"
                                    value={settings.siteName}
                                    onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Site Favicon (Image URL)</label>
                                <input
                                    type="text"
                                    value={settings.siteFavicon}
                                    onChange={e => setSettings({ ...settings, siteFavicon: e.target.value })}
                                    placeholder="/favicon.ico"
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div className="section">
                            <h3>Site Assets</h3>
                            <div className="form-group">
                                <label>Hero Banner(s)</label>
                                <div className="multi-image-inputs">
                                    {(settings.heroImages || []).map((img, index) => (
                                        <div key={index} className="image-input-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <input
                                                type="text"
                                                value={img}
                                                placeholder="Image URL"
                                                onChange={e => {
                                                    const newImages = [...settings.heroImages];
                                                    newImages[index] = e.target.value;
                                                    setSettings({ ...settings, heroImages: newImages });
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImages = settings.heroImages.filter((_, i) => i !== index);
                                                    setSettings({ ...settings, heroImages: newImages });
                                                }}
                                                style={{ padding: '0 10px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px' }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setSettings({ ...settings, heroImages: [...(settings.heroImages || []), ''] })}
                                        style={{ fontSize: '13px', background: '#f1f5f9', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                    >
                                        + Add Another Hero Image
                                    </button>
                                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
                                        Note: If 2 images are added, they will show half-width on desktop. On mobile they will scroll.
                                    </p>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Newsletter Banner(s)</label>
                                <div className="multi-image-inputs">
                                    {(settings.newsletterImages || []).map((img, index) => (
                                        <div key={index} className="image-input-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <input
                                                type="text"
                                                value={img}
                                                placeholder="Image URL"
                                                onChange={e => {
                                                    const newImages = [...settings.newsletterImages];
                                                    newImages[index] = e.target.value;
                                                    setSettings({ ...settings, newsletterImages: newImages });
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImages = settings.newsletterImages.filter((_, i) => i !== index);
                                                    setSettings({ ...settings, newsletterImages: newImages });
                                                }}
                                                style={{ padding: '0 10px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px' }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setSettings({ ...settings, newsletterImages: [...(settings.newsletterImages || []), ''] })}
                                        style={{ fontSize: '13px', background: '#f1f5f9', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                    >
                                        + Add Another Newsletter Image
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr style={{ margin: '2rem 0', opacity: 0.1 }} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Footer Content */}
                        <div className="section">
                            <h3>Footer Information</h3>
                            <div className="form-group">
                                <label>About Content</label>
                                <textarea
                                    rows="4"
                                    value={settings.footerAbout}
                                    onChange={e => setSettings({ ...settings, footerAbout: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    value={settings.footerAddress}
                                    onChange={e => setSettings({ ...settings, footerAddress: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className="section">
                            <h3>Support & Socials</h3>
                            <div className="form-group">
                                <label>Business Timings</label>
                                <input
                                    type="text"
                                    value={settings.footerTimings}
                                    onChange={e => setSettings({ ...settings, footerTimings: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>WhatsApp Number</label>
                                <input
                                    type="text"
                                    value={settings.footerWhatsApp}
                                    onChange={e => setSettings({ ...settings, footerWhatsApp: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Instagram Handle</label>
                                <input
                                    type="text"
                                    value={settings.footerInstagram}
                                    onChange={e => setSettings({ ...settings, footerInstagram: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="add-btn" style={{ width: '100%', marginTop: '2rem', height: '50px', fontSize: '1rem' }}>
                        SAVE GLOBAL SETTINGS
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SettingsAdmin;

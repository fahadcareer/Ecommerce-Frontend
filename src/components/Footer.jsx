import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/store/SettingsContext';
import './Footer.css';

const Footer = () => {
    const { settings, categories } = useSettings();
    const newsletterScrollRef = React.useRef(null);

    // Auto-scroll for newsletter on mobile
    useEffect(() => {
        if (!settings || !settings.newsletterImages || settings.newsletterImages.length <= 1 || window.innerWidth > 768) return;

        const interval = setInterval(() => {
            if (newsletterScrollRef.current) {
                const { scrollLeft, offsetWidth, scrollWidth } = newsletterScrollRef.current;
                if (scrollLeft + offsetWidth >= scrollWidth - 10) {
                    newsletterScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    newsletterScrollRef.current.scrollBy({ left: offsetWidth, behavior: 'smooth' });
                }
            }
        }, 4500);

        return () => clearInterval(interval);
    }, [settings]);

    const content = settings || {
        siteLogo: 'E-Store',
        siteName: 'E-Store',
        footerAbout: 'Your premier destination for modern fashion.',
        footerAddress: 'Address goes here',
        footerTimings: '11:00 AM - 9:00 PM',
        footerWhatsApp: '+91 00000 00000',
        footerInstagram: '@estore',
        newsletterImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04',
        newsletterImages: []
    };

    const displayNewsletterArr = content.newsletterImages?.length > 0 ? content.newsletterImages : [content.newsletterImage];

    return (
        <footer className="main-footer">
            <div className={`footer-newsletter-section ${displayNewsletterArr.length > 1 ? 'split-newsletter' : 'single-newsletter'}`}>
                <div className="newsletter-bg-container" ref={newsletterScrollRef}>
                    {displayNewsletterArr.map((img, idx) => (
                        <div key={idx} className="newsletter-bg-slide" style={{ backgroundImage: `url(${img})` }}></div>
                    ))}
                </div>
                <div className="newsletter-overlay-card">
                    <h3>SUBSCRIBE TO OUR NEWSLETTER</h3>
                    <p>Promotions, new products and sales. Directly to your inbox.</p>
                    <form className="newsletter-form-inline">
                        <input type="email" placeholder="Your e-mail" required />
                        <button type="submit">SUBSCRIBE</button>
                    </form>
                </div>
            </div>

            <div className="footer-black-section">
                <div className="container footer-content">
                    <div className="footer-grid">
                        <div className="footer-col brand-info">
                            <span className="footer-logo-script">{content.siteName}</span>
                            <p>{content.footerAbout}</p>
                        </div>

                        <div className="footer-col">
                            <h4>CUSTOMER CARE</h4>
                            <p>{content.footerAddress || 'No 67, Munisalai Main Road, Madurai, Tamil Nadu 625009'}</p>
                            <p>Timings: {content.footerTimings || '11:00 AM - 9:00 PM'}</p>
                            <p>WhatsApp: {content.footerWhatsApp || '+91 97891 14617'}</p>
                        </div>

                        <div className="footer-col">
                            <h4>MEN</h4>
                            <ul className="footer-links">
                                {categories.length > 0 ? (
                                    categories.slice(0, 5).map(cat => (
                                        <li key={cat._id}><Link to={`/collection/${cat.slug}`}>{cat.name}</Link></li>
                                    ))
                                ) : (
                                    <>
                                        <li><Link to="/">Shirts</Link></li>
                                        <li><Link to="/">T-Shirts</Link></li>
                                        <li><Link to="/">Pants</Link></li>
                                    </>
                                )}
                            </ul>
                        </div>

                        <div className="footer-col">
                            <h4>FOLLOW US</h4>
                            <p>Stay ahead of the style game — follow us on Instagram for daily fashion inspo, exclusive looks, and all the vibes you need to elevate your wardrobe.</p>
                            <div className="footer-links" style={{ display: 'flex', gap: '20px' }}>
                                <a href={`https://instagram.com/${content.footerInstagram?.replace('@', '') || 'estore'}`} target="_blank" rel="noreferrer">Instagram</a>
                                <a href={`https://wa.me/${content.footerWhatsApp?.replace(/[^0-9]/g, '') || ''}`} target="_blank" rel="noreferrer">WhatsApp</a>
                            </div>
                        </div>

                        <div className="footer-col">
                            <h4>SUBSCRIBE</h4>
                            <p>Join the vibe — get first access to exclusive drops, fresh fashion trends, and insider style tips!</p>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>© 2025, {content.siteName || 'Store'}</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

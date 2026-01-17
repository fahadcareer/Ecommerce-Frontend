import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/store/AuthContext';
import { useSettings } from '../context/store/SettingsContext';
import './MobileMenu.css';

const MobileMenu = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { categories } = useSettings();
    const [shopExpanded, setShopExpanded] = useState(false);
    const [supportExpanded, setSupportExpanded] = useState(false);

    const toggleShop = (e) => {
        e.preventDefault();
        setShopExpanded(!shopExpanded);
    };

    const toggleSupport = (e) => {
        e.preventDefault();
        setSupportExpanded(!supportExpanded);
    };

    return (
        <div className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
                <div className="mobile-menu-header">
                    <button className="close-menu-btn" onClick={onClose} aria-label="Close menu">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <nav className="mobile-menu-nav">
                    <ul className="mobile-nav-list">
                        <li>
                            <Link to="/" onClick={onClose}>Home</Link>
                        </li>
                        <li className={`has-dropdown ${shopExpanded ? 'expanded' : ''}`}>
                            <div className="nav-item-header" onClick={toggleShop}>
                                <Link to="/shop" onClick={onClose}>Shop</Link>
                                <span className="plus-icon">{shopExpanded ? '−' : '+'}</span>
                            </div>
                            <ul className="sub-nav-list">
                                {categories.map(cat => (
                                    <li key={cat._id}>
                                        <Link to={`/collection/${cat.slug}`} onClick={onClose}>
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>
                        <li className={`has-dropdown ${supportExpanded ? 'expanded' : ''}`}>
                            <div className="nav-item-header" onClick={toggleSupport}>
                                <Link to="/customer-support" onClick={onClose}>Customer Support</Link>
                                <span className="plus-icon">{supportExpanded ? '−' : '+'}</span>
                            </div>
                            <ul className="sub-nav-list">
                                <li><Link to="/contact" onClick={onClose}>Contact</Link></li>
                                <li><Link to="/faq" onClick={onClose}>FAQ</Link></li>
                            </ul>
                        </li>
                        <li>
                            <Link to="/faq" onClick={onClose}>FAQ</Link>
                        </li>
                        <li>
                            <Link to="/contact" onClick={onClose}>Contact</Link>
                        </li>
                    </ul>
                </nav>

                <div className="mobile-menu-footer">
                    <Link to={user ? "/account" : "/login"} className="mobile-account-link" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>{user ? 'Account' : 'Login'}</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MobileMenu;

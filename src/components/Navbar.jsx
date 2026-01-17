import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/store/AuthContext';
import { useCart } from '../context/store/CartContext';
import { useSettings } from '../context/store/SettingsContext';
import CartDrawer from './CartDrawer';
import SearchDrawer from './SearchDrawer';
import MobileMenu from './MobileMenu';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const { settings } = useSettings();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const navigate = useNavigate();

    const siteLogo = settings?.siteLogo || 'Store';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="site-header">
            {/* Announcement / Top Bar */}
            <div className="announcement-bar">
                <p>Follow us on Instagram <a href="#">Learn more</a></p>
            </div>

            {/* Main Header */}
            <nav className="header-main" role="navigation">
                <div className="header-container">
                    <div className="header-wrapper">

                        {/* LEFT PART - Navigation */}
                        <div className="header-left">
                            <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                            </button>

                            <button className="mobile-search-btn mobile-only" onClick={() => setIsSearchOpen(true)} aria-label="Search">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </button>

                            <ul className={`header-linklist desktop-only ${isMenuOpen ? 'mobile-open' : ''}`}>
                                <li className="header-linklist-item">
                                    <Link to="/" className="link-animated">Home</Link>
                                </li>
                                <li className="header-linklist-item">
                                    <Link to="/shop" className="link-animated">Shop</Link>
                                </li>
                                <li className="header-linklist-item">
                                    <Link to="/customer-support" className="link-animated">Customer Support</Link>
                                </li>
                                <li className="header-linklist-item">
                                    <Link to="/faq" className="link-animated">FAQ</Link>
                                </li>
                                <li className="header-linklist-item">
                                    <Link to="/contact" className="link-animated">Contact</Link>
                                </li>
                            </ul>
                        </div>

                        {/* LOGO PART - Center */}
                        <div className="header-center">
                            <Link to="/" className="header-logo">
                                {siteLogo.startsWith('http') ? (
                                    <img src={siteLogo} alt="Logo" className="logo-image" />
                                ) : (
                                    <span className="logo-text">{siteLogo}</span>
                                )}
                            </Link>
                        </div>

                        {/* RIGHT PART - Secondary Links */}
                        <div className="header-right">
                            <ul className="header-linklist secondary-linklist">
                                <li className="header-linklist-item desktop-only">
                                    <button className="nav-action search-btn-text" onClick={() => setIsSearchOpen(true)}>
                                        Search
                                    </button>
                                </li>
                                <li className="header-linklist-item desktop-only">
                                    {user ? (
                                        <Link to="/account" className="link-animated">Account</Link>
                                    ) : (
                                        <Link to="/login" className="link-animated">Login</Link>
                                    )}
                                </li>
                                <li className="header-linklist-item">
                                    <button className="cart-toggle-btn" onClick={() => setIsCartOpen(true)} aria-label="Cart">
                                        <div className="cart-icon-wrapper">
                                            <span className="desktop-only text-cart">Cart</span>
                                            <svg className="mobile-only icon-cart" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"></path>
                                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                                <path d="M16 10a4 4 0 01-8 0"></path>
                                            </svg>
                                            <span className="cart-count">{cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}</span>
                                        </div>
                                    </button>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            </nav>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </header>
    );
};

export default Navbar;

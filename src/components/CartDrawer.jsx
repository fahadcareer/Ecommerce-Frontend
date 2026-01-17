import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/store/AuthContext';
import { useCart } from '../context/store/CartContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import './CartDrawer.css';

const CartDrawer = ({ isOpen, onClose }) => {
    const { cart, updateQuantity, removeFromCart } = useCart();
    const { user } = useAuth();
    const [suggestedProducts, setSuggestedProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            fetchSuggestions();
        }
    }, [isOpen]);

    const fetchSuggestions = async () => {
        try {
            const res = await api.get('/products?limit=4'); // Get top 4 for suggestions
            setSuggestedProducts(res.data.data.products);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`cart-drawer-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
            <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
                <div className="drawer-container">
                    {/* Left Column - Suggestions */}
                    <div className="suggestions-section">
                        <h4>YOU MAY ALSO LIKE</h4>
                        <div className="suggestions-list">
                            {suggestedProducts.map(product => (
                                <div key={product._id} className="suggestion-item">
                                    <div className="suggestion-img">
                                        <img src={product.images[0]?.url || 'https://placehold.co/100'} alt={product.name} />
                                    </div>
                                    <div className="suggestion-info">
                                        <h5>{product.name}</h5>
                                        <div className="suggestion-price-row">
                                            <span className="price">Rs. {product.price.toLocaleString()}</span>
                                            {(product.originalPrice > product.price) ? (
                                                <span className="old-price">Rs. {product.originalPrice.toLocaleString()}</span>
                                            ) : (
                                                <span className="old-price">Rs. {(product.price * 1.25).toFixed(0).toLocaleString()}</span>
                                            )}
                                        </div>
                                        <button className="quick-view">Quick view</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Cart Content */}
                    <div className="cart-section">
                        <div className="cart-header">
                            <span className="item-count">
                                <span className="bag-icon">👜</span> {cart?.items?.length || 0} items
                            </span>
                            <button className="close-drawer" onClick={onClose}>✕</button>
                        </div>

                        {(!cart?.items || cart.items.length === 0) ? (
                            <div className="empty-cart-state">
                                <div className="empty-icon" style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🛍️</div>
                                <h3>Your bag is empty</h3>
                                <p style={{ color: '#666', marginBottom: '2rem' }}>Looks like you haven’t added anything yet.</p>
                                <button
                                    className="checkout-btn-drawer"
                                    onClick={() => {
                                        onClose();
                                        navigate('/shop');
                                    }}
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="cart-items-list">
                                    {cart?.items?.filter(item => item.product).map(item => (
                                        <div key={`${item.product?._id || Math.random()}-${item.size}`} className="cart-drawer-item">
                                            <div className="item-img">
                                                <img src={item.product?.images?.[0]?.url || 'https://placehold.co/100'} alt={item.product?.name || 'Product'} />
                                            </div>
                                            <div className="item-details">
                                                <div className="item-main">
                                                    <h6>{item.product?.name || 'Deleted Product'}</h6>
                                                    <div className="item-price-row">
                                                        <span className="item-price">Rs. {item.price?.toLocaleString() || 0}</span>
                                                        {(item.product?.originalPrice > item.price) ? (
                                                            <span className="item-old-price">Rs. {item.product.originalPrice.toLocaleString()}</span>
                                                        ) : (
                                                            <span className="item-old-price">Rs. {(item.price * 1.25).toFixed(0).toLocaleString()}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="item-variant">Size: {item.size}</p>
                                                <div className="item-actions">
                                                    <div className="qty-picker">
                                                        <button onClick={() => updateQuantity(item.product?._id, item.size, item.quantity - 1)}>-</button>
                                                        <span>{item.quantity}</span>
                                                        <button onClick={() => {
                                                            const sizeStock = item.product?.sizes?.find(s => s.size === item.size)?.stock || item.product?.stock || 0;
                                                            if (item.quantity < sizeStock) {
                                                                updateQuantity(item.product?._id, item.size, item.quantity + 1);
                                                            } else {
                                                                toast.error('No more stock available');
                                                            }
                                                        }}>+</button>
                                                    </div>
                                                    <div className="item-drawer-stock">
                                                        {(() => {
                                                            const sizeStock = item.product?.sizes?.find(s => s.size === item.size)?.stock || item.product?.stock || 0;
                                                            return sizeStock < 5 && sizeStock > 0 ? (
                                                                <span style={{ fontSize: '0.7rem', color: '#e11d48' }}>Only {sizeStock} left</span>
                                                            ) : sizeStock === 0 ? (
                                                                <span style={{ fontSize: '0.7rem', color: '#e11d48', fontWeight: 'bold' }}>Out of stock</span>
                                                            ) : null;
                                                        })()}
                                                    </div>
                                                    <button className="remove-link" onClick={() => removeFromCart(item.product?._id, item.size)}>Remove</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="cart-footer">
                                    <div className="footer-notes">
                                        <button className="add-note">+ Add order note</button>
                                        <p>Shipping & taxes calculated at checkout</p>
                                    </div>
                                    <button
                                        className="checkout-btn-drawer"
                                        onClick={() => {
                                            onClose();
                                            if (user) {
                                                navigate('/checkout');
                                            } else {
                                                toast.info('Please login to continue to checkout');
                                                navigate('/login', { state: { from: '/checkout' } });
                                            }
                                        }}
                                    >
                                        🔒 CHECKOUT • RS. {cart?.totalAmount?.toLocaleString() || 0}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;

import React from 'react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/store/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Cart.css';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart } = useCart();
    const navigate = useNavigate();

    if (cart.items.length === 0) {
        return (
            <div className="cart-page">
                <Navbar />
                <div className="empty-cart">
                    <h2>Your cart is empty</h2>
                    <p>Add some products to get started!</p>
                    <Link to="/" className="shop-btn">Continue Shopping</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <Navbar />
            <div className="cart-container">
                <div className="cart-header-main">
                    <h1>Shopping Bag ({cart.items.length})</h1>
                    <Link to="/shop" className="continue-shopping"> ← Continue Shopping</Link>
                </div>

                <div className="cart-layout">
                    {/* Left Column: Items */}
                    <div className="cart-items-section">
                        {cart.items.map(item => (
                            <div key={`${item.product._id}-${item.size}`} className="cart-item-card">
                                <Link to={`/product/${item.product._id}`} className="item-image">
                                    <img src={item.product.images[0]?.url || 'https://placehold.co/150'} alt={item.product.name} />
                                </Link>

                                <div className="item-info">
                                    <div className="item-header">
                                        <Link to={`/product/${item.product._id}`} className="item-name">
                                            {item.product.name}
                                        </Link>
                                        <span className="item-total-price">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                                    </div>

                                    <div className="item-meta">
                                        <span className="item-size-badge">{item.size}</span>
                                        <span className="item-unit-price">Rs. {item.price.toLocaleString()}</span>
                                    </div>

                                    <div className="item-controls">
                                        <div className="qty-wrapper">
                                            <button onClick={() => updateQuantity(item.product._id, item.size, Math.max(1, item.quantity - 1))}>−</button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button onClick={() => {
                                                const sizeStock = item.product.sizes?.find(s => s.size === item.size)?.stock || item.product.stock;
                                                if (item.quantity < sizeStock) {
                                                    updateQuantity(item.product._id, item.size, item.quantity + 1);
                                                } else {
                                                    toast.error('Max stock reached');
                                                }
                                            }}>+</button>
                                        </div>

                                        <button className="remove-link-btn" onClick={() => removeFromCart(item.product._id, item.size)}>
                                            Remove
                                        </button>
                                    </div>

                                    <div className="stock-warning">
                                        {(() => {
                                            const sizeStock = item.product.sizes?.find(s => s.size === item.size)?.stock || item.product.stock;
                                            return sizeStock < 5 && sizeStock > 0 ? (
                                                <span className="warning-text">Only {sizeStock} left in stock - order soon!</span>
                                            ) : sizeStock === 0 ? (
                                                <span className="error-text">Out of stock</span>
                                            ) : null;
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Summary */}
                    <div className="cart-summary-section">
                        <div className="summary-card">
                            <h3>Order Summary</h3>

                            <div className="summary-line">
                                <span>Subtotal</span>
                                <span>Rs. {cart.totalAmount.toLocaleString()}</span>
                            </div>

                            <div className="summary-line">
                                <span>Shipping estimate</span>
                                <span>{cart.totalAmount > 5000 ? 'FREE' : 'Rs. 30 (Prepaid)'}</span>
                            </div>

                            <div className="summary-line">
                                <span>Tax estimate (18%)</span>
                                <span>Calculated at checkout</span>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-total">
                                <span>Total</span>
                                <span className="total-amount">Rs. {cart.totalAmount.toLocaleString()}</span>
                            </div>
                            <p className="shipping-note">Shipping & taxes calculated at checkout</p>

                            <button className="checkout-btn-primary" onClick={() => navigate('/checkout')}>
                                CHECKOUT NOW
                            </button>

                            <div className="secure-badges">
                                <span>🔒 Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;

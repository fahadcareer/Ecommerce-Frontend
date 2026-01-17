import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useCart } from '../context/store/CartContext';
import { useAuth } from '../context/store/AuthContext';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1); // 1: Information, 2: Shipping, 3: Payment
    const [highestStep, setHighestStep] = useState(1); // Track the highest step user has reached

    const [formData, setFormData] = useState({
        email: user?.email || '',
        firstName: '',
        lastName: '',
        company: '',
        address: '',
        apartment: '',
        city: '',
        state: 'Karnataka',
        pinCode: '',
        phone: '',
        saveInfo: false
    });

    const [shippingMethod, setShippingMethod] = useState('prepaid');
    const [discountCode, setDiscountCode] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('phonepe');
    const [loading, setLoading] = useState(false);

    // Load saved data on mount
    useEffect(() => {
        const savedData = localStorage.getItem('checkoutFormData');
        if (savedData) {
            setFormData(prev => ({
                ...prev,
                ...JSON.parse(savedData),
                // Always prioritize current auth email if logged in
                email: user?.email || JSON.parse(savedData).email
            }));
        }
    }, [user]);

    // Save data on change
    useEffect(() => {
        localStorage.setItem('checkoutFormData', JSON.stringify(formData));
    }, [formData]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleBreadcrumbClick = (step) => {
        // Only allow clicking on completed steps or current step
        if (step <= highestStep) {
            setCurrentStep(step);
            window.scrollTo(0, 0);
        }
    };

    const handleContinueToShipping = (e) => {
        e.preventDefault();
        // Validate information form
        if (!formData.email || !formData.firstName || !formData.lastName ||
            !formData.address || !formData.city || !formData.pinCode || !formData.phone) {
            toast.error('Please fill all required fields');
            return;
        }
        setCurrentStep(2);
        setHighestStep(Math.max(highestStep, 2));
        window.scrollTo(0, 0);
    };

    const handleContinueToPayment = (e) => {
        e.preventDefault();
        setCurrentStep(3);
        setHighestStep(Math.max(highestStep, 3));
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please login to place order');
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const shippingAddress = {
                street: `${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}`,
                city: formData.city,
                state: formData.state,
                zipCode: formData.pinCode,
                country: 'India'
            };

            const res = await api.post('/orders', {
                shippingAddress,
                paymentMethod: paymentMethod === 'phonepe' || paymentMethod === 'razorpay' ? 'Prepaid' : 'CashOnDelivery', // Map to backend enum if needed, or send raw
                shippingMethod // Send this to backend
            });

            if (res.data.success) {
                toast.success('Order placed successfully!');
                clearCart();
                localStorage.removeItem('checkoutFormData'); // Clear saved form
                navigate('/account');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const subtotal = cart?.totalAmount || 0;
    const shippingCost = shippingMethod === 'prepaid' ? 30 : 0;
    const total = subtotal + shippingCost;

    const shippingAddressText = `${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}, ${formData.city}, ${formData.state} ${formData.pinCode}, India`;

    return (
        <div className="checkout-page">
            <div className="checkout-grid">
                {/* Left Side - Form */}
                <div className="checkout-form-section">
                    <div className="checkout-header">
                        <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
                            <Link to="/cart">Cart</Link>
                            <span aria-hidden="true">›</span>
                            <button
                                type="button"
                                className={`breadcrumb-step ${currentStep >= 1 ? 'active' : 'inactive'} ${1 <= highestStep ? 'clickable' : ''}`}
                                onClick={() => handleBreadcrumbClick(1)}
                                disabled={1 > highestStep}
                                aria-current={currentStep === 1 ? 'step' : undefined}
                                aria-label="Information Step"
                            >
                                Information
                            </button>
                            <span aria-hidden="true">›</span>
                            <button
                                type="button"
                                className={`breadcrumb-step ${currentStep >= 2 ? 'active' : 'inactive'} ${2 <= highestStep ? 'clickable' : ''}`}
                                onClick={() => handleBreadcrumbClick(2)}
                                disabled={2 > highestStep}
                                aria-current={currentStep === 2 ? 'step' : undefined}
                                aria-label="Shipping Step"
                            >
                                Shipping
                            </button>
                            <span aria-hidden="true">›</span>
                            <button
                                type="button"
                                className={`breadcrumb-step ${currentStep >= 3 ? 'active' : 'inactive'} ${3 <= highestStep ? 'clickable' : ''}`}
                                onClick={() => handleBreadcrumbClick(3)}
                                disabled={3 > highestStep}
                                aria-current={currentStep === 3 ? 'step' : undefined}
                                aria-label="Payment Step"
                            >
                                Payment
                            </button>
                        </nav>
                    </div>

                    {/* Step 1: Information */}
                    {currentStep === 1 && (
                        <form className="checkout-form" onSubmit={handleContinueToShipping}>
                            <div className="form-section">
                                <div className="section-header">
                                    <h2>Contact</h2>
                                    {!user && <Link to="/login" className="sign-in-link">Sign in</Link>}
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    autoComplete="email"
                                    className="full-width-input"
                                />
                                <label className="checkbox-label">
                                    <input type="checkbox" name="emailOffers" />
                                    <span>Email me with news and offers</span>
                                </label>
                            </div>

                            <div className="form-section">
                                <h2>Shipping address</h2>

                                <div className="form-group">
                                    <select
                                        name="country"
                                        className="full-width-input"
                                        defaultValue="India"
                                        autoComplete="country-name"
                                    >
                                        <option value="India">India</option>
                                    </select>
                                </div>

                                <div className="form-row">
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First name"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        autoComplete="given-name"
                                    />
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last name"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        autoComplete="family-name"
                                    />
                                </div>

                                <input
                                    type="text"
                                    name="company"
                                    placeholder="Company (optional)"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    autoComplete="organization"
                                    className="full-width-input"
                                />

                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    autoComplete="street-address"
                                    className="full-width-input"
                                />

                                <input
                                    type="text"
                                    name="apartment"
                                    placeholder="Apartment, suite, etc. (optional)"
                                    value={formData.apartment}
                                    onChange={handleInputChange}
                                    autoComplete="address-line2"
                                    className="full-width-input"
                                />

                                <div className="form-row-3">
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        autoComplete="address-level2"
                                    />
                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        required
                                        autoComplete="address-level1"
                                    >
                                        <option value="Karnataka">Karnataka</option>
                                        <option value="Maharashtra">Maharashtra</option>
                                        <option value="Delhi">Delhi</option>
                                        <option value="Tamil Nadu">Tamil Nadu</option>
                                        <option value="Kerala">Kerala</option>
                                    </select>
                                    <input
                                        type="text"
                                        name="pinCode"
                                        placeholder="PIN code"
                                        value={formData.pinCode}
                                        onChange={handleInputChange}
                                        required
                                        autoComplete="postal-code"
                                    />
                                </div>

                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    autoComplete="tel"
                                    className="full-width-input"
                                />

                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="saveInfo"
                                        checked={formData.saveInfo}
                                        onChange={handleInputChange}
                                    />
                                    <span>Save this information for next time</span>
                                </label>
                            </div>

                            <div className="checkout-actions">
                                <Link to="/cart" className="return-link" aria-label="Return to cart">
                                    ‹ Return to cart
                                </Link>
                                <button type="submit" className="continue-btn" aria-label="Continue to shipping step">
                                    Continue to shipping
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 2: Shipping */}
                    {currentStep === 2 && (
                        <form className="checkout-form" onSubmit={handleContinueToPayment}>
                            <div className="info-box">
                                <div className="info-row">
                                    <span className="info-label">Contact</span>
                                    <span className="info-value">{formData.email}</span>
                                    <button type="button" className="change-link" onClick={() => setCurrentStep(1)}>Change</button>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Ship to</span>
                                    <span className="info-value">{shippingAddressText}</span>
                                    <button type="button" className="change-link" onClick={() => setCurrentStep(1)}>Change</button>
                                </div>
                            </div>

                            <div className="form-section">
                                <h2>Shipping method</h2>

                                <div className="shipping-options">
                                    <label className={`shipping-option ${shippingMethod === 'prepaid' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="shippingMethod"
                                            value="prepaid"
                                            checked={shippingMethod === 'prepaid'}
                                            onChange={(e) => setShippingMethod(e.target.value)}
                                        />
                                        <div className="shipping-details">
                                            <span className="shipping-name">Prepaid</span>
                                            <span className="shipping-time">1 to 3 business days</span>
                                        </div>
                                        <span className="shipping-price">₹30.00</span>
                                    </label>
                                </div>
                            </div>

                            <div className="checkout-actions">
                                <button type="button" className="return-link" onClick={() => setCurrentStep(1)}>
                                    ‹ Return to information
                                </button>
                                <button type="submit" className="continue-btn">
                                    Continue to payment
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Payment */}
                    {currentStep === 3 && (
                        <form className="checkout-form" onSubmit={handleSubmit}>
                            <div className="info-box">
                                <div className="info-row">
                                    <span className="info-label">Contact</span>
                                    <span className="info-value">{formData.email}</span>
                                    <button type="button" className="change-link" onClick={() => setCurrentStep(1)}>Change</button>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Ship to</span>
                                    <span className="info-value">{shippingAddressText}</span>
                                    <button type="button" className="change-link" onClick={() => setCurrentStep(1)}>Change</button>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Shipping method</span>
                                    <span className="info-value">Prepaid · ₹{shippingCost}.00</span>
                                    <button type="button" className="change-link" onClick={() => setCurrentStep(2)}>Change</button>
                                </div>
                            </div>

                            <div className="form-section">
                                <h2>Payment</h2>
                                <p className="payment-subtitle">All transactions are secure and encrypted.</p>

                                <div className="payment-options">
                                    <label className={`payment-option ${paymentMethod === 'phonepe' ? 'selected' : ''}`}>
                                        <div className="payment-header">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="phonepe"
                                                checked={paymentMethod === 'phonepe'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            />
                                            <span>PhonePe Payment Gateway (UPI, Cards & NetBanking)</span>
                                            <div className="payment-icons">
                                                <span>💳</span>
                                            </div>
                                        </div>
                                        {paymentMethod === 'phonepe' && (
                                            <div className="payment-content">
                                                <p>After clicking "Pay now", you will be redirected to PhonePe Payment Gateway (UPI, Cards & NetBanking) to complete your purchase securely.</p>
                                            </div>
                                        )}
                                    </label>

                                    <label className={`payment-option ${paymentMethod === 'razorpay' ? 'selected' : ''}`}>
                                        <div className="payment-header">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="razorpay"
                                                checked={paymentMethod === 'razorpay'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            />
                                            <span>Razorpay Secure (UPI, Cards & Wallets)</span>
                                            <div className="payment-icons">
                                                <span>💳</span>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <h2>Billing address</h2>
                                <p className="payment-subtitle">Select the address that matches your card or payment method.</p>

                                <div className="billing-options">
                                    <label className="billing-option selected">
                                        <input type="radio" name="billingAddress" value="same" defaultChecked />
                                        <span>Same as shipping address</span>
                                    </label>
                                    <label className="billing-option">
                                        <input type="radio" name="billingAddress" value="different" />
                                        <span>Use a different billing address</span>
                                    </label>
                                </div>
                            </div>

                            <div className="checkout-actions">
                                <button type="button" className="return-link" onClick={() => setCurrentStep(2)}>
                                    ‹ Return to shipping
                                </button>
                                <button type="submit" className="continue-btn" disabled={loading}>
                                    {loading ? 'Processing...' : 'Pay now'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Right Side - Order Summary */}
                <div className="checkout-summary-section">
                    <div className="order-summary">
                        <div className="summary-items">
                            {cart?.items?.filter(item => item.product).map(item => (
                                <div key={`${item.product?._id || Math.random()}-${item.size}`} className="summary-item">
                                    <div className="item-image-wrapper">
                                        <img
                                            src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/64'}
                                            alt={item.product?.name || 'Product'}
                                        />
                                        <span className="item-quantity">{item.quantity}</span>
                                    </div>
                                    <div className="item-details">
                                        <h4>{item.product?.name || 'Deleted Product'}</h4>
                                        <p>{item.size}</p>
                                    </div>
                                    <div className="item-price">
                                        ₹{(item.price * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="discount-code">
                            <input
                                type="text"
                                placeholder="Gift card"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                            />
                            <button type="button">Apply</button>
                        </div>

                        <div className="summary-totals">
                            <div className="total-row">
                                <span>Subtotal · {cart?.items?.length || 0} items</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="total-row">
                                <span>Shipping</span>
                                <span>{currentStep >= 2 ? `₹${shippingCost}.00` : 'Calculated at next step'}</span>
                            </div>
                            <div className="total-row final-total">
                                <span>Total</span>
                                <div className="total-amount">
                                    <span className="currency">INR</span>
                                    <span className="amount">₹{total.toLocaleString()}</span>
                                </div>
                            </div>
                            <p className="tax-note">Including ₹{(total * 0.18).toFixed(2)} in taxes</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

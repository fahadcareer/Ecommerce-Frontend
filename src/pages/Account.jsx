import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../context/store/AuthContext';
import { useSettings } from '../context/store/SettingsContext';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import './Account.css';

const Account = () => {
    const { user, logout } = useAuth();
    const { settings } = useSettings();
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [addressToDelete, setAddressToDelete] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        isDefault: false
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchAccountData();
    }, []);

    const fetchAccountData = async () => {
        setLoading(true);
        try {
            const [ordersRes, userRes] = await Promise.all([
                api.get('/orders'),
                api.get('/auth/me')
            ]);
            setOrders(ordersRes.data.data);
            setAddresses(userRes.data.data.addresses || []);
            // Update local user state if needed
            if (userRes.data.data) {
                // We'll update addresses locally for this component
            }
        } catch (err) {
            console.error('Error fetching account data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingAddress) {
                res = await api.patch(`/auth/address/${editingAddress._id}`, addressForm);
            } else {
                res = await api.post('/auth/address', addressForm);
            }
            setAddresses(res.data.data);
            setShowAddressModal(false);
            setEditingAddress(null);
            setAddressForm({ street: '', city: '', state: '', zipCode: '', country: 'India', isDefault: false });
        } catch (err) {
            console.error('Error saving address:', err);
        }
    };

    const deleteAddress = (id) => {
        setAddressToDelete(id);
    };

    const confirmDeleteAddress = async () => {
        if (!addressToDelete) return;
        try {
            const res = await api.delete(`/auth/address/${addressToDelete}`);
            setAddresses(res.data.data);
            toast.success('Address deleted');
        } catch (err) {
            console.error('Error deleting address:', err);
        } finally {
            setAddressToDelete(null);
        }
    };

    const openEditModal = (addr) => {
        setEditingAddress(addr);
        setAddressForm({
            street: addr.street,
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode,
            country: addr.country,
            isDefault: addr.isDefault
        });
        setShowAddressModal(true);
    };

    return (
        <div className="account-page">
            <Navbar />

            <div className="account-container">
                <div className="account-nav-tabs">
                    <button
                        className={activeTab === 'orders' ? 'active' : ''}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                    </button>
                    <button
                        className={activeTab === 'addresses' ? 'active' : ''}
                        onClick={() => setActiveTab('addresses')}
                    >
                        Addresses
                    </button>
                    <button onClick={handleLogout}>Logout</button>
                </div>

                {activeTab === 'orders' && (
                    <div className="account-content-section">
                        {!selectedOrder ? (
                            <>
                                <div className="section-header">
                                    <h1>Orders <span className="order-badge">{orders.length}</span></h1>
                                </div>

                                {loading ? (
                                    <div className="loader-inner">Loading orders...</div>
                                ) : orders.length === 0 ? (
                                    <div className="empty-orders">
                                        <p>You haven't placed any orders yet.</p>
                                    </div>
                                ) : (
                                    <div className="orders-table-wrapper">
                                        <table className="orders-table">
                                            <thead>
                                                <tr>
                                                    <th>ORDER NUMBER</th>
                                                    <th>DATE</th>
                                                    <th>PAYMENT STATUS</th>
                                                    <th>FULFILLMENT STATUS</th>
                                                    <th>TOTAL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map(order => (
                                                    <tr key={order._id}>
                                                        <td className="order-id">
                                                            <button
                                                                className="order-link-btn"
                                                                onClick={() => setSelectedOrder(order)}
                                                            >
                                                                {(settings?.siteName || 'ORDER').toUpperCase()}{order._id.slice(-4).toUpperCase()}
                                                            </button>
                                                        </td>
                                                        <td>
                                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                month: 'long',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </td>
                                                        <td className="status-cell">
                                                            {order.isPaid ? 'Paid' : 'Pending'}
                                                        </td>
                                                        <td className="status-cell" style={{ textTransform: 'capitalize' }}>
                                                            {order.isDelivered ? 'Fulfilled' : (order.status === 'pending' ? 'Unfulfilled' : order.status)}
                                                        </td>
                                                        <td className="order-total">
                                                            Rs. {order.totalPrice.toLocaleString()}.00
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="order-detail-view">
                                <div className="detail-header-row">
                                    <button className="back-to-orders" onClick={() => setSelectedOrder(null)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="15 18 9 12 15 6"></polyline>
                                        </svg>
                                        BACK TO ORDERS
                                    </button>
                                </div>

                                <div className="order-summary-title">
                                    <h1>Order {(settings?.siteName || 'ORDER').toUpperCase()}{selectedOrder._id.slice(-4).toUpperCase()}</h1>
                                    <p>{new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                </div>

                                {selectedOrder.status !== 'pending' && (
                                    <div className="order-status-banner">
                                        <div className="banner-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <p>Order is currently <b>{selectedOrder.status}</b>. {selectedOrder.status === 'shipped' && `Track the shipment with number ${selectedOrder.trackingNumber || 'N/A'}`}</p>
                                    </div>
                                )}

                                <div className="detail-table-wrapper">
                                    <table className="detail-table">
                                        <thead>
                                            <tr>
                                                <th>PRODUCT</th>
                                                <th className="text-center">QUANTITY</th>
                                                <th className="text-right">TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.orderItems.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>
                                                        <div className="detail-product-info">
                                                            <p className="p-name">{item.name} - {item.size}</p>
                                                            <p className="p-price">Rs. {item.price.toLocaleString()}.00</p>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">{item.quantity}</td>
                                                    <td className="text-right">Rs. {(item.price * item.quantity).toLocaleString()}.00</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="detail-financials">
                                    <div className="financial-row">
                                        <span>Subtotal</span>
                                        <span>Rs. {selectedOrder.itemsPrice.toLocaleString()}.00</span>
                                    </div>
                                    <div className="financial-row">
                                        <span>Shipping ({selectedOrder.paymentMethod})</span>
                                        <span>Rs. {selectedOrder.shippingPrice > 0 ? `Rs. ${selectedOrder.shippingPrice.toLocaleString()}.00` : 'FREE'}</span>
                                    </div>
                                    <div className="financial-row">
                                        <span>Tax included</span>
                                        <span>Rs. {selectedOrder.taxPrice.toLocaleString()}.00</span>
                                    </div>
                                    <div className="financial-row total-row">
                                        <span>Total</span>
                                        <span>Rs. {selectedOrder.totalPrice.toLocaleString()}.00</span>
                                    </div>
                                </div>

                                <div className="detail-addresses-section">
                                    <h2>Addresses</h2>
                                    <div className="address-display-grid">
                                        <div className="address-display-box">
                                            <h3>BILLING ADDRESS</h3>
                                            <div className="box-content">
                                                <p className="upper">{user?.name}</p>
                                                <p>{selectedOrder.shippingAddress.street}</p>
                                                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                                                <p>{selectedOrder.shippingAddress.country}</p>
                                            </div>
                                        </div>
                                        <div className="address-display-box">
                                            <h3>SHIPPING ADDRESS</h3>
                                            <div className="box-content">
                                                <p className="upper">{user?.name}</p>
                                                <p>{selectedOrder.shippingAddress.street}</p>
                                                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                                                <p>{selectedOrder.shippingAddress.country}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'addresses' && (
                    <div className="account-content-section">
                        <div className="section-header">
                            <h1>Addresses <span className="order-badge">{addresses.length}</span></h1>
                        </div>

                        <div className="address-grid">
                            {addresses.map(addr => (
                                <div key={addr._id} className="address-card">
                                    <h4 className="address-type">{addr.isDefault ? 'DEFAULT ADDRESS' : 'ADDRESS'}</h4>
                                    <div className="address-details">
                                        <p className="address-name">{user?.name}</p>
                                        <p>{addr.street}</p>
                                        <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                                        <p>{addr.country}</p>
                                    </div>
                                    <div className="address-actions">
                                        <button onClick={() => openEditModal(addr)}>Edit</button>
                                        <button onClick={() => deleteAddress(addr._id)}>Delete</button>
                                    </div>
                                </div>
                            ))}

                            <div className="add-address-card" onClick={() => setShowAddressModal(true)}>
                                <div className="add-icon">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                        <line x1="12" y1="18" x2="12" y2="22"></line>
                                        <circle cx="18" cy="18" r="3" fill="white"></circle>
                                        <line x1="18" y1="16" x2="18" y2="20" strokeWidth="2"></line>
                                        <line x1="16" y1="18" x2="20" y2="18" strokeWidth="2"></line>
                                    </svg>
                                </div>
                                <button className="add-link">Add a new address</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showAddressModal && (
                <div className="address-modal-overlay">
                    <div className="address-modal">
                        <h2>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                        <form onSubmit={handleAddressSubmit}>
                            <div className="form-group">
                                <label>Street Address</label>
                                <input
                                    type="text"
                                    value={addressForm.street}
                                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        value={addressForm.city}
                                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input
                                        type="text"
                                        value={addressForm.state}
                                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Zip Code</label>
                                    <input
                                        type="text"
                                        value={addressForm.zipCode}
                                        onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Country</label>
                                    <input
                                        type="text"
                                        value={addressForm.country}
                                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={addressForm.isDefault}
                                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                    />
                                    Set as default address
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="save-btn">{editingAddress ? 'Update' : 'Save'}</button>
                                <button type="button" onClick={() => setShowAddressModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
            <ConfirmationModal
                isOpen={!!addressToDelete}
                title="Delete Address?"
                message="Are you sure you want to remove this address from your account?"
                confirmLabel="Delete Address"
                onConfirm={confirmDeleteAddress}
                onCancel={() => setAddressToDelete(null)}
            />
        </div>
    );
};

export default Account;

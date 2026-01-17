import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import './AdminPages.css';
import './OrderAdmin.css';

const OrderAdmin = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const res = await api.get('/orders/admin/all');
        setOrders(res.data.data);
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/orders/admin/${id}/status`, { status });
            toast.success(`Order set to ${status}`);
            fetchOrders();
            // Update selected order if modal is open
            if (selectedOrder && selectedOrder._id === id) {
                setSelectedOrder({ ...selectedOrder, status });
            }
        } catch (err) {
            // Handled by global interceptor
        }
    };

    const viewOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    const closeModal = () => {
        setShowDetailsModal(false);
        setSelectedOrder(null);
    };

    return (
        <div className="order-admin">
            <h2>Recent Orders</h2>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o._id}>
                                <td>#{o._id.substring(0, 8)}</td>
                                <td>{o.user?.name}</td>
                                <td>Rs. {o.totalPrice.toLocaleString()}</td>
                                <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                                <td>
                                    <div className="order-actions">
                                        <button
                                            className="view-details-btn"
                                            onClick={() => viewOrderDetails(o)}
                                        >
                                            View Details
                                        </button>
                                        <select
                                            value={o.status}
                                            onChange={(e) => updateStatus(o._id, e.target.value)}
                                            className="status-select"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="modal" onClick={closeModal}>
                    <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Order Details</h3>
                            <button className="close-modal" onClick={closeModal}>✕</button>
                        </div>

                        <div className="modal-content">
                            {/* Order Info */}
                            <div className="detail-section">
                                <h4>Order Information</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Order ID:</span>
                                        <span className="detail-value">#{selectedOrder._id}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Status:</span>
                                        <span className={`status-badge ${selectedOrder.status}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Payment Method:</span>
                                        <span className="detail-value">{selectedOrder.paymentMethod}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Order Date:</span>
                                        <span className="detail-value">
                                            {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="detail-section">
                                <h4>Customer Information</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Name:</span>
                                        <span className="detail-value">{selectedOrder.user?.name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Email:</span>
                                        <span className="detail-value">{selectedOrder.user?.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="detail-section">
                                <h4>Shipping Address</h4>
                                <div className="address-box">
                                    <p>{selectedOrder.shippingAddress?.street}</p>
                                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</p>
                                    <p>{selectedOrder.shippingAddress?.country}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="detail-section">
                                <h4>Order Items</h4>
                                <div className="order-items-list">
                                    {(selectedOrder.orderItems || selectedOrder.items || []).map((item, index) => (
                                        <div key={index} className="order-item">
                                            <img
                                                src={item.product?.images?.[0]?.url || item.image || 'https://via.placeholder.com/60'}
                                                alt={item.product?.name || item.name}
                                                className="item-image"
                                            />
                                            <div className="item-info">
                                                <h5>{item.product?.name || item.name}</h5>
                                                <p className="item-meta">
                                                    Size: {item.size} | Quantity: {item.quantity} × Rs. {(item.price || 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="item-total">
                                                Rs. {(item.quantity * (item.price || 0)).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                    {(selectedOrder.orderItems?.length === 0 && selectedOrder.items?.length === 0) && (
                                        <p className="no-items">No items found in this order.</p>
                                    )}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="detail-section">
                                <h4>Order Summary</h4>
                                <div className="order-summary-details">
                                    <div className="summary-row">
                                        <span>Subtotal:</span>
                                        <span>Rs. {selectedOrder.totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Shipping:</span>
                                        <span>Rs. 0.00</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Total:</span>
                                        <span>Rs. {selectedOrder.totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Update Status */}
                            <div className="detail-section">
                                <h4>Update Order Status</h4>
                                <select
                                    value={selectedOrder.status}
                                    onChange={(e) => updateStatus(selectedOrder._id, e.target.value)}
                                    className="status-select-large"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderAdmin;

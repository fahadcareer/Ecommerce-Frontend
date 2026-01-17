import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './OrderHistory.css';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders');
                setOrders(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="orders-page">
            <Navbar />
            <div className="orders-container">
                <h1>My Orders</h1>
                {loading ? (
                    <div>Loading orders...</div>
                ) : orders.length > 0 ? (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order._id} className="order-item-card">
                                <div className="order-header">
                                    <div>
                                        <span className="order-label">ORDER ID</span>
                                        <p className="order-id">#{order._id.substring(0, 10)}...</p>
                                    </div>
                                    <div>
                                        <span className="order-label">DATE</span>
                                        <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <span className="order-label">TOTAL</span>
                                        <p className="order-total">${order.totalPrice.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <span className={`status-badge ${order.status}`}>{order.status.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="order-products">
                                    {order.orderItems.map((item, idx) => (
                                        <div key={idx} className="order-product">
                                            <img src={item.image} alt={item.name} />
                                            <div className="product-meta">
                                                <p className="product-name">{item.name}</p>
                                                <p className="product-size">Size: {item.size}</p>
                                                <p className="product-qty">{item.quantity} x Rs. {item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-orders">No orders found.</div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;

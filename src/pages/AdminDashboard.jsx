import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './AdminPages.css';
import './Dashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        categories: 0,
        revenue: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats from backend
                const [prodRes, orderRes, catRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/orders/admin/all'),
                    api.get('/categories')
                ]);

                const orders = orderRes.data.data || [];
                const products = prodRes.data.data.products || [];
                const categories = catRes.data.data || [];

                // Calculate total revenue from non-cancelled orders
                const totalRevenue = orders.reduce((sum, o) =>
                    (o.status !== 'cancelled' && o.status !== 'pending') ? sum + o.totalPrice : sum, 0
                );

                setStats({
                    products: prodRes.data.data.totalProducts || products.length,
                    orders: orders.length,
                    categories: categories.length,
                    revenue: totalRevenue
                });

                setRecentOrders(orders.slice(0, 5));
                setLoading(false);
            } catch (err) {
                console.error('Dashboard Fetch Error:', err);
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="admin-loading-container">
            <div className="admin-spinner"></div>
            <p>Loading Dashboard Analytics...</p>
        </div>
    );

    return (
        <div className="admin-dashboard-wrapper">
            <div className="dashboard-intro">
                <h2>Store Overview</h2>
                <p>Monitor your performance and manage your business operations.</p>
            </div>

            {/* Stats Cards Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-wrapper revenue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                    <div className="stat-info">
                        <h3>Total Revenue</h3>
                        <p className="stat-value">Rs. {stats.revenue.toLocaleString()}</p>
                        <span className="stat-trend positive">↑ Live Revenue</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper orders">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    </div>
                    <div className="stat-info">
                        <h3>Orders</h3>
                        <p className="stat-value">{stats.orders}</p>
                        <span className="stat-trend positive">↑ Total Transactions</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper products">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    </div>
                    <div className="stat-info">
                        <h3>Products</h3>
                        <p className="stat-value">{stats.products}</p>
                        <span className="stat-trend">In Inventory</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-main-grid">
                {/* Recent Orders Section */}
                <div className="dashboard-content-card">
                    <div className="card-header">
                        <h3>Recent Orders</h3>
                        <Link to="/admin/orders" className="view-link">View All Orders</Link>
                    </div>
                    <div className="table-responsive">
                        <table className="dashboard-mini-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.length > 0 ? (
                                    recentOrders.map(o => (
                                        <tr key={o._id}>
                                            <td className="font-mono">#{o._id.substring(0, 8)}</td>
                                            <td>{o.user?.name || 'Guest'}</td>
                                            <td className="fw-700">Rs. {o.totalPrice?.toLocaleString()}</td>
                                            <td><span className={`status-pill ${o.status}`}>{o.status}</span></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="empty-text">No orders yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Notifications Panel */}
                <div className="dashboard-content-card side-panel">
                    <div className="card-header">
                        <h3>Quick Notifications</h3>
                    </div>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon info">ℹ️</div>
                            <div className="activity-details">
                                <p><strong>System Status:</strong> All services are operational.</p>
                                <span>Just now</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon warning">⚠️</div>
                            <div className="activity-details">
                                <p><strong>Low Stock:</strong> 5 items are below threshold.</p>
                                <span>4 hours ago</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon success">🎉</div>
                            <div className="activity-details">
                                <p><strong>Milestone:</strong> You reached 50 total products!</p>
                                <span>Yesterday</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

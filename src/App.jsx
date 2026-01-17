import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/store/AuthContext';
import { CartProvider } from './context/store/CartContext';
import { SettingsProvider, useSettings } from './context/store/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import api from './services/api';
import WhatsAppButton from './components/WhatsAppButton';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import './GlobalStyles.css';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ProductAdmin = lazy(() => import('./pages/ProductAdmin'));
const CategoryAdmin = lazy(() => import('./pages/CategoryAdmin'));
const OrderAdmin = lazy(() => import('./pages/OrderAdmin'));
const Shop = lazy(() => import('./pages/Shop'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const CustomerSupport = lazy(() => import('./pages/CustomerSupport'));
const SettingsAdmin = lazy(() => import('./pages/SettingsAdmin'));
const CollectionDetail = lazy(() => import('./pages/CollectionDetail'));
const Account = lazy(() => import('./pages/Account'));

const LoadingFallback = () => (
    <div className="global-loader-overlay">
        <div className="spinner"></div>
    </div>
);

const AppContent = () => {
    const { globalLoading, notification } = useAuth();
    const { settings } = useSettings();

    useEffect(() => {
        if (settings) {
            if (settings.siteName) document.title = settings.siteName;

            if (settings.siteFavicon) {
                let link = document.querySelector("link[rel~='icon']");
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.getElementsByTagName('head')[0].appendChild(link);
                }
                link.href = settings.siteFavicon;
            }
        }
    }, [settings]);

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            {globalLoading && (
                <div className="global-loader-overlay">
                    <div className="spinner"></div>
                </div>
            )}

            {notification && (
                <div className={`global-notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <Router>
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/collection/:id" element={<CollectionDetail />} />
                        <Route path="/product/:id" element={<ProductDetails />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/customer-support" element={<CustomerSupport />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected User Routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/account" element={<Account />} />
                            <Route path="/orders" element={<Account />} />
                            <Route path="/profile" element={<div>Profile Page (Under Construction)</div>} />
                        </Route>

                        {/* Admin Routes */}
                        <Route element={<ProtectedRoute adminOnly={true} />}>
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route index element={<AdminDashboard />} />
                                <Route path="products" element={<ProductAdmin />} />
                                <Route path="categories" element={<CategoryAdmin />} />
                                <Route path="orders" element={<OrderAdmin />} />
                                <Route path="settings" element={<SettingsAdmin />} />
                            </Route>
                        </Route>
                    </Routes>
                </Suspense>
            </Router>
            <WhatsAppButton />
        </>
    );
};

function App() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <CartProvider>
                    <AppContent />
                </CartProvider>
            </SettingsProvider>
        </AuthProvider>
    );
}

export default App;

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { useCart } from '../context/store/CartContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useSettings } from '../context/store/SettingsContext';
import './Home.css';

const Home = () => {
    useDocumentTitle('Home | Ecommerce');
    const { categories, loading: settingsLoading } = useSettings();
    const [categoryProducts, setCategoryProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const loadProducts = async () => {
            if (!categories || categories.length === 0) return;
            setLoading(true);
            try {
                // Fetch 4 products for each category
                const productMap = {};
                await Promise.all(categories.map(async (cat) => {
                    try {
                        // Fetching 4 products per category
                        // Assuming the API supports limit parameter
                        const pRes = await api.get(`/products?category=${cat._id}&limit=4`);
                        if (pRes.data && pRes.data.data && pRes.data.data.products) {
                            productMap[cat._id] = pRes.data.data.products;
                        } else {
                            productMap[cat._id] = [];
                        }
                    } catch (e) {
                        console.error(`Error fetching products for category ${cat.name}`, e);
                        productMap[cat._id] = [];
                    }
                }));
                setCategoryProducts(productMap);

            } catch (err) {
                console.error('Error fetching home data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, [categories]);

    return (
        <div className="home-page">
            <Navbar />
            <Hero />

            {/* Collections Grid - Keeping as per 'After collections' request */}
            <section className="collections-section">
                <div className="container">
                    <h2>OUR COLLECTIONS</h2>
                    <div className="list-collections">
                        {categories.map(cat => (
                            <Link
                                to={`/collection/${cat.slug}`}
                                key={cat._id}
                                className="list-collections_item"
                            >
                                <img src={cat.image || 'https://placehold.co/400x600'} alt={cat.name} />
                                <div className="collection-overlay">
                                    <h3>{cat.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Category Product Rows */}
            <div className="container home-category-rows">
                {loading ? <div className="loader">Loading collections...</div> : (
                    categories.map(cat => {
                        const products = categoryProducts[cat._id] || [];
                        if (products.length === 0) return null; // Skip empty categories

                        return (
                            <section key={cat._id} className="category-showcase-section">
                                <h2 className="section-title">{cat.name}</h2>

                                <div className="product-grid">
                                    {products.map(product => (
                                        <div key={product._id} className="home-product-card">
                                            <div className="product-img-container">
                                                {product.originalPrice > product.price && (
                                                    <div className="save-badge">
                                                        SAVE RS. {(product.originalPrice - product.price).toLocaleString()}
                                                    </div>
                                                )}
                                                <Link to={`/product/${product._id}`}>
                                                    <img src={product.images[0]?.url || 'https://placehold.co/400'} alt={product.name} />
                                                </Link>
                                                <button
                                                    className="quick-add-btn-overlay"
                                                    onClick={() => addToCart(product._id)}
                                                    disabled={(product.countInStock || product.stock || 0) < 1}
                                                    title="Quick Add"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 01-8 0"></path></svg>
                                                </button>
                                            </div>
                                            <div className="product-card-info">
                                                <Link to={`/product/${product._id}`}>
                                                    <h4>{product.name}</h4>
                                                </Link>
                                                <div className="price-line">
                                                    <span className="current-price">Rs. {product.price.toLocaleString()}</span>
                                                    {product.originalPrice > product.price && (
                                                        <span className="old-price">Rs. {product.originalPrice.toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="view-all-container">
                                    <Link to={`/collection/${cat.slug}`} className="view-all-btn">
                                        VIEW ALL
                                    </Link>
                                </div>
                            </section>
                        );
                    })
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Home;

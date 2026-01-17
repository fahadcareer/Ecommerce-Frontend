import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SkeletonCard from '../components/SkeletonCard';
import './Shop.css';

const Shop = () => {
    useDocumentTitle('Shop | Ecommerce');
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true); // Initial load
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [catRes, prodRes] = await Promise.all([
                    api.get('/categories'),
                    api.get(`/products?limit=20&page=1`)
                ]);
                setCategories(catRes.data.data);

                const initialProducts = prodRes.data.data.products;
                setProducts(initialProducts);

                // If we got fewer than limit, no more to load
                if (initialProducts.length < 20) setHasMore(false);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleLoadMore = async () => {
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const res = await api.get(`/products?limit=20&page=${nextPage}`);
            const newProducts = res.data.data.products;

            setProducts(prev => [...prev, ...newProducts]);
            setPage(nextPage);

            if (newProducts.length < 20) setHasMore(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <div className="shop-page">
            <Navbar />
            <div className="container shop-container">
                <h1 className="page-title">OUR COLLECTIONS</h1>

                <div className="list-collections">
                    {loading ? (
                        // Simple skeleton/placeholder for collections could go here, 
                        // but for now keeping it simple as products are the main focus
                        <div className="loader">Loading collections...</div>
                    ) : (
                        categories.map(cat => (
                            <Link to={`/collection/${cat.slug}`} key={cat._id} className="list-collections_item">
                                <img src={cat.image || 'https://placehold.co/400x600'} alt={cat.name} />
                                <div className="collection-overlay">
                                    <h3>{cat.name}</h3>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                <div className="shop-products-section">
                    <h2 className="section-title">ALL PRODUCTS</h2>

                    <div className="shop-product-grid">
                        {loading ? (
                            // Show 8 skeleton cards for initial load
                            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                        ) : (
                            products.map(product => (
                                <Link to={`/product/${product._id}`} key={product._id} className="shop-product-card">
                                    <div className="product-img-wrapper">
                                        <img src={product.images[0]?.url || 'https://placehold.co/400x600'} alt={product.name} className="primary-img" />
                                        {product.images[1] && <img src={product.images[1].url} alt={product.name} className="secondary-img" />}
                                    </div>
                                    <div className="product-info">
                                        <h4>{product.name}</h4>
                                        <p className="price">Rs. {product.price.toLocaleString()}</p>
                                    </div>
                                </Link>
                            ))
                        )}

                        {/* Append skeletons when loading more */}
                        {loadingMore && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`more-${i}`} />)}
                    </div>

                    {!loading && hasMore && (
                        <div className="load-more-container" style={{ textAlign: 'center', marginTop: '40px' }}>
                            <button
                                className="load-more-btn"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                style={{
                                    padding: '12px 30px',
                                    backgroundColor: '#fff',
                                    border: '1px solid #000',
                                    color: '#000',
                                    cursor: 'pointer',
                                    fontFamily: 'Figtree, sans-serif',
                                    letterSpacing: '1px',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {loadingMore ? 'LOADING...' : 'LOAD MORE'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Shop;

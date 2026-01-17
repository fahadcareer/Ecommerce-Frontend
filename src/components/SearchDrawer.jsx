import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './SearchDrawer.css';

const SearchDrawer = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Debounce Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                performSearch();
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                document.getElementById('search-input')?.focus();
            }, 100);
        }
    }, [isOpen]);

    const performSearch = async () => {
        setLoading(true);
        try {
            // The backend expects 'keyword', not 'search'
            const res = await api.get(`/products?keyword=${query}`);
            setResults(res.data.data.products || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (id) => {
        navigate(`/product/${id}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={`search-drawer-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
            <div className="search-drawer" onClick={(e) => e.stopPropagation()}>
                <div className="search-header">
                    <div className="search-input-wrapper">
                        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            id="search-input"
                            type="text"
                            placeholder="Search for products..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <button className="close-drawer-btn" onClick={onClose}>✕</button>
                </div>

                <div className="search-body">
                    {loading ? (
                        <div className="search-loading">
                            <div className="spinner-small"></div>
                        </div>
                    ) : (
                        <>
                            {query && results.length === 0 && (
                                <div className="no-results">
                                    <p>No results found for "{query}"</p>
                                </div>
                            )}

                            {/* Search Results */}
                            {results.length > 0 && (
                                <div className="search-results-list">
                                    <h5 className="results-heading">PRODUCTS ({results.length})</h5>
                                    {results.map(product => (
                                        <div key={product._id} className="search-result-item" onClick={() => handleProductClick(product._id)}>
                                            <div className="result-img">
                                                <img src={product.images?.[0]?.url || 'https://via.placeholder.com/100'} alt={product.name} />
                                            </div>
                                            <div className="result-info">
                                                <h6>{product.name}</h6>
                                                <p className="price">Rs. {product.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Empty State / Suggestions (shown when no query) */}
                            {!query && (
                                <div className="search-suggestions">
                                    <h5>POPULAR SEARCHES</h5>
                                    <ul>
                                        <li onClick={() => setQuery('Shirt')}>Shirt</li>
                                        <li onClick={() => setQuery('Pants')}>Pants</li>
                                        <li onClick={() => setQuery('Shoes')}>Shoes</li>
                                        <li onClick={() => setQuery('Dress')}>Dress</li>
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchDrawer;

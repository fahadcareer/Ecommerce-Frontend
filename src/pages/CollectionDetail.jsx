import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/store/CartContext';
import './CollectionDetail.css';

const CollectionDetail = () => {
    const { id } = useParams();
    const [category, setCategory] = useState(null);
    const [allCategories, setAllCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    // Initialize with all closed or specific ones open as desired. 
    // Here: all closed by default, or you can set true for specific keys.
    const [openFilters, setOpenFilters] = useState({
        availability: true, // Open by default for better UX
        price: true,
        size: true,
        category: false
    });

    // Filter States
    const [activeFilters, setActiveFilters] = useState({
        availability: [], // 'inStock', 'outOfStock'
        price: { min: 0, max: 100000 }, // Default wide range
        sizes: [],
        categories: []
    });

    const { addToCart } = useCart();

    const toggleFilter = (key) => {
        setOpenFilters(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    useEffect(() => {
        if (products.length > 0) {
            // Set initial max price dynamically
            const max = Math.max(...products.map(p => p.price));
            setActiveFilters(prev => ({
                ...prev,
                price: { min: 0, max: max > 0 ? max : 2199 }
            }));
        }
    }, [products]);

    // Derived Filtered Products
    const filteredProducts = React.useMemo(() => {
        return products.filter(product => {
            // Availability Filter
            if (activeFilters.availability.length > 0) {
                const inStock = product.stock > 0;
                const matchesInStock = activeFilters.availability.includes('inStock') && inStock;
                const matchesOutStock = activeFilters.availability.includes('outOfStock') && !inStock;
                if (!matchesInStock && !matchesOutStock) return false;
            }

            // Price Filter
            if (product.price < activeFilters.price.min || product.price > activeFilters.price.max) {
                return false;
            }

            // Size Filter
            if (activeFilters.sizes.length > 0) {
                if (!product.sizes || !product.sizes.some(s => activeFilters.sizes.includes(s.size))) {
                    return false;
                }
            }

            // Category Filter (Sub-filtering within the main collection)
            // Assuming categories are selected by ID or Name.
            // Since we are on a Category Page, this likely filters by 'Sub-Category' or similar attribute?
            // Or just filters by exact category if products have multiple categories.
            if (activeFilters.categories.length > 0) {
                // For now assuming activeFilters.categories contains IDs
                // If product.category is an object or ID.
                const pCatId = typeof product.category === 'object' ? product.category._id : product.category;
                if (!activeFilters.categories.includes(pCatId)) return false;
            }

            return true;
        });
    }, [products, activeFilters]);

    // Compute Filter Stats dynamically from the *Filtered* products?
    // Usually stats show counts of available items. 
    // If I select Size S, the Availability counts should reflect Size S items.
    const filterStats = React.useMemo(() => {
        const stats = {
            inStock: 0,
            outOfStock: 0,
            minPrice: Infinity,
            maxPrice: -Infinity,
            sizes: {},
            categories: []
        };

        // We iterate over the *Filtered* products to show relevant counts
        // OR we iterate over All products to show global availability?
        // Ecommerce style usually implies contextual counts. Let's use filteredProducts for counts.
        // Wait, if I filter by Size S, I still want to see counts for Size M (0 or disabled).
        // So standard logic: 
        // 1. Calculate stats from ALL products for "Total Options".
        // 2. But showing '0' for items excluded by other filters is good.
        // Let's stick to calculating from `products` (All) but effectively we might want contextual.
        // Simple: Calculate from `products` to show overall availability in this collection.

        const source = products; // use 'products' to keep all options visible

        if (!source.length) return stats;

        source.forEach(p => {
            if (p.stock > 0) stats.inStock++;
            else stats.outOfStock++;

            if (p.price < stats.minPrice) stats.minPrice = p.price;
            if (p.price > stats.maxPrice) stats.maxPrice = p.price;

            if (Array.isArray(p.sizes)) {
                p.sizes.forEach(s => {
                    if (s.stock > 0) { // Only show sizes that have stock
                        stats.sizes[s.size] = (stats.sizes[s.size] || 0) + 1;
                    }
                });
            }
        });

        if (stats.minPrice === Infinity) stats.minPrice = 0;
        if (stats.maxPrice === -Infinity) stats.maxPrice = 0;
        stats.categories = allCategories;

        return stats;
    }, [products, allCategories]);

    // Handlers
    const handleAvailabilityChange = (type) => { // 'inStock' or 'outOfStock'
        setActiveFilters(prev => {
            const current = prev.availability;
            const updated = current.includes(type)
                ? current.filter(t => t !== type)
                : [...current, type];
            return { ...prev, availability: updated };
        });
    };

    const handleSizeChange = (size) => {
        setActiveFilters(prev => {
            const current = prev.sizes;
            const updated = current.includes(size)
                ? current.filter(s => s !== size)
                : [...current, size];
            return { ...prev, sizes: updated };
        });
    };

    const handlePriceChange = (e, type) => {
        const val = Number(e.target.value);
        setActiveFilters(prev => ({
            ...prev,
            price: { ...prev.price, [type]: val }
        }));
    };

    // Remove Tag Handler
    const removeTag = (type, value) => {
        if (type === 'availability') handleAvailabilityChange(value);
        if (type === 'size') handleSizeChange(value);
        if (type === 'price') {
            // Reset price to default
            // We need to know the default ranges.
            setActiveFilters(prev => ({ ...prev, price: { min: 0, max: 100000 } })); // Re-trigger effect to fix max
        }
    };

    const clearAllFilters = () => {
        setActiveFilters({
            availability: [],
            price: { min: 0, max: 100000 },
            sizes: [],
            categories: []
        });
    };


    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [allCatsRes, prodRes] = await Promise.all([
                api.get('/categories'),
                api.get(`/products?category=${id}`)
            ]);

            const currentCat = allCatsRes.data.data.find(c => c.slug === id || c._id === id);
            setCategory(currentCat);
            setAllCategories(allCatsRes.data.data);
            setProducts(prodRes.data.data.products);
        } catch (error) {
            console.error('Error fetching collection data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loader">Loading collection...</div>;

    return (
        <div className="collection-detail-page">
            <Navbar />

            <div className="collection-header-section">
                <div className="container">
                    <div className="header-top-row">
                        <nav className="breadcrumbs">
                            <Link to="/">Home</Link> / <span>{category?.name}</span>
                        </nav>
                        <h1 className="collection-title">{category?.name}</h1>
                    </div>
                </div>
            </div>

            <div className="category-sub-nav-wrapper">
                <div className="container">
                    <div className="category-sub-nav">
                        {allCategories.map(cat => (
                            <Link
                                key={cat._id}
                                to={`/collection/${cat.slug}`}
                                className={`sub-nav-item ${cat.slug === id || cat._id === id ? 'active' : ''}`}
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container collection-main-content">
                {/* Sidebar Filters */}
                {/* Sidebar Filters */}
                <aside className="collection-filters">
                    <h3>Filters</h3>

                    {/* Active Filter Tags */}
                    {(activeFilters.availability.length > 0 || activeFilters.sizes.length > 0 || activeFilters.price.min > 0 || activeFilters.price.max < 100000) && (
                        <div className="active-filters">
                            {activeFilters.availability.map(val => (
                                <button key={val} className="filter-tag" onClick={() => removeTag('availability', val)}>
                                    x {val === 'inStock' ? 'In stock' : 'Out of stock'}
                                </button>
                            ))}
                            {activeFilters.sizes.map(val => (
                                <button key={val} className="filter-tag" onClick={() => removeTag('size', val)}>
                                    x {val}
                                </button>
                            ))}
                            {(activeFilters.price.min > 0 || activeFilters.price.max < 100000) && (
                                <button className="filter-tag" onClick={() => removeTag('price')}>
                                    x Rs. {activeFilters.price.min} - Rs. {activeFilters.price.max}
                                </button>
                            )}
                            <button className="clear-all-btn" onClick={clearAllFilters}>Clear all</button>
                        </div>
                    )}

                    <div className="filter-accordion">

                        {/* Availability */}
                        <div className={`accordion-item ${openFilters.availability ? 'expanded' : ''}`}>
                            <button className="accordion-header" onClick={() => toggleFilter('availability')}>
                                Availability
                                <span className={`arrow ${openFilters.availability ? 'up' : 'down'}`}>
                                    {openFilters.availability ? '⌃' : '⌄'}
                                </span>
                            </button>
                            {openFilters.availability && (
                                <div className="accordion-content">
                                    <label className="custom-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={activeFilters.availability.includes('inStock')}
                                            onChange={() => handleAvailabilityChange('inStock')}
                                        />
                                        <span className="checkmark"></span>
                                        In stock ({filterStats.inStock})
                                    </label>
                                    <label className="custom-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={activeFilters.availability.includes('outOfStock')}
                                            onChange={() => handleAvailabilityChange('outOfStock')}
                                        />
                                        <span className="checkmark"></span>
                                        Out of stock ({filterStats.outOfStock})
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        <div className={`accordion-item ${openFilters.price ? 'expanded' : ''}`}>
                            <button className="accordion-header" onClick={() => toggleFilter('price')}>
                                Price
                                <span className={`arrow ${openFilters.price ? 'up' : 'down'}`}>
                                    {openFilters.price ? '⌃' : '⌄'}
                                </span>
                            </button>
                            {openFilters.price && (
                                <div className="accordion-content">
                                    <div className="price-range-slider">
                                        {/* CSS-only representation for now, or actual inputs if desired. 
                                            Standard HTML range input is easier. */}
                                        <input
                                            type="range"
                                            min={filterStats.minPrice}
                                            max={filterStats.maxPrice}
                                            value={activeFilters.price.max}
                                            onChange={(e) => handlePriceChange(e, 'max')}
                                            className="range-input-slider"
                                        />
                                    </div>
                                    <div className="price-inputs">
                                        <div className="price-field">
                                            <span>Rs.</span>
                                            <input
                                                type="number"
                                                value={activeFilters.price.min}
                                                onChange={(e) => handlePriceChange(e, 'min')}
                                            />
                                        </div>
                                        <span className="to">to</span>
                                        <div className="price-field">
                                            <span>Rs.</span>
                                            <input
                                                type="number"
                                                value={activeFilters.price.max}
                                                onChange={(e) => handlePriceChange(e, 'max')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Size */}
                        <div className={`accordion-item ${openFilters.size ? 'expanded' : ''}`}>
                            <button className="accordion-header" onClick={() => toggleFilter('size')}>
                                Size
                                <span className={`arrow ${openFilters.size ? 'up' : 'down'}`}>
                                    {openFilters.size ? '⌃' : '⌄'}
                                </span>
                            </button>
                            {openFilters.size && (
                                <div className="accordion-content">
                                    <div className="size-grid">
                                        {/* Dynamic size grid from available data */}
                                        {Object.keys(filterStats.sizes).sort().map(size => {
                                            const isActive = activeFilters.sizes.includes(size);
                                            return (
                                                <button
                                                    key={size}
                                                    className={isActive ? 'active' : ''}
                                                    onClick={() => handleSizeChange(size)}
                                                >
                                                    {size} ({filterStats.sizes[size]})
                                                </button>
                                            );
                                        })}
                                        {Object.keys(filterStats.sizes).length === 0 && (
                                            <p style={{ fontSize: '0.8rem', color: '#666' }}>No sizes available</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Category */}
                        <div className={`accordion-item ${openFilters.category ? 'expanded' : ''}`}>
                            <button className="accordion-header" onClick={() => toggleFilter('category')}>
                                Category
                                <span className={`arrow ${openFilters.category ? 'up' : 'down'}`}>
                                    {openFilters.category ? '⌃' : '⌄'}
                                </span>
                            </button>
                            {openFilters.category && (
                                <div className="accordion-content">
                                    {filterStats.categories.map(cat => (
                                        <label key={cat._id} className="custom-checkbox">
                                            <input type="checkbox" />
                                            <span className="checkmark"></span>
                                            {cat.name}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </aside>

                {/* Products Grid Area */}
                <main className="collection-products">
                    <div className="collection-toolbar">
                        <span className="product-count">{filteredProducts.length} products</span>
                        <div className="sort-by">
                            <label>Sort by</label>
                            <select>
                                <option>Date, new to old</option>
                                <option>Price, low to high</option>
                                <option>Price, high to low</option>
                            </select>
                        </div>
                    </div>

                    <div className="collection-grid">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <div key={product._id} className="collection-product-card">
                                    <div className="product-img-container">
                                        {product.originalPrice > product.price && (
                                            <div className="save-badge">
                                                SAVE RS. {(product.originalPrice - product.price).toLocaleString()}
                                            </div>
                                        )}
                                        <Link to={`/product/${product._id}`}>
                                            <img src={product.images[0]?.url || 'https://placehold.co/400x500'} alt={product.name} />
                                        </Link>
                                        <button
                                            className="quick-add-btn-overlay"
                                            onClick={() => {
                                                const firstSize = product.sizes?.find(s => s.stock > 0)?.size || (product.sizes?.[0]?.size || 'Standard');
                                                addToCart(product._id, 1, firstSize);
                                            }}
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
                            ))
                        ) : (
                            <div className="no-products-found" style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center' }}>
                                No products match your filters.
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default CollectionDetail;

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useCart } from '../context/store/CartContext';
import { toast } from 'react-toastify';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('M');
    const [activeImage, setActiveImage] = useState('');
    const [activeTab, setActiveTab] = useState('moreInfo'); // 'moreInfo' or 'returns'
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProductAndRelated = async () => {
            setLoading(true);
            try {
                // Fetch Product
                const res = await api.get(`/products/${id}`);
                const data = res.data.data;
                setProduct(data);
                if (data.images && data.images.length > 0) {
                    setActiveImage(data.images[0].url);
                }
                if (data.sizes && data.sizes.length > 0) {
                    const firstAvailable = data.sizes.find(s => s.stock > 0);
                    if (firstAvailable) setSelectedSize(firstAvailable.size);
                    else setSelectedSize(data.sizes[0].size);
                }

                // Fetch "You may also like" - Various products (not just same category)
                try {
                    const relatedRes = await api.get(`/products?limit=12`);
                    let related = relatedRes.data.data.products || [];

                    // Filter out current product
                    related = related.filter(p => p._id !== data._id);

                    // Randomize to show variety
                    related = related.sort(() => 0.5 - Math.random()).slice(0, 4);

                    setRelatedProducts(related);
                } catch (rErr) {
                    console.error("Related products error", rErr);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductAndRelated();
        window.scrollTo(0, 0); // Scroll to top on id change
    }, [id]);

    const currentSizeStock = product?.sizes?.find(s => s.size === selectedSize)?.stock || 0;

    useEffect(() => {
        setQuantity(1);
    }, [selectedSize]);

    const handleAddToCart = () => {
        addToCart(product._id, quantity, selectedSize);
    };

    const handleBuyNow = () => {
        addToCart(product._id, quantity, selectedSize);
        navigate('/checkout');
    };

    if (loading) return <div className="loader">Loading...</div>;
    if (!product) return <div>Product not found</div>;

    const discount = product.originalPrice > product.price
        ? product.originalPrice - product.price
        : 0;

    return (
        <div className="product-details-page">
            <Navbar />

            <div className="container" style={{ paddingTop: '1rem' }}>
                <nav className="breadcrumb" aria-label="Breadcrumb">
                    <ol className="breadcrumb__list list--unstyled">
                        <li className="breadcrumb__item">
                            <Link to="/" className="breadcrumb__link">Home</Link>
                        </li>
                        <li className="breadcrumb__item">
                            <Link to={`/collection/${product.category?._id || product.category}`} className="breadcrumb__link">
                                {product.category?.name || 'Collection'}
                            </Link>
                        </li>
                        <li className="breadcrumb__item">
                            <span className="breadcrumb__link" aria-current="page">{product.name}</span>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="container product-details-container" style={{ paddingTop: '2rem' }}>
                {/* GALLERY SECTION */}
                <div className="product-gallery">
                    <div className="thumbnail-list">
                        {product.images.map((img, idx) => (
                            <div
                                key={idx}
                                className={`thumbnail-item ${activeImage === img.url ? 'active' : ''}`}
                                onClick={() => setActiveImage(img.url)}
                            >
                                <img src={img.url} alt={`${product.name} ${idx}`} />
                            </div>
                        ))}
                    </div>
                    <div className="main-image-frame">
                        <img src={activeImage} alt={product.name} className="main-img" />
                        <button className="zoom-btn" onClick={() => setIsZoomOpen(true)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        </button>
                    </div>
                </div>

                {/* INFO SECTION */}
                <div className="product-info-panel">
                    <h1 className="pd-title">{product.name}</h1>

                    <div className="price-list">
                        <span className="price price--large">Rs. {product.price.toLocaleString()}.00</span>
                        {product.originalPrice > product.price && (
                            <>
                                <span className="price price--compare">Rs. {product.originalPrice.toLocaleString()}.00</span>
                                <span className="label label--highlight">SAVE RS. {discount.toLocaleString()}.00</span>
                            </>
                        )}
                    </div>

                    {product.stock > 0 && product.stock < 10 && (
                        <p className="pd-stock-warning">Only {product.stock} unit left</p>
                    )}

                    <div className="pd-option-group">
                        <label>Size: {selectedSize}</label>
                        <div className="pd-size-grid">
                            {product.sizes && product.sizes.length > 0 ? (
                                product.sizes.map(s => (
                                    <button
                                        key={s.size}
                                        className={`size-btn ${selectedSize === s.size ? 'selected' : ''} ${s.stock <= 0 ? 'out-of-stock' : ''}`}
                                        onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                                        disabled={s.stock <= 0}
                                        title={s.stock <= 0 ? 'Out of stock' : ''}
                                    >
                                        {s.size}
                                    </button>
                                ))
                            ) : (
                                <p style={{ fontSize: '0.85rem', color: '#666' }}>No size variants available</p>
                            )}
                        </div>
                    </div>

                    <div className="pd-option-group">
                        <label>Quantity:</label>
                        <div className="pd-qty-control">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                            <span>{quantity}</span>
                            <button onClick={() => {
                                if (quantity < currentSizeStock) {
                                    setQuantity(quantity + 1);
                                } else {
                                    toast.error('No more stock available for this size');
                                }
                            }}>+</button>
                        </div>
                        <div className="stock-info" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                            {currentSizeStock > 0 ? (
                                <span style={{ color: currentSizeStock < 5 ? '#e11d48' : '#666' }}>
                                    {currentSizeStock < 10 ? `Only ${currentSizeStock} left in stock` : 'In stock'}
                                </span>
                            ) : (
                                <span style={{ color: '#e11d48', fontWeight: 'bold' }}>Out of stock</span>
                            )}
                        </div>
                    </div>

                    <div className="pd-actions">
                        <button
                            className="pd-btn add-to-cart-btn"
                            onClick={handleAddToCart}
                            disabled={currentSizeStock < 1}
                        >
                            <span className="loader-button_text">
                                {currentSizeStock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
                            </span>
                        </button>
                        {currentSizeStock > 0 && (
                            <button className="pd-btn buy-it-now-btn" onClick={handleBuyNow}>
                                <span className="loader-button_text">BUY IT NOW</span>
                            </button>
                        )}
                    </div>

                    <div className="pd-description">
                        <p>{product.description}</p>
                    </div>

                    {/* Share Section */}
                    <div className="pd-share">
                        <span>Share:</span>
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} ${window.location.href}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="share-icon whatsapp"
                            title="Share on WhatsApp"
                        >
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                        </a>
                        <button
                            className="share-icon native-share"
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: product.name,
                                        text: `Check out ${product.name}`,
                                        url: window.location.href,
                                    }).catch(console.error);
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success('Link copied to clipboard!');
                                }
                            }}
                            title="Share"
                        >
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="container pd-tabs-container">
                <div className="tabs-nav">
                    <div className="tabs-nav__item-list">
                        <button
                            className={`tabs-nav__item tab-btn ${activeTab === 'moreInfo' ? 'active' : ''}`}
                            onClick={() => setActiveTab('moreInfo')}
                        >
                            MORE INFORMATION
                        </button>
                        <button
                            className={`tabs-nav__item tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
                            onClick={() => setActiveTab('returns')}
                        >
                            RETURNS & EXCHANGES
                        </button>
                    </div>
                </div>
                <div className="pd-tab-content">
                    {activeTab === 'moreInfo' && (
                        <div className="info-content">
                            {product.details && product.details.length > 0 ? (
                                product.details.map((detail, idx) => (
                                    <p key={idx}><strong>{detail.label}:</strong> {detail.value}</p>
                                ))
                            ) : (
                                <>
                                    <p><strong>Fabric:</strong> Cotton</p>
                                    <p><strong>Fit:</strong> Regular Fit</p>
                                    <p>
                                        <strong>Wash Care:</strong> Machine wash as per care instructions.
                                        Avoid drying in direct sunlight.
                                    </p>
                                    <p>
                                        <strong>Note:</strong> Product color may slightly vary due to photographic lighting
                                        or individual screen settings.
                                    </p>

                                </>
                            )}
                        </div>
                    )}
                    {activeTab === 'returns' && (
                        <div className="returns-content">
                            <ol>
                                <li>
                                    We are happy to offer return or exchange on any unworn items within
                                    <strong> 48 hours of delivery</strong> only. No further actions can be taken after this period.
                                </li>
                                <li>
                                    You must ship the product back to the company address. Reverse pickup is subject to
                                    availability in your area based on the pin code.
                                </li>
                                <li>
                                    Items must be unused, unaltered, and unworn, and should be returned in their
                                    original packaging with all tags intact.
                                </li>
                                <li>
                                    Upon return, you may choose an exchange or replacement. Refunds are not available;
                                    instead, a <strong>gift card</strong> equal to the purchase amount will be issued.
                                </li>
                                <li>
                                    The gift card can be used at any time and is valid for a lifetime.
                                </li>
                                <li>
                                    Once an exchanged product is delivered, no further actions such as exchange or
                                    return will be applicable for that order.
                                </li>
                                <li>
                                    Products returned in poor condition, without tags, or without original packaging
                                    will not be eligible for exchange or return. Shipping charges are non-refundable.
                                </li>
                            </ol>
                        </div>

                    )}
                </div>
            </div>

            {/* RELATED PRODUCTS */}
            {relatedProducts.length > 0 && (
                <div className="container related-products-section">
                    <h2 className="section-title">You may also like</h2>
                    <div className="product-grid">
                        {relatedProducts.map(p => (
                            <div key={p._id} className="home-product-card">
                                <div className="product-img-container">
                                    <Link to={`/product/${p._id}`}>
                                        <img src={p.images[0]?.url || 'https://placehold.co/400'} alt={p.name} />
                                    </Link>
                                </div>
                                <div className="product-card-info">
                                    <Link to={`/product/${p._id}`}>
                                        <h4>{p.name}</h4>
                                    </Link>
                                    <div className="price-line">
                                        <span className="current-price">Rs. {p.price.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ZOOM MODAL */}
            {isZoomOpen && (
                <div className="zoom-modal" onClick={() => setIsZoomOpen(false)}>
                    <div className="zoom-content">
                        <img src={activeImage} alt="Zoom" />
                        <button className="close-zoom" onClick={() => setIsZoomOpen(false)}>×</button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default ProductDetails;

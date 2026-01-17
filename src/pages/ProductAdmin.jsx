import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';
import './AdminPages.css';

const ProductAdmin = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [formData, setFormData] = useState({
        name: '', price: '', originalPrice: '', category: '', stock: 0, description: '', sku: '', images: [{ url: '', isMain: true }],
        sizes: [{ size: '', stock: 0 }],
        details: [{ label: '', value: '' }]
    });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });

    useEffect(() => {
        fetchProducts(currentPage);
        fetchCategories();
    }, [currentPage]);

    const fetchProducts = async (page = 1) => {
        try {
            const res = await api.get(`/products?page=${page}&limit=10`);
            setProducts(res.data.data.products);
            setTotalPages(res.data.data.totalPages);
            setCurrentPage(res.data.data.currentPage);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCategories = async () => {
        const res = await api.get('/categories');
        setCategories(res.data.data);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageItemChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index].url = value;
        setFormData({ ...formData, images: newImages });
    };

    const addImageRow = () => {
        setFormData({ ...formData, images: [...formData.images, { url: '', isMain: false }] });
    };

    const removeImageRow = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        // Ensure at least one image remains main
        if (newImages.length > 0 && !newImages.some(img => img.isMain)) {
            newImages[0].isMain = true;
        }
        setFormData({ ...formData, images: newImages });
    };

    const toggleMainImage = (index) => {
        const newImages = formData.images.map((img, i) => ({
            ...img,
            isMain: i === index
        }));
        setFormData({ ...formData, images: newImages });
    };

    const handleSizeChange = (index, field, value) => {
        const newSizes = [...formData.sizes];
        newSizes[index][field] = field === 'stock' ? Number(value) : value;
        const totalStock = newSizes.reduce((sum, s) => sum + (s.stock || 0), 0);
        setFormData({ ...formData, sizes: newSizes, stock: totalStock });
    };

    const addSizeRow = () => {
        setFormData({ ...formData, sizes: [...formData.sizes, { size: '', stock: 0 }] });
    };

    const removeSizeRow = (index) => {
        const newSizes = formData.sizes.filter((_, i) => i !== index);
        const totalStock = newSizes.reduce((sum, s) => sum + (s.stock || 0), 0);
        setFormData({ ...formData, sizes: newSizes, stock: totalStock });
    };

    const handleDetailChange = (index, field, value) => {
        const newDetails = [...formData.details];
        newDetails[index][field] = value;
        setFormData({ ...formData, details: newDetails });
    };

    const addDetailRow = () => {
        setFormData({ ...formData, details: [...formData.details, { label: '', value: '' }] });
    };

    const removeDetailRow = (index) => {
        const newDetails = formData.details.filter((_, i) => i !== index);
        setFormData({ ...formData, details: newDetails });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.patch(`/products/${editingId}`, formData);
                toast.success('Product updated!');
            } else {
                await api.post('/products', formData);
                toast.success('Product created!');
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({
                name: '', price: '', originalPrice: '', category: '', stock: 0, description: '', sku: '',
                images: [{ url: '', isMain: true }],
                sizes: [{ size: '', stock: 0 }],
                details: [{ label: '', value: '' }]
            });
            fetchProducts(currentPage);
        } catch (err) {
            // Handled by global interceptor
        }
    };

    const editProduct = (p) => {
        setEditingId(p._id);
        setFormData({
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice || '',
            category: p.category?._id || '',
            stock: p.stock,
            description: p.description,
            sku: p.sku,
            images: p.images,
            sizes: p.sizes?.length > 0 ? p.sizes : [{ size: '', stock: 0 }],
            details: p.details?.length > 0 ? p.details : [{ label: '', value: '' }]
        });
        setShowForm(true);
    };

    const deleteProduct = async (id) => {
        setDeleteModal({ isOpen: true, productId: id });
    };

    const confirmDelete = async () => {
        if (!deleteModal.productId) return;
        try {
            await api.delete(`/products/${deleteModal.productId}`);
            fetchProducts(currentPage);
            toast.success('Product deleted successfully');
        } catch (err) {
            console.error('Delete failed', err);
        } finally {
            setDeleteModal({ isOpen: false, productId: null });
        }
    };

    const downloadTemplate = async () => {
        try {
            const response = await api.get('/bulk-upload/template', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'product-upload-template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Template downloaded!');
        } catch (err) {
            toast.error('Failed to download template');
        }
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/bulk-upload/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success(response.data.message);
            if (response.data.data.errors.length > 0) {
                console.log('Upload errors:', response.data.data.errors);
                toast.warning(`${response.data.data.errors.length} products failed to upload. Check console for details.`);
            }
            fetchProducts(currentPage);
        } catch (err) {
            toast.error('Bulk upload failed');
        }
        e.target.value = ''; // Reset file input
    };

    return (
        <div className="product-admin">
            <div className="page-header">
                <h2>Manage Products</h2>
                <div className="header-actions">
                    <button className="template-btn" onClick={downloadTemplate}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Template
                    </button>
                    <label className="upload-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        Upload Excel
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleBulkUpload}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <button className="add-btn" onClick={() => { setShowForm(true); setEditingId(null); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add Product
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="modal" onClick={() => setShowForm(false)}>
                    <div className="admin-form-container card" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <form className="admin-form" onSubmit={handleSubmit}>
                            <div className="modal-header-section" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h3 style={{ margin: 0 }}>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} required>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label>Selling Price</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Original Price</label>
                                    <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="form-group" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <label style={{ margin: 0 }}>Sizes & Inventory (Total: {formData.stock})</label>
                                    <button type="button" onClick={addSizeRow} className="add-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>+ Add Size</button>
                                </div>
                                {formData.sizes.map((s, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <input
                                            placeholder="Size (e.g. S, M, L)"
                                            value={s.size}
                                            onChange={(e) => handleSizeChange(idx, 'size', e.target.value)}
                                            required
                                        />
                                        <input
                                            type="number"
                                            placeholder="Stock"
                                            value={s.stock}
                                            onChange={(e) => handleSizeChange(idx, 'stock', e.target.value)}
                                            required
                                        />
                                        {formData.sizes.length > 1 && (
                                            <button type="button" onClick={() => removeSizeRow(idx)} className="delete-btn" style={{ height: '100%', margin: 0 }}>✕</button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="form-group" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <label style={{ margin: 0 }}>Product Images (URL)</label>
                                    <button type="button" onClick={addImageRow} className="add-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>+ Add Image</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'white', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                            <div
                                                onClick={() => toggleMainImage(idx)}
                                                style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    border: `2px solid ${img.isMain ? '#2563eb' : '#cbd5e1'}`,
                                                    background: img.isMain ? '#2563eb' : 'transparent',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    color: 'white'
                                                }}
                                                title="Set as main image"
                                            >
                                                {img.isMain && '✓'}
                                            </div>
                                            <input
                                                placeholder="Image URL"
                                                value={img.url}
                                                onChange={(e) => handleImageItemChange(idx, e.target.value)}
                                                required
                                                style={{ flex: 1, margin: 0 }}
                                            />
                                            {formData.images.length > 1 && (
                                                <button type="button" onClick={() => removeImageRow(idx)} className="delete-btn" style={{ margin: 0, padding: '0.4rem' }}>✕</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <label style={{ margin: 0 }}>Product Specifications (Dynamic Tabs)</label>
                                    <button type="button" onClick={addDetailRow} className="add-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>+ Add Row</button>
                                </div>
                                {formData.details.map((detail, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <input
                                            placeholder="Label (e.g. Fabric)"
                                            value={detail.label}
                                            onChange={(e) => handleDetailChange(idx, 'label', e.target.value)}
                                            required
                                        />
                                        <input
                                            placeholder="Value (e.g. 100% Cotton)"
                                            value={detail.value}
                                            onChange={(e) => handleDetailChange(idx, 'value', e.target.value)}
                                            required
                                        />
                                        {formData.details.length > 1 && (
                                            <button type="button" onClick={() => removeDetailRow(idx)} className="delete-btn" style={{ height: '100%', margin: 0 }}>✕</button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', width: '100%' }}>
                                <div className="form-group">
                                    <label>SKU</label>
                                    <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} required />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea name="description" rows="4" value={formData.description} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="add-btn" style={{ flex: 1 }}>
                                    {editingId ? 'Update Product' : 'Create Product'}
                                </button>
                                <button type="button" className="template-btn" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <img src={p.images[0]?.url || 'https://via.placeholder.com/50'} alt="" className="table-product-img" />
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{p.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {p.sku}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{p.category?.name || 'Uncategorized'}</td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>Rs. {p.price.toLocaleString()}</div>
                                    {p.originalPrice > 0 && <div style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#94a3b8' }}>Rs. {p.originalPrice.toLocaleString()}</div>}
                                </td>
                                <td>
                                    <span style={{ color: p.stock < 5 ? '#ef4444' : 'inherit', fontWeight: p.stock < 5 ? 700 : 500 }}>
                                        {p.stock} units
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-pill ${p.isActive ? 'delivered' : 'cancelled'}`} style={{ fontSize: '0.65rem' }}>
                                        {p.isActive ? 'Active' : 'Draft'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="edit-btn" onClick={() => editProduct(p)}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        <button className="delete-btn" onClick={() => deleteProduct(p._id)}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                title="Delete Product?"
                message="Are you sure you want to delete this product? This action cannot be undone."
                confirmLabel="Delete Product"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, productId: null })}
            />
        </div>
    );
};

export default ProductAdmin;

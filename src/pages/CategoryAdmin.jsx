import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import './AdminPages.css';

const CategoryAdmin = () => {
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', image: '' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, categoryId: null });

    const [draggedIndex, setDraggedIndex] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const res = await api.get('/categories');
        setCategories(res.data.data);
    };

    // Drag handlers
    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (index) => {
        if (draggedIndex === null || draggedIndex === index) return;

        const newCategories = [...categories];
        const draggedItem = newCategories[draggedIndex];
        newCategories.splice(draggedIndex, 1);
        newCategories.splice(index, 0, draggedItem);

        setCategories(newCategories);
        setDraggedIndex(null);
    };

    const saveOrder = async () => {
        try {
            const orders = categories.map((cat, index) => ({
                id: cat._id,
                order: index
            }));
            await api.put('/categories/reorder', { orders });
            toast.success('Display order saved!');
            fetchCategories();
        } catch (err) {
            toast.error('Failed to save order');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', formData);
            toast.success('Category created!');
            setShowForm(false);
            setFormData({ name: '', description: '', image: '' });
            fetchCategories();
        } catch (err) {
            // Handled by global interceptor
        }
    };

    const deleteCategory = async (id) => {
        setDeleteModal({ isOpen: true, categoryId: id });
    };

    const confirmDelete = async () => {
        if (!deleteModal.categoryId) return;
        try {
            await api.delete(`/categories/${deleteModal.categoryId}`);
            fetchCategories();
            toast.success('Category deleted');
        } catch (err) {
            console.error('Delete failed', err);
        } finally {
            setDeleteModal({ isOpen: false, categoryId: null });
        }
    };

    return (
        <div className="category-admin">
            <div className="page-header">
                <h2>Product Categories</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="template-btn" onClick={saveOrder}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        Save Display Order
                    </button>
                    <button className="add-btn" onClick={() => setShowForm(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        New Category
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="modal" onClick={() => setShowForm(false)}>
                    <div className="admin-form-container card" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <form className="admin-form" onSubmit={handleSubmit}>
                            <div className="modal-header-section" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h3 style={{ margin: 0 }}>Add New Category</h3>
                                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
                            </div>

                            <div className="form-group">
                                <label>Category Name</label>
                                <input type="text" placeholder="e.g. Menswear" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>

                            <div className="form-group">
                                <label>Category Icon/Image URL</label>
                                <input type="text" placeholder="https://..." value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} required />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea placeholder="Briefly describe what this category contains" rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            {formData.image && (
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Preview</p>
                                    <img src={formData.image} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                </div>
                            )}

                            <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="add-btn" style={{ flex: 1 }}>Save Category</button>
                                <button type="button" className="template-btn" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-table-container">
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                    💡 Tip: Drag items to reorder them on the homepage. Click <b>Save Display Order</b> when done.
                </p>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}></th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Total Items</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((c, index) => (
                            <tr
                                key={c._id}
                                className="draggable-row"
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(index)}
                                style={{
                                    cursor: 'grab',
                                    opacity: draggedIndex === index ? 0.5 : 1,
                                    border: draggedIndex === index ? '2px dashed var(--primary)' : 'none'
                                }}
                            >
                                <td style={{ color: '#cbd5e1' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <img src={c.image || 'https://placehold.co/50'} alt="" className="table-product-img" />
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{c.name}</div>
                                    </div>
                                </td>
                                <td style={{ maxWidth: '300px', color: '#64748b', fontSize: '0.85rem' }}>
                                    {c.description || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No description</span>}
                                </td>
                                <td>
                                    <span style={{ fontWeight: 600, color: '#6366f1' }}>{c.totalItems || 0} items</span>
                                </td>
                                <td>
                                    <button className="delete-btn" onClick={() => deleteCategory(c._id)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                title="Delete Category?"
                message="Are you sure you want to delete this category? This will affect all products currently assigned to it."
                confirmLabel="Delete Category"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, categoryId: null })}
            />
        </div>
    );
};

export default CategoryAdmin;

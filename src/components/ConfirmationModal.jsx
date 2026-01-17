import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({
    isOpen,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    type = "danger" // 'danger' or 'info'
}) => {
    if (!isOpen) return null;

    return (
        <div className="conf-modal-overlay" onClick={onCancel}>
            <div className="conf-modal-card" onClick={e => e.stopPropagation()}>
                <div className="conf-modal-icon">
                    {type === 'danger' ? (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    ) : (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    )}
                </div>
                <h3 className="conf-modal-title">{title}</h3>
                <p className="conf-modal-message">{message}</p>
                <div className="conf-modal-actions">
                    <button className="conf-btn-cancel" onClick={onCancel}>{cancelLabel}</button>
                    <button className={`conf-btn-confirm ${type}`} onClick={onConfirm}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;

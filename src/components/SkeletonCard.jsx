import React from 'react';
import './SkeletonCard.css';

const SkeletonCard = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-line title"></div>
            <div className="skeleton-line price"></div>
        </div>
    );
};

export default SkeletonCard;

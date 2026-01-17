import React, { useEffect } from 'react';
import { useSettings } from '../context/store/SettingsContext';
import './Hero.css';

const Hero = () => {
    const { settings } = useSettings();
    const scrollRef = React.useRef(null);

    const heroData = {
        image: settings?.heroImage || '',
        images: settings?.heroImages || []
    };

    // Auto-scroll on mobile
    useEffect(() => {
        const displayImages = heroData.images.length > 0 ? heroData.images : [heroData.image];
        if (displayImages.length <= 1 || window.innerWidth > 768) return;

        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, offsetWidth, scrollWidth } = scrollRef.current;
                if (scrollLeft + offsetWidth >= scrollWidth - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollRef.current.scrollBy({ left: offsetWidth, behavior: 'smooth' });
                }
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [heroData]);

    const displayImages = heroData.images.length > 0 ? heroData.images : [heroData.image];

    return (
        <section className={`hero-banner-v2 ${displayImages.length > 1 ? 'split-hero' : 'single-hero'}`}>
            <div className="hero-scroll-container" ref={scrollRef}>
                {displayImages.map((img, index) => (
                    <div key={index} className="hero-slide">
                        <img src={img || 'https://placehold.co/1920x800'} alt={`Hero ${index}`} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Hero;

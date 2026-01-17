import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], totalAmount: 0 });
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('guestCart');
        if (savedCart && !user) {
            const parsedCart = JSON.parse(savedCart);
            // Filter out any items that might have null products (though less likely in guest cart)
            if (parsedCart.items) {
                parsedCart.items = parsedCart.items.filter(item => item.product);
                parsedCart.totalAmount = parsedCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            }
            setCart(parsedCart);
        }
    }, [user]); // Add user to dependencies to re-check when logging out

    // Fetch cart from server if user is logged in
    const fetchCart = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get('/cart');
            setCart(res.data.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCart();
            // Sync guest cart with server when user logs in
            syncGuestCart();
        }

        // Multi-tab Listener
        const syncTabs = (e) => {
            if (e.key === 'z-cart-ts' && user) {
                fetchCart();
            }
        };
        window.addEventListener('storage', syncTabs);
        return () => window.removeEventListener('storage', syncTabs);
    }, [user]);

    // Sync guest cart to server when user logs in
    const syncGuestCart = async () => {
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart && user) {
            try {
                const parsedCart = JSON.parse(guestCart);
                // Add each item from guest cart to server
                for (const item of parsedCart.items) {
                    await api.post('/cart', {
                        productId: item.product._id || item.product,
                        quantity: item.quantity,
                        size: item.size
                    });
                }
                localStorage.removeItem('guestCart');
                fetchCart(); // Refresh cart from server
            } catch (error) {
                console.error('Error syncing guest cart:', error);
            }
        }
    };

    const addToCart = async (productId, quantity = 1, size) => {
        try {
            if (user) {
                // Logged in user - add to server
                const res = await api.post('/cart', { productId, quantity, size });
                setCart(res.data.data);
                toast.success('Added to cart!');
            } else {
                // Guest user - add to localStorage
                const productRes = await api.get(`/products/${productId}`);
                const product = productRes.data.data;

                const existingItemIndex = cart.items.findIndex(
                    item => (item.product._id || item.product) === productId && item.size === size
                );

                let newCart;
                if (existingItemIndex > -1) {
                    // Update quantity
                    const updatedItems = [...cart.items];
                    updatedItems[existingItemIndex].quantity += quantity;
                    newCart = {
                        items: updatedItems,
                        totalAmount: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                    };
                } else {
                    // Add new item
                    const newItem = {
                        product: product,
                        quantity: quantity,
                        size: size,
                        price: product.price
                    };
                    const updatedItems = [...cart.items, newItem];
                    newCart = {
                        items: updatedItems,
                        totalAmount: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                    };
                }

                setCart(newCart);
                localStorage.setItem('guestCart', JSON.stringify(newCart));
                toast.success('Added to cart!');
            }
            // Trigger multi-tab sync
            localStorage.setItem('z-cart-ts', Date.now());
        } catch (error) {
            toast.error('Failed to add to cart');
            throw error;
        }
    };

    const updateQuantity = async (productId, size, quantity) => {
        try {
            if (user) {
                const res = await api.put(`/cart/${productId}`, { quantity, size });
                setCart(res.data.data);
            } else {
                // Guest user - update localStorage
                const updatedItems = cart.items.map(item =>
                    (item.product._id || item.product) === productId && item.size === size
                        ? { ...item, quantity }
                        : item
                );
                const newCart = {
                    items: updatedItems,
                    totalAmount: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                };
                setCart(newCart);
                localStorage.setItem('guestCart', JSON.stringify(newCart));
            }
            // Trigger multi-tab sync
            localStorage.setItem('z-cart-ts', Date.now());
        } catch (error) {
            throw error;
        }
    };

    const removeFromCart = async (productId, size) => {
        try {
            if (user) {
                const res = await api.delete(`/cart/${productId}?size=${size}`);
                setCart(res.data.data);
            } else {
                // Guest user - remove from localStorage
                const updatedItems = cart.items.filter(
                    item => !((item.product._id || item.product) === productId && item.size === size)
                );
                const newCart = {
                    items: updatedItems,
                    totalAmount: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                };
                setCart(newCart);
                localStorage.setItem('guestCart', JSON.stringify(newCart));
            }
            // Trigger multi-tab sync
            localStorage.setItem('z-cart-ts', Date.now());
        } catch (error) {
            throw error;
        }
    };

    const clearCart = () => {
        setCart({ items: [], totalAmount: 0 });
        if (!user) {
            localStorage.removeItem('guestCart');
        }
    };

    return (
        <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);

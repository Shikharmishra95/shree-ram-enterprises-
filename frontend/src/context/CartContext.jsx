import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      const guestCart = localStorage.getItem('guest_cart');
      if (guestCart) {
        try {
          setCartItems(JSON.parse(guestCart) || []);
        } catch (e) {
          console.error('Failed to parse guest cart:', e);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
      return;
    }
    try {
      const response = await API.get('/api/cart');
      setCartItems(response.data || []);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  }, [isAuthenticated]);

  // Synchronous cart loading and automatic guest cart merge on login transition
  useEffect(() => {
    if (isAuthenticated) {
      const guestCart = localStorage.getItem('guest_cart');
      if (guestCart) {
        try {
          const parsed = JSON.parse(guestCart);
          if (parsed && parsed.length > 0) {
            const merge = async () => {
              console.log('[Cart Context] Merging local guest cart items into user database account...');
              for (const item of parsed) {
                try {
                  await API.post('/api/cart/add', { 
                    productId: item.product.id, 
                    quantity: item.quantity 
                  });
                } catch (err) {
                  console.error(`Failed to merge item ${item.product.id}:`, err);
                }
              }
              localStorage.removeItem('guest_cart');
              fetchCart();
            };
            merge();
          } else {
            fetchCart();
          }
        } catch (e) {
          console.error(e);
          localStorage.removeItem('guest_cart');
          fetchCart();
        }
      } else {
        fetchCart();
      }
    } else {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      try {
        // Fetch product information dynamically from public endpoint
        const response = await API.get(`/api/products/${productId}`);
        const product = response.data;

        let currentGuestCart = [];
        const stored = localStorage.getItem('guest_cart');
        if (stored) {
          try {
            currentGuestCart = JSON.parse(stored) || [];
          } catch (e) {
            console.error(e);
          }
        }

        const existingIdx = currentGuestCart.findIndex(item => item.product.id === productId);
        if (existingIdx > -1) {
          const newQty = currentGuestCart[existingIdx].quantity + quantity;
          if (newQty > product.stockQuantity) {
            showToast('Sorry, requested item quantity exceeds warehouse availability.');
            return false;
          }
          currentGuestCart[existingIdx].quantity = newQty;
        } else {
          if (quantity > product.stockQuantity) {
            showToast('Sorry, requested item quantity exceeds warehouse availability.');
            return false;
          }
          currentGuestCart.push({
            id: `guest-${productId}-${Date.now()}`,
            product,
            quantity
          });
        }

        localStorage.setItem('guest_cart', JSON.stringify(currentGuestCart));
        setCartItems(currentGuestCart);
        showToast('Product added to local guest cart!');
        return true;
      } catch (err) {
        console.error('Failed to update guest cart:', err);
        showToast('Failed to add to cart');
        return false;
      }
    }

    try {
      await API.post('/api/cart/add', { productId, quantity });
      fetchCart();
      showToast('Product added to cart!');
      return true;
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400) {
        showToast('Sorry, requested item quantity exceeds warehouse availability.');
      } else {
        showToast(err.response?.data?.message || 'Failed to add to cart');
      }
      return false;
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return false;

    if (!isAuthenticated) {
      let currentGuestCart = [];
      const stored = localStorage.getItem('guest_cart');
      if (stored) {
        try {
          currentGuestCart = JSON.parse(stored) || [];
        } catch (e) {
          console.error(e);
        }
      }

      const itemIdx = currentGuestCart.findIndex(item => item.id === itemId);
      if (itemIdx > -1) {
        const product = currentGuestCart[itemIdx].product;
        if (newQuantity > product.stockQuantity) {
          showToast('Sorry, requested item quantity exceeds warehouse availability.');
          return false;
        }
        currentGuestCart[itemIdx].quantity = newQuantity;
        localStorage.setItem('guest_cart', JSON.stringify(currentGuestCart));
        setCartItems(currentGuestCart);
        return true;
      }
      return false;
    }

    try {
      await API.put(`/api/cart/${itemId}`, { quantity: newQuantity });
      fetchCart();
      return true;
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400) {
        showToast('Sorry, requested item quantity exceeds warehouse availability.');
      } else {
        showToast(err.response?.data?.message || 'Failed to update quantity');
      }
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
      let currentGuestCart = [];
      const stored = localStorage.getItem('guest_cart');
      if (stored) {
        try {
          currentGuestCart = JSON.parse(stored) || [];
        } catch (e) {
          console.error(e);
        }
      }

      const updated = currentGuestCart.filter(item => item.id !== itemId);
      localStorage.setItem('guest_cart', JSON.stringify(updated));
      setCartItems(updated);
      showToast('Product removed from local cart.');
      return true;
    }

    try {
      await API.delete(`/api/cart/${itemId}`);
      fetchCart();
      showToast('Product removed from cart.');
      return true;
    } catch (err) {
      console.error(err);
      showToast('Failed to remove item');
      return false;
    }
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        totalCartItems
      }}
    >
      {children}
      {/* Global Error/Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-surface-card border border-border rounded-xl p-4 shadow-2xl shadow-black/30 flex items-center gap-3 min-w-72">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{toastMessage}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-text-muted hover:text-text-primary cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

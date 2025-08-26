import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const exist = prev.find(item => item.id === product.id);
      if (exist) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const getCartTotals = (deliveryDistanceKm = 0) => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let deliveryCharge = 0;

    if (subtotal >= 2000) {
      deliveryCharge = 0;
    } else if (deliveryDistanceKm <= 10) {
      deliveryCharge = 0;
    } else if (deliveryDistanceKm <= 20) {
      deliveryCharge = 40;
    } else if (deliveryDistanceKm <= 50) {
      deliveryCharge = 70;
    } else {
      deliveryCharge = 110;
    }

    const total = subtotal + deliveryCharge;
    return { subtotal, deliveryCharge, total };
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, getCartTotals }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

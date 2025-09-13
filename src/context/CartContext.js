import React, { createContext, useContext, useMemo, useState } from "react";


const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity = 1) => {
    if (!product || product.id == null) return;
    const qty = Math.max(1, Number(quantity) || 1);
    setCartItems((prev) => {
      const exist = prev.find((i) => i.id === product.id);
      if (exist) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: Number(i.quantity) + qty } : i
        );
      }
      const price = Number(product.price) || 0;
      return [...prev, { ...product, price, quantity: qty }];
    });
  };

  const updateQuantity = (id, quantity) => {
    const qty = Math.max(1, Number(quantity) || 1);
    setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Delivery charges removed; keep signature compatible (ignore any argument).
  const getCartTotals = () => {
    const subtotal = cartItems.reduce(
      (acc, i) => acc + (Number(i.price) || 0) * (Number(i.quantity) || 0),
      0
    );
    const deliveryCharge = 0; // always free
    const deliveryText = "FREE"; // for UI display
    const total = subtotal + deliveryCharge;
    return { subtotal, deliveryCharge, deliveryText, total };
  };

  // Optional helpers
  const getItemCount = () =>
    cartItems.reduce((a, i) => a + (Number(i.quantity) || 0), 0);

  // Native INR formatter exposed for clean UI display
  const formatINR = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    []
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        getCartTotals,
        getItemCount,
        formatINR, // use: formatINR.format(value)
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

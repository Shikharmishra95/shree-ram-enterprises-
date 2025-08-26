import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { getProductImage } from "../utils/imageLoader";
import "./CartPopup.css";
import { FaTimes } from "react-icons/fa";

function CartPopup({ onClose }) {
  const { cartItems, updateQuantity, removeFromCart, getCartTotals } = useCart();
  const [deliveryDistance, setDeliveryDistance] = useState(0);

  const { subtotal, deliveryCharge, total } = getCartTotals(Number(deliveryDistance) || 0);

  // Helper: resolve filename or http URL
  const imgSrc = (img) => {
    if (!img) return "";
    return String(img).startsWith("http") ? img : getProductImage(img);
  };

  const handleCheckout = () => {
    const phoneNumber = "91XXXXXXXXXX"; // WhatsApp number without +
    let message = "🛒 *New Order*\n\n";
    cartItems.forEach((item) => {
      message += `• ${item.name} (x${item.quantity}) - ₹${Number(item.price) * Number(item.quantity)}\n`;
    });
    message += `\n*Total:* ₹${total.toFixed(2)}`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="cart-popup-overlay" onClick={onClose}>
      <div className="cart-popup" onClick={(e) => e.stopPropagation()}>
        <div className="cart-popup-header">
          <h3>🛒 Your Cart</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart-msg">
            <img
              src="https://img.icons8.com/ios/100/cccccc/shopping-cart--v1.png"
              alt="Empty"
            />
            <p>No items in cart</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-row" key={item.id}>
                  <img
                    src={imgSrc(item?.images?.[0])}
                    alt={item?.name || "Cart item"}
                    className="cart-img"
                  />

                  <div className="cart-info">
                    <div className="cart-prod-name">{item?.name}</div>
                    <div className="cart-prod-price">
                      ₹{item?.price}
                      <span className="cart-prod-qty">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          +
                        </button>
                      </span>
                    </div>
                  </div>

                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="delivery-panel">
              <label>
                Delivery Distance (km):
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 7"
                  value={deliveryDistance}
                  onChange={(e) => setDeliveryDistance(e.target.value)}
                />
              </label>
              <div className="delivery-rule">
                <b>Rules:</b> ₹2000+ → FREE, ≤10km Free, ≤20km ₹40, ≤50km ₹70, Above 50km ₹110
              </div>
            </div>

            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div>
                <span>Delivery</span>
                <span className={deliveryCharge === 0 ? "free" : ""}>
                  {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                </span>
              </div>
              <div className="total">
                <span>Total</span>
                <span className="cart-total">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="cart-popup-actions">
              <button className="checkout-btn" onClick={handleCheckout}>
                Checkout via WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartPopup;

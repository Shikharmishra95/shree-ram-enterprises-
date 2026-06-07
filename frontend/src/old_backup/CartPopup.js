import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import "./CartPopup.css";
import { FaTimes } from "react-icons/fa";
import { getProductImage } from "../utils/imageLoader";

function CartPopup({ onClose }) {
  const { cartItems, updateQuantity, removeFromCart, getCartTotals } = useCart();
  const [deliveryDistance, setDeliveryDistance] = useState(0);

  const { subtotal, deliveryCharge, total } = getCartTotals(
    Number(deliveryDistance) || 0
  );

  // ✅ WhatsApp checkout with location (Frontend Safe Fix)
  const handleCheckout = () => {
    const phoneNumber = "918840542840"; // apna WhatsApp number (without +)

    if (!navigator.geolocation) {
      alert("❌ Location not supported in this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

        let message = "🛒 *New Order Received*\n\n";

        // 🔹 Items detail
        cartItems.forEach((item) => {
          message += `• ${item.name} (x${item.quantity}) = ₹${
            item.price * item.quantity
          }\n`;
        });

        // 🔹 Summary
        message += `\nSubtotal: ₹${subtotal.toFixed(2)}`;
        message += `\nDelivery: ${
          deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`
        }`;
        message += `\n*Total: ₹${total.toFixed(2)}*`;

        // 🔹 Location
        message += `\n\n📍 Location: ${mapsLink}`;

        // ✅ Correct WhatsApp link (Safe frontend fix)
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
          message
        )}`;

        // 🔥 Always open in new tab
        window.open(url, "_blank", "noopener,noreferrer");
      },
      (error) => {
        alert("❌ Please allow location access to place the order");
        console.error(error);
      }
    );
  };

  return (
    <div className="cart-popup-overlay" onClick={onClose}>
      <div className="cart-popup" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-popup-header">
          <h3>🛒 Your Cart</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Empty */}
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
            {/* Items */}
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-row" key={item.id}>
                  <img
                    src={getProductImage(item.images[0])} // ✅ image loader used
                    alt={item.name}
                    className="cart-img"
                  />
                  <div className="cart-info">
                    <div className="cart-prod-name">{item.name}</div>
                    <div className="cart-prod-price">
                      ₹{item.price}
                      <span className="cart-prod-qty">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </span>
                    </div>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
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

            {/* Actions */}
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

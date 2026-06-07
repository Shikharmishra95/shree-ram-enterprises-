import React, { useRef } from "react";
import { useCart } from "../context/CartContext";
import { FaShoppingCart } from "react-icons/fa";

function CartSummaryBar({ onOpenCart }) {
  const { cartItems } = useCart();
  const iconRef = useRef();

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const totalMRP = cartItems.reduce(
    (acc, item) => acc + (item.mrp || item.price) * item.quantity,
    0
  );
  const totalDiscount = totalMRP - totalPrice;

  if (cartItems.length === 0) return null;

  const handleBarClick = () => {
    if (iconRef.current) {
      iconRef.current.classList.remove("bar-icon-animate");
      void iconRef.current.offsetWidth;
      iconRef.current.classList.add("bar-icon-animate");
    }
    onOpenCart();
  };

  return (
    <>
      <style>{`
        .cart-summary-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          min-height: 39px;
          background: linear-gradient(90deg,#0fef83 0%,#25d366 38%,#22b187 90%);
          box-shadow: 0 -5px 28px 0 #21d18d2f, 0 1px 6px #10e95e14;
          backdrop-filter: saturate(180%) blur(8px);
          -webkit-backdrop-filter: saturate(180%) blur(8px);
          color: #fff;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 7vw 0 1.1em;
          cursor: pointer;
          font-weight: 500;
          font-family: 'Segoe UI', Verdana, Arial, sans-serif;
          z-index: 2025;
          user-select: none;
          transition: background 0.29s cubic-bezier(.39,.58,.57,1), box-shadow 0.25s, transform 0.17s;
          animation: bar-fadein 0.7s cubic-bezier(.7,.44,.63,1) 1;
        }
        @keyframes bar-fadein {
          0% { opacity: 0; transform: translateY(20px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .cart-summary-bar:hover,
        .cart-summary-bar:active {
          background: linear-gradient(90deg,#1afca0 0%,#25d366 45%,#14de6b 100%);
          box-shadow: 0 -7px 38px 0 #11ec7d3f, 0 3px 20px #13dd7270;
          transform: scale(1.022);
        }
        .bar-cart-icon {
          font-size: 22px;
          filter: drop-shadow(0 1px 7px #11e98fad);
          opacity: 0.92;
          margin-top: 1px;
          margin-right: 4px;
          transition: filter 0.17s, transform 0.17s;
          will-change: transform;
        }
        .bar-icon-animate {
          animation: cartPulse 0.5s cubic-bezier(.41,.22,.52,1) 1;
        }
        @keyframes cartPulse {
          15% { transform: scale(1.12); filter: drop-shadow(0 2px 10px #cfffdd); }
          47% { transform: scale(0.91);}
          75% { transform: scale(1.05);}
          100% { transform: scale(1); }
        }
        .bar-text-wrap {
          display: flex;
          flex-direction: column;
          gap: 1px;
          line-height: 1.2;
          min-width: 0;
        }
        .bar-main-text {
          font-size: 1em;
          color: #fff;
          letter-spacing: 0.01em;
          word-break: keep-all;
          font-weight: 550;
        }
        .bar-discount {
          color: #ffe082;
          font-weight: 600;
          font-size: 13.4px;
          margin-left: 2px;
        }
        .bar-rule-text {
          font-size: 12.5px;
          color: #c3ffe3;
          font-weight: 400;
          opacity: .93;
          margin-top: 1.5px;
          display: flex;
          align-items: center;
        }
        .bar-rule-strong {
          color: #fff700;
          font-weight: 700;
          margin-left: 3px;
        }
        .bar-dot {
          margin: 0 4px;
          opacity: 0.32;
          font-size: 17px;
        }
        /* Responsive - bar tighter on mobile */
        @media (max-width: 630px) {
          .cart-summary-bar {
            font-size: 14px;
            padding-left: 10px;
            padding-right: 8px;
          }
          .bar-main-text { font-size: 14.7px;}
          .bar-rule-text { font-size: 10.9px;}
          .bar-cart-icon { font-size: 18px;}
        }
        @media (max-width: 420px) {
          .cart-summary-bar {
            box-shadow: 0 -2px 10px #12f57423;
          }
        }
      `}</style>
      <div
        className="cart-summary-bar"
        onClick={handleBarClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleBarClick();
        }}
        aria-label={`${totalItems} item${totalItems > 1 ? "s" : ""} in cart, total ₹${totalPrice.toFixed(
          2
        )}. Click to view cart.`}
      >
        <FaShoppingCart ref={iconRef} className="bar-cart-icon" />
        <div className="bar-text-wrap">
          <span className="bar-main-text">
            <b>{totalItems}</b> item{totalItems > 1 ? "s" : ""} · <b>₹{totalPrice.toFixed(0)}</b>
            {totalDiscount > 0 && <span className="bar-discount">| saved ₹{totalDiscount.toFixed(0)}</span>}
          </span>
          <span className="bar-rule-text">
            Delivery: <span className="bar-rule-strong">₹2k+ / ≤10km FREE</span>
            <span className="bar-dot"> · </span> else ₹2/km
          </span>
        </div>
      </div>
    </>
  );
}

export default CartSummaryBar;

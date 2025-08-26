import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import { getProductImage } from "../utils/imageLoader";
import "./ProductCard.css";

function ProductCard({ product, onQuickView, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  const discountPercent =
    product.showDiscount && product.mrp
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  // Yeh function check karke external URL ho to direct use karega, warna utility se import karega
  const getImageSrc = (img) =>
    img.startsWith("http") ? img : getProductImage(img);

  const decreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQty = () => setQuantity(quantity + 1);

  return (
    <div className="product-card">
      <div
        className="product-image-wrap"
        onClick={() => onQuickView(product)}
        style={{ cursor: "pointer" }}
      >
        <img src={getImageSrc(product.images[0])} alt={product.name} />
        {product.bestseller && <span className="badge bestseller">Bestseller</span>}
        {discountPercent > 0 && (
          <span className="badge discount">{discountPercent}% OFF</span>
        )}
        <button
          className="icon-btn quickview-icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          aria-label="Quick View"
          type="button"
        >
          <FaEye />
        </button>
      </div>

      <div className="product-info">
        <h4 className="product-name">{product.name}</h4>
        <div className="price-block">
          {product.showDiscount && product.mrp ? (
            <>
              <span className="mrp">₹{product.mrp}</span>
              <span className="price">₹{product.price}</span>
            </>
          ) : (
            <span className="price">₹{product.price}</span>
          )}
        </div>
      </div>

      <div className="qty-control">
        <button
          className="qty-btn"
          onClick={decreaseQty}
          aria-label="Decrease quantity"
          disabled={quantity <= 1}
        >
          −
        </button>
        <span className="qty-number">{quantity}</span>
        <button
          className="qty-btn"
          onClick={increaseQty}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <button
        className="add-btn"
        onClick={() => onAddToCart(product, quantity)}
        aria-label="Add to Cart"
      >
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;

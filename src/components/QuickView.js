import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaArrowLeft } from "react-icons/fa";
import "./QuickView.css";

function QuickView({ product, onClose, onAddToCart, onBuyNow }) {
  const [quantity, setQuantity] = useState(1);
  const swiperRef = useRef(null);

  useEffect(() => {
    setQuantity(1);
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideTo(0, 0);
    }
  }, [product]);

  if (!product) return null;

  const discountPercent =
    product.showDiscount && product.mrp
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <AnimatePresence>
      <motion.div
        className="quickview-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="quickview-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, boxShadow: "0 12px 28px rgba(0,0,0,0.3)" }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="back-btn" onClick={onClose} aria-label="Back">
            <FaArrowLeft />
          </button>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>

          <h2 className="product-title">{product.name}</h2>

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={12}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            loop={true}
            initialSlide={0}
            onSwiper={(swiper) => {
              swiperRef.current = { swiper };
            }}
          >
            {product.images.map((img, i) => (
              <SwiperSlide key={i}>
                <img src={img} alt={product.name} />
              </SwiperSlide>
            ))}
          </Swiper>

          <p className="product-desc">{product.description}</p>

          <div className="product-pricing">
            {product.showDiscount && product.mrp ? (
              <>
                <del>₹{product.mrp}</del>
                <span className="price">₹{product.price}</span>
                {discountPercent > 0 && <span className="discount">{discountPercent}% OFF</span>}
              </>
            ) : (
              <span className="price">₹{product.price}</span>
            )}
          </div>

          <div className="qty-control">
            <button onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)} aria-label="Decrease quantity">
              −
            </button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">
              +
            </button>
          </div>

          <div className="action-buttons">
            <button
              className="addcart-btn"
              onClick={() => {
                onAddToCart(product, quantity);
              }}
            >
              Add to Cart
            </button>

            <button
              className="buynow-btn"
              onClick={() => {
                onAddToCart(product, quantity);
                onClose();
                onBuyNow && onBuyNow();
              }}
            >
              Buy Now
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default QuickView;

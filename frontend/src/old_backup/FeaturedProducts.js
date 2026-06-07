import React from "react";
import ProductCard from "./ProductCard";
import "./FeaturedProducts.css"; // new CSS file

function FeaturedProducts({ products, onQuickView, onAddToCart }) {
  const featured = products.filter(p => p.featured);

  return (
    <section style={{ margin: "20px 0" }}>
      <h2 style={{ marginLeft: 15 }}>Featured Products</h2>
      <div className="featured-grid">
        {featured.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onQuickView={onQuickView}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;

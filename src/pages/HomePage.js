import React, { useState } from "react";
import BannerSlider from "../components/BannerSlider";
import FeaturedProducts from "../components/FeaturedProducts";
import CategoryMenu from "../components/CategoryMenu";
import ProductCard from "../components/ProductCard";
import QuickView from "../components/QuickView";
import CartPage from "../components/CartPage";
import CartPopup from "../components/CartPopup";
import { useCart } from "../context/CartContext";

function HomePage({ categories, products, searchTerm }) {
  const { addToCart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showCartPage, setShowCartPage] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);

  const normalize = (str) => (str || "").toLowerCase().replace(/\s+/g, "");

  let filteredProducts = products;

  if (searchTerm && searchTerm.trim() !== "") {
    filteredProducts = filteredProducts.filter((p) =>
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  filteredProducts = filteredProducts.filter((p) => {
    if (selectedSubcategory) {
      return normalize(p.subcategory) === normalize(selectedSubcategory);
    }
    if (selectedCategory) {
      return normalize(p.category) === normalize(selectedCategory);
    }
    return true;
  });

  const handleAddClick = (product, qty = 1) => addToCart(product, qty);

  return (
    <>
      {showCartPage ? (
        <CartPage onBack={() => setShowCartPage(false)} />
      ) : (
        <>
          <BannerSlider />
          <CategoryMenu
            categories={categories}
            products={products}
            selectedCategory={selectedCategory}
            setSelectedCategory={(cat) => {
              setSelectedCategory(cat);
              setSelectedSubcategory("");
            }}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
          />

          <main className="main-content" style={{ padding: "10px" }}>
            {(selectedCategory || selectedSubcategory) ? (
              <>
                <h2 style={{ margin: "10px 0" }}>
                  {selectedSubcategory || selectedCategory}
                </h2>

                <div className="product-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={setQuickViewProduct}
                      onAddToCart={handleAddClick}
                    />
                  ))}
                </div>

                <FeaturedProducts
                  products={products}
                  onQuickView={setQuickViewProduct}
                  onAddToCart={handleAddClick}
                />
              </>
            ) : (
              <>
                <FeaturedProducts
                  products={products}
                  onQuickView={setQuickViewProduct}
                  onAddToCart={handleAddClick}
                />
                <h2 style={{ margin: "10px 0" }}>All Products</h2>
                <div className="product-grid">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={setQuickViewProduct}
                      onAddToCart={handleAddClick}
                    />
                  ))}
                </div>
              </>
            )}
          </main>

          {quickViewProduct && (
            <QuickView
              product={quickViewProduct}
              onClose={() => setQuickViewProduct(null)}
              onAddToCart={handleAddClick}
              onBuyNow={() => setShowCartPopup(true)}
            />
          )}

          {showCartPopup && (
            <CartPopup
              onClose={() => setShowCartPopup(false)}
              onViewCart={() => {
                setShowCartPopup(false);
                setShowCartPage(true);
              }}
            />
          )}
        </>
      )}
    </>
  );
}

export default HomePage;

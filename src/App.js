import React, { useState } from "react";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CartPopup from "./components/CartPopup";
import CartSummaryBar from "./components/CartSummaryBar";
import categories from "./data/categories";
import products from "./data/products";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCartPopup, setShowCartPopup] = useState(false);

  return (
    <CartProvider>
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onCartClick={() => setShowCartPopup(true)}
      />

      <HomePage categories={categories} products={products} searchTerm={searchTerm} />

      <CartSummaryBar onOpenCart={() => setShowCartPopup(true)} />

      {showCartPopup && <CartPopup onClose={() => setShowCartPopup(false)} />}

      <Footer />
    </CartProvider>
  );
}

export default App;

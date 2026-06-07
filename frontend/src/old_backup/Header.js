// src/components/Header.jsx
import React, { useState } from "react";
import { FaSearch, FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/logo.png";
import "./Header.css";

function Header({ searchTerm, setSearchTerm, cartItemCount = 0, onCartClick }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSearchBar(false);
  };

  const toggleSearchBar = () => setShowSearchBar((prev) => !prev);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="header-logo">
            <img src={logo} alt="Logo" className="logo-img" />
            <span className="brand-text">Shree Ram Enterprises</span>
          </div>

          <form className="search-form desktop" onSubmit={handleSearch} noValidate>
            <input
              type="text"
              placeholder="Search products..."
              aria-label="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" aria-label="Search">
              <FaSearch />
            </button>
          </form>

          <div className="header-icons">
            <button
              className="icon-btn mobile"
              aria-label="Toggle Search"
              onClick={toggleSearchBar}
            >
              <FaSearch />
            </button>

            <button className="icon-btn" aria-label="View Cart" onClick={onCartClick}>
              <FaShoppingCart />
              {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
            </button>

            <button className="icon-btn" aria-label="Open Menu" onClick={openSidebar}>
              <FaBars />
            </button>
          </div>
        </div>

        {showSearchBar && (
          <form className="search-form mobile" onSubmit={handleSearch} noValidate>
            <input
              type="text"
              placeholder="Search products..."
              aria-label="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              autoComplete="off"
            />
            <button type="submit" aria-label="Search">
              <FaSearch />
            </button>
          </form>
        )}
      </header>

      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      <aside
        className={`sidebar-menu ${sidebarOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="sidebar-close-btn"
          aria-label="Close Menu"
          onClick={closeSidebar}
        >
          <FaTimes />
        </button>

        <div className="owner-details">
          <h3>Owner Details</h3>
          <p><strong>Name:</strong> Ujjwal Mishra</p>
          <p><strong>Address:</strong> Unnao</p>
          <p><strong>Phone:</strong> +91 8840542840</p>
          <p>
            <strong>Email:</strong> info@shreeramenterprises.com
          </p>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/featured">Featured</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default Header;

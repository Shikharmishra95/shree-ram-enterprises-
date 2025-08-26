import React, { useState } from "react";
import { FaSearch, FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/logo.png";
import "./Header.css";

function Header({ onSearch, cartItemCount, onCartClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch && onSearch(searchTerm);
  };

  const toggleSearchBar = () => setShowSearchBar((prev) => !prev);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <header className="header">
        <div className="header-inner">
          {/* Logo & Brand */}
          <div className="header-logo">
            <img src={logo} alt="Logo" className="logo-img" />
            <span className="brand-text">Shree Ram Enterprises</span>
          </div>

          {/* Desktop Search Bar */}
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

          {/* Icons */}
          <div className="header-icons">
            {/* Mobile Search Toggle */}
            <button
              className="icon-btn mobile"
              aria-label="Toggle Search"
              onClick={toggleSearchBar}
            >
              <FaSearch />
            </button>

            {/* Cart */}
            <button className="icon-btn" aria-label="View Cart" onClick={onCartClick}>
              <FaShoppingCart />
              {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
            </button>

            {/* Menu */}
            <button className="icon-btn" aria-label="Open Menu" onClick={openSidebar}>
              <FaBars />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
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

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={closeSidebar} />

      {/* Sidebar Menu */}
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
          <p>
            <strong>Name:</strong> Shree Ram
          </p>
          <p>
            <strong>Address:</strong> 123 Temple Road, City
          </p>
          <p>
            <strong>Phone:</strong> +91 12345 67890
          </p>
          <p>
            <strong>Email:</strong> info@shreeramenterprises.com
          </p>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/featured">Featured</a>
            </li>
            <li>
              <a href="/contact">Contact Us</a>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default Header;

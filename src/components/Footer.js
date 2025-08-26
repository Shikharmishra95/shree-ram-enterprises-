import React from "react";
import "./Footer.css";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaLock,
  FaUserShield,
  FaTruck,
  FaShieldAlt,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">

        {/* Brand & About */}
        <div className="footer-section about">
          <h3 className="brand-name">
            Shree Ram Enterprises
          </h3>
          <div className="footer-desc">
            <span className="footer-tagline">Premium hardware & beauty essentials under one roof</span>
            <span className="footer-highlight">
              Serving Unnao with trusted service since 2001.
            </span>
            <span className="footer-icons-row">
              <FaLock /> 100% Secure Payments&nbsp;&nbsp;&nbsp;
              <FaUserShield /> Trusted Seller&nbsp;&nbsp;&nbsp;
              <FaTruck /> Fast Delivery&nbsp;&nbsp;&nbsp;
              <FaShieldAlt /> Genuine Products
            </span>
          </div>
        </div>

        {/* Pages */}
        <div className="footer-section links">
          <h4>Departments</h4>
          <ul>
            <li><a href="/categories/hardware">Hardware</a></li>
            <li><a href="/categories/hair">Hair Care</a></li>
            <li><a href="/categories/skin">Skin Care</a></li>
            <li><a href="/categories/grooming">Grooming</a></li>
            <li><a href="/categories/more">All Categories</a></li>
          </ul>
        </div>

        {/* Useful / Support */}
        <div className="footer-section links">
          <h4>Useful Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/featured">Featured</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/policies">Terms & Policies</a></li>
            <li><a href="/returns">Returns & Support</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section contact">
          <h4>Contact</h4>
          <p><FaPhone className="footer-icon" /> <a href="tel:+919876543210">+91 8840542840</a></p>
          <p><FaEnvelope className="footer-icon" /> <a href="mailto:info@shreeramenterprises.com">info@shreeramenterprises.com</a></p>
          <p>
            <FaMapMarkerAlt className="footer-icon" />{" "}
            Nehru Nagar, Shuklaganj,<br />Unnao, UP &ndash; 209861
          </p>
          <p><FaClock className="footer-icon" /> Mon-Sat: 9am–8pm<br />Sun: Closed</p>
        </div>

        {/* Social Links */}
        <div className="footer-section social">
          <h4>Connect</h4>
          <div className="social-links">
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{background:'#3b5998'}}><FaFacebookF /></a>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{background:'#e1306c'}}><FaInstagram /></a>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{background:'#25D366',color:'#fff'}}><FaWhatsapp /></a>
          </div>
        </div>
      </div>

      {/* Google Map */}
      <div className="footer-map-wrap">
        <iframe
          title="Shree Ram Enterprises Map"
          src="https://www.google.com/maps?q=Nehru+Nagar,+Shuklaganj,+Unnao,+Uttar+Pradesh+209861&output=embed"
          width="100%"
          height="150"
          style={{ border: 0, borderRadius: "10px", margin: "20px 0 0" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="footer-address-txt">
          Visit us: Nehru Nagar, Shuklaganj, Unnao, Uttar Pradesh &ndash; 209861
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} <b>Shree Ram Enterprises</b> &mdash; All Rights Reserved
      </div>
    </footer>
  );
}
export default Footer;

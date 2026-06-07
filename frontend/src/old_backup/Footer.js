import React, { useMemo, useCallback } from "react";
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
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcDiscover,
  FaRupeeSign,
} from "react-icons/fa";

// Inline store logo as SVG for sharp rendering without external images
const StoreLogoSVG = ({ size = 40 }) => (
  <svg
    className="logo-svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    role="img"
    aria-label="Shree Ram Enterprises logo"
  >
    <defs>
      <linearGradient id="g1" x1="0" x2="1">
        <stop offset="0%" stopColor="#58ffca" />
        <stop offset="100%" stopColor="#50e6ff" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="#1d2030" stroke="url(#g1)" strokeWidth="3" />
    <path
      d="M16 40c6-6 12-10 16-10s10 4 16 10M20 24l4 6m20-6-4 6"
      fill="none"
      stroke="#58ffca"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <text
      x="32"
      y="47"
      textAnchor="middle"
      fontSize="9"
      fill="#f8e113"
      fontWeight="700"
      style={{ letterSpacing: "0.06em" }}
    >
      SRE
    </text>
  </svg>
);

function Footer() {
  const PHONE_DISPLAY = "+91 8840542840";
  const PHONE_INTL = "918840542840"; // international format (country code + number, no symbols)
  const EMAIL = "info@shreeramenterprises.com";
  const ADDRESS_LINES = ["Nehru Nagar, Shuklaganj", "Unnao, UP – 209861"];

  // Prefilled WhatsApp message per click-to-chat guidelines
  const waText = useMemo(
    () =>
      encodeURIComponent(
        "Hi Shree Ram Enterprises! I have a question about your products."
      ),
    []
  );
  const waLink = `https://wa.me/${PHONE_INTL}?text=${waText}`;

  // LocalBusiness JSON-LD for better local SEO
  const schemaData = useMemo(
    () =>
      JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "Shree Ram Enterprises",
          "description":
            "Premium hardware and beauty essentials under one roof. Serving Unnao with trusted service since 2001.",
          "telephone": PHONE_DISPLAY,
          "email": EMAIL,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Nehru Nagar, Shuklaganj",
            "addressLocality": "Unnao",
            "addressRegion": "UP",
            "postalCode": "209861",
            "addressCountry": "IN",
          },
          "url": typeof window !== "undefined" ? window.location.origin : "",
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ],
              "opens": "09:00",
              "closes": "20:00",
            },
          ],
          "sameAs": [
            "https://facebook.com/",
            "https://instagram.com/",
          ],
        },
        null,
        0
      ),
    [PHONE_DISPLAY, EMAIL]
  );

  const handleSubscribe = useCallback((e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") || "").toString().trim();
    const subject = encodeURIComponent("Subscribe me to updates");
    const body = encodeURIComponent(
      `Hello Shree Ram Enterprises,\n\nPlease add ${email} to the newsletter.\n\nThanks!`
    );
    if (email) {
      window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    }
  }, []);

  return (
    <footer className="footer" role="contentinfo">
      {/* SEO: LocalBusiness Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaData }} />

      <div className="footer-main">
        {/* Brand & About */}
        <section className="footer-section about" aria-labelledby="footer-brand">
          <div className="brand-row">
            <StoreLogoSVG />
            <h3 className="brand-name" id="footer-brand">
              Shree Ram Enterprises
            </h3>
          </div>
          <div className="footer-desc">
            <span className="footer-tagline">
              Premium Salon & beauty essentials under one roof
            </span>
            <span className="footer-highlight">
              Serving Unnao with trusted service since 20011.
            </span>
            <span className="footer-icons-row">
              <FaLock /> 100% Secure Payments&nbsp;&nbsp;&nbsp;
              <FaUserShield /> Trusted Seller&nbsp;&nbsp;&nbsp;
              <FaTruck /> Fast Delivery&nbsp;&nbsp;&nbsp;
              <FaShieldAlt /> Genuine Products
            </span>
          </div>

          <div className="trust-badges" aria-label="Accepted payments">
            <FaCcVisa />
            <FaCcMastercard />
            <FaCcAmex />
            <FaCcDiscover />
            <FaRupeeSign />
          </div>

          <div className="cta-row">
            <a className="cta-whatsapp" href={waLink} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
              <FaWhatsapp /> Chat on WhatsApp
            </a>
            <button
              className="to-top"
              type="button"
              aria-label="Back to top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              ↑ Top
            </button>
          </div>
        </section>

        {/* Departments */}
        <nav className="footer-section links" aria-labelledby="footer-depts">
          <h4 id="footer-depts">Departments</h4>
          <ul>
            <li><a href="/categories/hardware">Appliancess</a></li>
            <li><a href="/categories/hair">Salon Tools</a></li>
            <li><a href="/categories/skin">Skin Care</a></li>
            <li><a href="/categories/grooming">Grooming</a></li>
            <li><a href="/categories/more">All Categories</a></li>
          </ul>
        </nav>

        {/* Useful Links */}
        <nav className="footer-section links" aria-labelledby="footer-links">
          <h4 id="footer-links">Useful Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/featured">Featured</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/policies">Terms & Policies</a></li>
            <li><a href="/returns">Returns & Support</a></li>
          </ul>
        </nav>

        {/* Contact */}
        <section className="footer-section contact" aria-labelledby="footer-contact">
          <h4 id="footer-contact">Contact</h4>
          <p>
            <FaPhone className="footer-icon" />{" "}
            <a href={`tel:+${PHONE_INTL}`}>{PHONE_DISPLAY}</a>
          </p>
          <p>
            <FaEnvelope className="footer-icon" />{" "}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </p>
          <p>
            <FaMapMarkerAlt className="footer-icon" />{" "}
            {ADDRESS_LINES}<br />{ADDRESS_LINES[1]}
          </p>
          <p>
            <FaClock className="footer-icon" /> Mon–Sat: 9am–8pm<br />Sun: Closed
          </p>
        </section>

        {/* Social */}
        <section className="footer-section social" aria-labelledby="footer-social">
          <h4 id="footer-social">Connect</h4>
          <div className="social-links" role="list">
            <a
              href="https://facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              style={{ background: "#3b5998" }}
            >
              <FaFacebookF />
            </a>
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              style={{ background: "#e1306c" }}
            >
              <FaInstagram />
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              style={{ background: "#25D366", color: "#fff" }}
            >
              <FaWhatsapp />
            </a>
          </div>
        </section>

        {/* Newsletter */}
        <section className="footer-section newsletter" aria-labelledby="footer-newsletter">
          <h4 id="footer-newsletter">Get Updates</h4>
          <form onSubmit={handleSubscribe} aria-label="Newsletter subscribe form">
            <input
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Enter email for offers"
              aria-label="Email address"
              required
            />
            <button type="submit" className="btn-subscribe" aria-label="Subscribe">
              Subscribe
            </button>
          </form>
          <small className="newsletter-note">
            No spam, unsubscribe anytime.
          </small>
        </section>
      </div>

      {/* Google Map */}
      <div className="footer-map-wrap" aria-label="Map and address">
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
          Visit us: Nehru Nagar, Shuklaganj, Unnao, Uttar Pradesh – 209861
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} <b>Shree Ram Enterprises</b> — All Rights Reserved
      </div>
    </footer>
  );
}

export default Footer;

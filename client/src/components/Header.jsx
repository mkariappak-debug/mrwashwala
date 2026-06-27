import React, { useState } from 'react';
import logo from '../assets/logo.png';

export default function Header({ cartCount }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="navbar sticky-nav">
      <div className="nav-container">
        <a href="#home" className="nav-logo">
          <img src={logo} alt="Mr. Wash Wala Logo" className="logo-img" />
        </a>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <a href="#home" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </a>
          </li>
          <li>
            <a href="#pricing" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Services
            </a>
          </li>
          <li>
  <a
  href="#franchise"
  className="nav-link"
  onClick={() => setIsMenuOpen(false)}
>
  Franchise
</a>
</li><li>
            <a
              href="#cart"
              className="nav-link nav-icon-only"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Cart"
              title="Cart"
            >
              <span className="nav-link-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M3 4h2l2.2 10.3A2 2 0 0 0 9.2 16H18a2 2 0 0 0 1.9-1.4L22 7H7.1" />
                  <circle cx="10" cy="20" r="1.7" />
                  <circle cx="17" cy="20" r="1.7" />
                </svg>
              </span>
              <span id="cart-count" className="cart-badge">{cartCount}</span>
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className="nav-link nav-icon-only"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Contact"
              title="Contact"
            >
              <span className="nav-link-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z" />
                  <path d="M5.5 7.5 12 12l6.5-4.5" />
                </svg>
              </span>
            </a>
          </li>
          <li>
            <a
              href="#address"
              className="nav-link nav-icon-only"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Address"
              title="Address"
            >
              <span className="nav-link-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M12 21s6-5.4 6-10a6 6 0 1 0-12 0c0 4.6 6 10 6 10z" />
                  <circle cx="12" cy="11" r="2.2" />
                </svg>
              </span>
            </a>
          </li>
        </ul>

        <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}
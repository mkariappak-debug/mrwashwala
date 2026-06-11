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
</li>
          <li>
            <a href="#cart" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Cart <span id="cart-count" className="cart-badge">{cartCount}</span>
            </a>
          </li>
          <li>
            <a href="#contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Contact
            </a>
          </li>
          <li>
            <a href="#address" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Address
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
import React, { useState } from 'react';
import logo from '../assets/logo.png';

export default function Header({ cartCount }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="navbar sticky-nav">
      <div className="nav-container">
        <div 
          className="nav-logo" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ cursor: 'pointer' }}
        >
          <img src={logo} alt="Mr. WashWala Logo" className="logo-img logo-img-large" />
          <span className="logo-text">
            <span className="logo-mr">Mr. </span>
            <span className="logo-wash">WashWala</span>
          </span>
        </div>

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
            <a href="#pricing" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Pricing
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
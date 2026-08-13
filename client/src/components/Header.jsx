import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Header({ cartCount }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavClick = (path) => {
    setIsMenuOpen(false);

    if (location.pathname === path && typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/home" className="nav-logo" onClick={() => handleNavClick('/home')}>
          <img src={logo} alt="Mr. Wash Wala Logo" className="logo-img" />
        </Link>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <Link to="/home" className="nav-link" onClick={() => handleNavClick('/home')}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/services" className="nav-link" onClick={() => handleNavClick('/services')}>
              <span className="nav-link-with-icon">
                <span>Services</span>
                <span className="nav-cart-icon-wrap">
                  <span className="nav-link-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="img">
                      <path d="M3 4h2l2.2 10.3A2 2 0 0 0 9.2 16H18a2 2 0 0 0 1.9-1.4L22 7H7.1" />
                      <circle cx="10" cy="20" r="1.7" />
                      <circle cx="17" cy="20" r="1.7" />
                    </svg>
                  </span>
                  {cartCount > 0 && (
                    <span id="cart-count" className="cart-badge">{cartCount}</span>
                  )}
                </span>
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/branches"
              className="nav-link"
              onClick={() => handleNavClick('/branches')}
            >
              Our Branches
            </Link>
          </li>
          <li>
            <Link
              to="/franchise"
              className="nav-link"
              onClick={() => handleNavClick('/franchise')}
            >
              Franchise
            </Link>
          </li>
          <li>
            <Link
              to="/admin/login"
              className="nav-link"
              onClick={() => handleNavClick('/admin/login')}
            >
              Admin
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="nav-link"
              onClick={() => handleNavClick('/contact')}
            >
              Contact
            </Link>
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
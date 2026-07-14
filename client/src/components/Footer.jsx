import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content container">

        <div className="footer-section">
          <h4 style={{ color: '#fff' }}>Quick Links</h4>
          <ul>
            <li>
              <Link to="/home">Home</Link>
            </li>
            <li>
              <Link to="/services">Services</Link>
            </li>
            <li>
              <Link to="/branches">Our Branches</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 style={{ color: '#fff' }}>Contact Us</h4>
          <p style={{ fontSize: '0.9rem', color: '#e3f2fd' }}>📞 +91 9035999271</p>
          <p style={{ fontSize: '0.9rem', color: '#e3f2fd', marginTop: '5px' }}>
            <a href="tel:+917019436720" style={{ color: 'inherit', textDecoration: 'none' }}>
              📞 +91 7019436720
            </a>
          </p>
          <p style={{ fontSize: '0.9rem', color: '#e3f2fd', marginTop: '5px' }}>✉️ mrwashwala@gmail.com</p>

          <div className="social-links">
            
            <a
              href="https://www.instagram.com/mr.washwala?igsh=Z3B6eWh3cDl5Mzl6"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram mr.washwala"
              className="instagram-link"
            >
              <svg fill="#fff" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              <span className="instagram-username">mr.washwala</span>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-divider" aria-hidden="true" />

      <div className="footer-bg-text" aria-hidden="true">
        <span>Mr.WashWala</span>
      </div>

      <div className="footer-bottom container">
        <p>© {new Date().getFullYear()} Mr. WashWala. All rights reserved.</p>
        <p style={{ marginTop: '5px' }}>LIFE IS SHORT, DON'T WASTE IT ON LAUNDRY.BURDEN NAMGE BIDII NIVU JUST ENJOY MADII  </p>
      </div>
    </footer>
  );
}

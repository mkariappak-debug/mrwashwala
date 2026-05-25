import React, { useState } from 'react';
import logo from '../assets/logo.png';
import Icon from './Icon';
import { faBars, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

export default function Header({ cartCount }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="sticky top-0 z-40 bg-transparent">
      <div className="max-w-[1100px] mx-auto px-4 flex items-center justify-between py-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={logo} alt="Mr. WashWala Logo" className="h-9 w-auto rounded" />
          <span className="font-extrabold text-white text-lg">Mr. <span className="text-white">WashWala</span></span>
        </div>

        <ul className={`hidden md:flex items-center gap-6 text-white font-medium ${isMenuOpen ? 'block' : ''}`}>
          <li><a href="#home" className="hover:opacity-90">Home</a></li>
          <li><a href="#pricing" className="hover:opacity-90">Services</a></li>
          <li><a href="#pricing" className="hover:opacity-90">Pricing</a></li>
          <li><a href="#cart" className="hover:opacity-90 inline-flex items-center gap-2"> <Icon icon={faShoppingCart} size="md" /> Cart <span id="cart-count" className="inline-flex items-center justify-center bg-primary text-white rounded-full px-2 py-0.5 text-xs ml-2">{cartCount}</span></a></li>
          <li><a href="#contact" className="hover:opacity-90">Contact</a></li>
        </ul>

        <button className="md:hidden" onClick={toggleMenu} aria-label="Toggle menu">
          <Icon icon={faBars} size="lg" />
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/5 backdrop-blur-sm py-4">
          <ul className="flex flex-col items-center gap-4 text-white">
            <li><a href="#home" onClick={() => setIsMenuOpen(false)}>Home</a></li>
            <li><a href="#pricing" onClick={() => setIsMenuOpen(false)}>Services</a></li>
            <li><a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a></li>
            <li><a href="#cart" onClick={() => setIsMenuOpen(false)}>Cart <span id="cart-count-mobile" className="inline-flex items-center justify-center bg-primary text-white rounded-full px-2 py-0.5 text-xs ml-2">{cartCount}</span></a></li>
            <li><a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a></li>
          </ul>
        </div>
      )}
    </nav>
  );
}
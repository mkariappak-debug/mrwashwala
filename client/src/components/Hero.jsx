import React from 'react';

export default function Hero({ onBookPickup, onViewServices }) {
  return (
    <section id="home" className="hero-section">
      <div id="canvas-hero" className="hero-gradient-bg" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="hero-title">Fresh Clothes Delivered to Your Doorsteps</h1>
        <p className="hero-subtitle">Fast, Premium Laundry and Dry Cleaning at Your Doorstep across Mysuru</p>
        <div className="hero-cta">
          <button className="btn btn-primary" onClick={onBookPickup}>
            Book Pickup
          </button>
          <button className="btn btn-secondary" onClick={onViewServices}>
            View Services
          </button>
        </div>
      </div>
      <div className="scroll-indicator" onClick={onViewServices} style={{ cursor: 'pointer' }}>
        <span>Scroll to explore</span>
        <div className="scroll-icon">↓</div>
      </div>
    </section>
  );
}
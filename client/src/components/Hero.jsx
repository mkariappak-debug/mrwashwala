import React from "react";

export default function Hero({ onBookPickup }) {
  return (
    <section id="home" className="hero-section">
      <div id="canvas-hero" className="hero-gradient-bg" />
      <div className="hero-overlay" />

      <div className="hero-content">
      <h1 className="hero-title">
  <span className="desktop-title">
    Premium Wash,
    <br />
    Shine Like New!
  </span>

  <span className="mobile-title">
    Premium
    <br />
    Wash
    <br />
    Shine Like
    <br />
    New!
  </span>
</h1>

<p className="hero-subtitle">
  <span className="gold-text">Premium Wash</span>
  <span className="white-text"> | </span>
  <span className="gold-text">Dry Cleaning</span>
  <span className="white-text"> | </span>
  <span className="gold-text">Laundry</span>
</p>
        <div className="hero-cta">
          <button
            className="btn btn-primary"
            onClick={onBookPickup}
          >
            Book Pickup
          </button>

          <a
            href="https://wa.me/917019436720?text=Hi%20Mr.%20WashWala%2C%20I%20want%20to%20book%20a%20laundry%20pickup%20service!"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
          >
            WhatsApp Order
          </a>
        </div>
      </div>
    </section>
  );
}
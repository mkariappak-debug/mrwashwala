import React from "react";

export default function Hero({ onBookPickup }) {
  return (
    <section id="home" className="hero-section">
      <div id="canvas-hero" className="hero-gradient-bg" />
      <div className="hero-overlay" />

      <div className="hero-content">
        <h1 className="hero-title">
          Fresh Clothes Delivered
          <br />
          To Your Doorstep
        </h1>

        <p className="hero-subtitle">
          Fast, Premium Laundry & Dry Cleaning Service
          <br />
          Across Mysuru
        </p>

        <div className="hero-cta">
          <button
            className="btn btn-primary"
            onClick={onBookPickup}
          >
            Book Pickup
          </button>

          <a
            href="https://wa.me/918088980347?text=Hi%20Mr.%20WashWala%2C%20I%20want%20to%20book%20a%20laundry%20pickup%20service!"
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
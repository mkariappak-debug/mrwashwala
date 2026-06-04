import React from "react";

export default function Franchise() {
  return (
    <section id="franchise" className="franchise-section">
      <div className="container">

        
        <h2 className="franchise-title">
  Own a <span className="franchise-mr">Mr.</span>{" "}
  <span className="franchise-washwala">WashWala</span> Franchise
</h2>

        <p className="section-subtitle">
          Join our growing laundry network and build a successful business with our proven model.
        </p>

        <div className="franchise-grid">

          <div className="franchise-card">
            <h3>Low Investment</h3>
            <p>
              Start your own laundry business with affordable setup costs.
            </p>
          </div>

          <div className="franchise-card">
            <h3>Complete Training</h3>
            <p>
              We provide operational, technical and customer service training.
            </p>
          </div>

          <div className="franchise-card">
            <h3>Marketing Support</h3>
            <p>
              Get branding, promotional materials and digital marketing support.
            </p>
          </div>

          <div className="franchise-card">
            <h3>Growing Industry</h3>
            <p>
              Tap into the rapidly growing laundry and dry-cleaning market.
            </p>
          </div>

        </div>

        <a
           href="https://wa.me/918867295898"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Enquire About Franchise
        </a>

      </div>
    </section>
  );
}
import React from "react";

export default function WhyChooseUs() {
  return (
    <section className="why-choose-section">
      <div className="container">
        <h2 className="section-title">
  Why Choose <span className="why-mr">Mr.</span>{" "}
  <span className="why-washwala">WashWala</span>?
</h2>

        <p className="section-subtitle">
          Experience premium laundry service excellence with our commitment to quality
        </p>

        <div className="why-choose-intro" data-aos="fade-up">
          <p>
            Mr. WashWala is India's most trusted laundry service, combining years
            of expertise with cutting-edge technology and a passionate team
            dedicated to perfection. We've earned the trust of thousands of
            customers across the city by delivering exceptional quality,
            lightning-fast service, and transparent pricing that no other
            provider can match. Every garment receives premium care with
            eco-friendly practices, making us not just the best choice for your
            clothes, but also for the environment.
          </p>
        </div>

        {/* Stats moved from Hero */}
        <div className="hero-stats">
          <span className="stat-item">
            5,233+ Orders Completed
          </span>

          <span className="stats-divider">|</span>

          <span className="stat-item">
            ★ 4.9 Customer Rating
          </span>

          <span className="stats-divider">|</span>

          <span className="stat-item">
            Serving 2 Cities
          </span>
        </div>
      </div>
    </section>
  );
}
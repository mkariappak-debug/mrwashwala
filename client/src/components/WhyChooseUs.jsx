import React from "react";
import whyChooseImage from "../assets/why_choose_washwala.png";

export default function WhyChooseUs() {
  return (
    <section className="why-choose-section">
      <div className="container">
        <h2 className="section-title white-bg-heading">
          Why Choose <span className="why-mr">Mr.</span>{" "}
          <span className="why-washwala">WashWala</span>?
        </h2>

        <p className="section-subtitle">
          Experience premium laundry service excellence with our commitment to quality
        </p>

        {/* Image replaces white text box */}
        <div className="why-choose-intro" data-aos="fade-up">
          <img
            src={whyChooseImage}
            alt="Why Choose Mr WashWala"
            className="why-choose-image"
          />
        </div>

        {/* Stats */}
        <div className="hero-stats">
          <span className="stat-item">
            <span className="stat-number">5,233</span>
            <span className="stat-plus">+</span>
            <span className="stat-text"> Orders Completed</span>
          </span>

          <span className="stats-divider">|</span>

          <span className="stat-item">
            <span className="stat-star">★</span>
            <span className="stat-rating"> 4.9</span>
            <span className="stat-text"> Customer Rating</span>
          </span>

          <span className="stats-divider">|</span>

          <span className="stat-item">
            <span className="stat-number">Serving</span>
            <span className="stat-number"> 2</span>
            <span className="stat-plus"> +</span>
            <span className="stat-text"> Cities</span>
          </span>
        </div>
      </div>
    </section>
  );
}
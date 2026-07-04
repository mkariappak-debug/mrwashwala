import React from "react";
import { branches } from "../config/branches";

export default function AddressPage() {
  const activeBranches = branches.filter((branch) => branch.isActive !== false);

  return (
    <section id="address" className="contact-section">
      <div className="container">
        <h2 className="section-title white-bg-heading">Our Branch Addresses</h2>
        <p className="section-subtitle white-bg-subtitle">
          Find the nearest Mr. WashWala outlet and get directions instantly.
        </p>

        <div className="contact-wrapper" style={{ gridTemplateColumns: "1fr" }}>
          <div className="contact-info">
            {activeBranches.map((branch, index) => (
              <div
                key={branch.id}
                className="contact-card"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <h3>📍 {branch.shortName}</h3>
                <p>
                  {branch.address.line1}
                  <br />
                  {branch.address.line2}
                  <br />
                  {branch.address.line3}
                </p>
                <div className="contact-label">Open everyday 9 AM - 8 PM</div>
                <a
                  className="contact-branch-link"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get directions →
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

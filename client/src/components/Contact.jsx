import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { branches } from '../config/branches';
import BranchesMap from './BranchesMap';

const BRANCH_PIN_COLORS = ['#27187E', '#0E9F6E'];

export default function Contact() {
  const location = useLocation();
  const activeBranches = branches.filter((b) => b.isActive);
  // First branch (Vijayanagar) stays in the left column with the contact
  // methods; any remaining branches (Vijaynagar 2nd Stage) move under the map on the
  // right so both columns end up roughly the same height.
  const [primaryBranch, ...otherBranches] = activeBranches;

  // Same branch-card markup used in both columns — kept identical to the
  // original card so styling/animations/content are unchanged, just reused
  // to avoid duplicating the JSX in two places.
  const renderBranchCard = (branch, delay) => (
    <div
      className="contact-card"
      data-aos="fade-right"
      data-aos-delay={delay}
      key={branch.id}
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
      <Link to={`/branches/${branch.id}`} className="contact-branch-link">
        View branch details →
      </Link>
    </div>
  );

  // Builds a Google Maps embed URL (no API key required) with a labeled
  // pin for every active branch, so the map always reflects branches.js.
  const mapQuery = activeBranches
    .map(
      (b) => `${b.latitude},${b.longitude}(${encodeURIComponent(b.shortName)})`
    )
    .join('|');
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&t=&z=12&ie=UTF8&iwloc=&output=embed`;

  useEffect(() => {
    if (location.hash !== '#address') {
      return;
    }

    const target = document.getElementById('address');
    if (!target) {
      return;
    }

    // Keep section visible below fixed navbar.
    const navOffset = 96;
    const targetY = target.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }, [location.hash]);

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="contact-title-box">
          <h2 className="section-title white-bg-heading">Get In Touch</h2>
        </div>

        <div className="contact-subtitle-box">
          <p className="section-subtitle white-bg-subtitle">
            We are always here to help you with your laundry needs
          </p>
        </div>

        <div className="contact-wrapper">
          <div className="contact-info">
            {/* Contact Methods Row */}
            <div className="contact-methods">
              {/* Phone */}
              <div className="contact-card" data-aos="fade-right">
                <h3>📞 Phone</h3>
                <p>
                  <a href="tel:9035999271">+91 9035999271</a>
                  <br />
                  <a href="tel:+917019436720">+91 7019436720</a>
                </p>
                <div className="contact-label">Available everyday</div>
              </div>

              {/* WhatsApp */}
              <div
                className="contact-card whatsapp-card"
                data-aos="fade-right"
                data-aos-delay="100"
              >
                <h3>💬 WhatsApp</h3>
                <p>
                  <a
                    href="https://wa.me/919035999271?text=Hi%20Mr.%20WashWala%2C%20I%20want%20to%20know%20about%20your%20services"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Chat with us
                  </a>
                </p>
                <div className="contact-label">
                  Quick responses guaranteed
                </div>
              </div>

              {/* Email */}
              <div
                className="contact-card"
                data-aos="fade-right"
                data-aos-delay="200"
              >
                <h3>✉️ Email</h3>
                <p>
                  <a href="mailto:mrwashwala@gmail.com">
                    mrwashwala@gmail.com
                  </a>
                </p>
                <div className="contact-label">
                  We'll reply within 24 hours
                </div>
              </div>
            </div>

            <h3 id="address" className="contact-subsection-title">
              Branch Addresses
            </h3>

            {/* Primary Branch Address (Vijayanagar) */}
            {primaryBranch && renderBranchCard(primaryBranch, 300)}
          </div>

          {/* Right Column: Map */}
          <div className="contact-right-column">
            <div className="map-premium-wrapper" data-aos="fade-left">
              <div className="map-container">
                <BranchesMap branches={activeBranches} fallbackSrc={mapSrc} />
              </div>

              <div className="map-legend">
                {activeBranches.map((branch, index) => (
                  <a
                    className="map-legend-item"
                    key={branch.id}
                    href={branch.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address.full)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span
                      className="map-legend-dot"
                      style={{
                        background:
                          BRANCH_PIN_COLORS[index % BRANCH_PIN_COLORS.length],
                      }}
                    />
                    <span className="map-legend-text">
                      {branch.shortName}
                      <small>Get directions →</small>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Remaining Branch Address(es) (Bhogadi) — placed directly
                beneath the map so this column's height matches the left
                column instead of leaving empty space below the map. */}
            {otherBranches.map((branch, index) =>
              renderBranchCard(branch, 300 + index * 100)
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
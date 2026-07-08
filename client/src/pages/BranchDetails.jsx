import React, { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { branches } from "../config/branches";
import { branchContent } from "../config/branchContent";

export default function BranchDetails() {
  const { branchId } = useParams();
  const branch = branches.find((b) => b.id === branchId && b.isActive);
  const content = branch ? branchContent[branch.id] : null;

  const branchDisplayNames = {
    "vijaynagar-mysuru": {
      shortName: "Vijaynagar 2nd Stage",
      name: "Mr. WashWala - Vijaynagar 2nd Stage, Mysuru"
    },
    "vijaynagar-2nd-stage-mysuru": {
      shortName: "Vijaynagar 4th Stage",
      name: "Mr. WashWala - Vijaynagar 4th Stage, Mysuru"
    }
  };

  const displayShortName = branch ? (branchDisplayNames[branch.id]?.shortName || branch.shortName) : "";
  const displayName = branch ? (branchDisplayNames[branch.id]?.name || branch.name) : "";

  useEffect(() => {
    import("aos").then((mod) => {
      try {
        mod.default.refreshHard();
      } catch (e) {
        // ignore
      }
    });
    window.scrollTo(0, 0);
  }, [branchId]);

  if (!branch) {
    return <Navigate to="/branches" replace />;
  }

  const directionsUrl = branch?.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch?.address?.full || branch?.shortName || "Mr WashWala")}`;
  const whatsappUrl = `https://wa.me/${branch.whatsapp}?text=${encodeURIComponent(
    `Hi Mr. WashWala, I'd like to know more about your ${branch.shortName}.`
  )}`;
  const hasVideo = Boolean(content?.video && typeof content.video === "string" && content.video.trim());

  return (
    <div className="branch-details-page">
      {/* COVER */}
      <section className="branch-cover">
        <img
          src={content.coverImage}
          alt={displayName}
          className="branch-cover-image"
        />
        <div className="branch-cover-overlay" />

        <div className="container branch-cover-content">
          <Link to="/branches" className="branch-back-link" data-aos="fade-right">
            ← All Branches
          </Link>
          <span className="branch-cover-eyebrow" data-aos="fade-up">
            Mr. WashWala
          </span>
          <h1 className="branch-cover-title" data-aos="fade-up" data-aos-delay="100">
            {displayShortName}
          </h1>
          <p className="branch-cover-subtitle" data-aos="fade-up" data-aos-delay="200">
            {content.tagline}
          </p>
        </div>
      </section>

      {/* INFO STRIP */}
      <section className="branch-info-strip">
        <div className="container branch-info-grid">
          <div className="branch-info-item" data-aos="fade-up">
            <span className="branch-info-icon" aria-hidden="true">
              📍
            </span>
            <div>
              <h4>Address</h4>
              <p>{branch.address.full}</p>
            </div>
          </div>
          <div className="branch-info-item" data-aos="fade-up" data-aos-delay="80">
            <span className="branch-info-icon" aria-hidden="true">
              📞
            </span>
            <div>
              <h4>Phone</h4>
              <p>
                <a href={`tel:${branch.phone}`}>+91 {branch.phone}</a>
              </p>
            </div>
          </div>
          <div className="branch-info-item" data-aos="fade-up" data-aos-delay="160">
            <span className="branch-info-icon" aria-hidden="true">
              🕒
            </span>
            <div>
              <h4>Working Hours</h4>
              <p>Open everyday, 9 AM – 8 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="branch-about-section">
        <div className="container">
          <h2 className="section-title white-bg-heading">About This Branch</h2>
          <p className="branch-about-text" data-aos="fade-up">
            {content.about}
          </p>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section className="branch-features-section">
        <div className="container">
          <h2 className="section-title white-bg-heading">Feature Highlights</h2>
          <div className="branch-features-grid">
            {content.features.map((feature, index) => (
              <div
                className="branch-feature-card"
                key={feature.title}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <span className="branch-feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="branch-gallery-section">
        <div className="container">
          <h2 className="section-title white-bg-heading">Photo Gallery</h2>
          <div className="branch-gallery-grid">
            {content.gallery.map((src, index) => (
              <div
                className="branch-gallery-item"
                key={src + index}
                data-aos="zoom-in"
                data-aos-delay={index * 80}
              >
                <img src={src} alt={`${branch.shortName} gallery ${index + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {hasVideo && (
        <section className="branch-video-section">
          <div className="container">
            <h2 className="section-title white-bg-heading">Inside The Branch</h2>
            <div className="branch-video-wrapper" data-aos="fade-up">
              <video
                key={content.video}
                className="branch-video"
                controls
                muted
                loop
                playsInline
                preload="metadata"
              >
                <source src={content.video} type="video/mp4" />
              </video>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="branch-cta-section">
        <div className="container branch-cta-inner" data-aos="fade-up">
          <div>
            <h2>Ready to experience {displayShortName}?</h2>
            <p>Book a pickup or get directions straight to our door.</p>
          </div>
          <div className="branch-cta-buttons">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Book a Pickup
            </a>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Get Directions
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { branches } from "../config/branches";
import { branchContent } from "../config/branchContent";

export default function Branches() {
  useEffect(() => {
    // Refresh AOS so entrance animations trigger for this route's elements
    // (AOS itself is initialised once, globally, in App.jsx).
    import("aos").then((mod) => {
      try {
        mod.default.refreshHard();
      } catch (e) {
        // ignore
      }
    });
    window.scrollTo(0, 0);
  }, []);

  // Render all branches here so the coming soon branch is visible
  const allBranches = branches;

  const branchDisplayNames = {
    "vijaynagar-mysuru": {
      shortName: "Vijaynagar 2nd Stage",
      name: "Mr. WashWala - Vijaynagar 2nd Stage, Mysuru"
    },
    "vijaynagar-2nd-stage-mysuru": {
      shortName: "Vijaynagar 4th Stage",
      name: "Mr. WashWala - Vijaynagar 4th Stage, Mysuru"
    },
    "kuvempunagar-mysuru": {
      shortName: "Kuvempunagar",
      name: "Mr. WashWala - Kuvempunagar, Mysuru"
    }
  };

  return (
    <div className="branches-page">
      {/* HERO */}
      <section className="branches-hero">
        <div className="branches-hero-glow" aria-hidden="true" />
        <div className="container branches-hero-content">
          <span className="branches-hero-eyebrow" data-aos="fade-up">
            Mr. WashWala
          </span>
          <h1 className="branches-hero-title" data-aos="fade-up" data-aos-delay="100">
            Our Branches
          </h1>
          <p className="branches-hero-subtitle" data-aos="fade-up" data-aos-delay="200">
            Premium outlets across Mysuru, one consistent standard of
            care. Find the branch nearest you and see how we work.
          </p>
        </div>
      </section>

      {/* BRANCH CARDS */}
      <section className="branches-grid-section">
        <div className="container">
          <div className="branches-grid">
            {allBranches.map((branch, index) => {
              const content = branchContent[branch.id] || {};
              const isComingSoon = branch.comingSoon || !branch.isActive;
              return (
                <div
                  className="branch-card"
                  key={branch.id}
                  data-aos="fade-up"
                  data-aos-delay={index * 120}
                >
                  <div className="branch-card-image">
                    <img
                      src={content.cardImage || "/gallery/collection.jpg"}
                      alt={branch.shortName}
                      loading="lazy"
                    />
                    <div className="branch-card-image-overlay" />
                    <span className="branch-card-badge">{branchDisplayNames[branch.id]?.shortName || branch.shortName}</span>
                  </div>

                  <div className="branch-card-body">
                    <h3 className="branch-card-name">{branchDisplayNames[branch.id]?.name || branch.name}</h3>

                    <p className="branch-card-tagline">{content.tagline}</p>

                    <ul className="branch-card-meta">
                      <li>
                        <span className="branch-card-icon" aria-hidden="true">
                          📍
                        </span>
                        {branch.address.full}
                      </li>
                      <li>
                        <span className="branch-card-icon" aria-hidden="true">
                          📞
                        </span>
                        <a href={`tel:${branch.phone}`}>+91 {branch.phone}</a>
                      </li>
                      <li>
                        <span className="branch-card-icon" aria-hidden="true">
                          🕒
                        </span>
                        {isComingSoon ? "Opening Soon" : "Open everyday, 9 AM – 8 PM"}
                      </li>
                    </ul>

                    {isComingSoon ? (
                      <button
                        type="button"
                        className="btn btn-secondary branch-card-btn"
                        disabled
                        style={{ cursor: "default", opacity: 0.85 }}
                      >
                        Coming Soon
                      </button>
                    ) : (
                      <Link
                        to={`/branches/${branch.id}`}
                        className="btn btn-primary branch-card-btn"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

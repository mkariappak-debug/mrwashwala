import React from "react";

export default function HeroNowServingCard({ onExplore }) {
  const handleExplore = () => {
    if (typeof onExplore === "function") {
      onExplore();
      return;
    }

    const branchSection = document.getElementById("branches-section");
    if (branchSection) {
      branchSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside className="hero-now-serving-card" aria-label="Now serving from two locations in Mysuru">
      <div className="hero-now-serving-head">NOW SERVING FROM</div>
      <div className="hero-now-serving-title">2 LOCATIONS IN MYSURU</div>

      <ul className="hero-now-serving-list">
        <li>
          <span className="hero-now-serving-icon" aria-hidden="true">
            📍
          </span>
          <span>Vijayanagar 2nd Stage</span>
        </li>
        <li className="hero-now-serving-badge">
          <span className="hero-now-serving-icon" aria-hidden="true">
            ✨
          </span>
          <span>Newly Opened</span>
        </li>
        <li>
          <span className="hero-now-serving-icon" aria-hidden="true">
            📍
          </span>
          <span>Vijayanagar 4th Stage</span>
        </li>
        <li className="hero-kuvempunagar-card">
          <div className="hero-now-serving-item hero-now-serving-badge" style={{ background: "transparent", padding: 0, margin: 0, display: "flex" }}>
            <span className="hero-now-serving-icon" aria-hidden="true">
              ⏳
            </span>
            <span>Coming Soon</span>
          </div>
          <div className="hero-now-serving-item" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="hero-now-serving-icon" aria-hidden="true">
              📍
            </span>
            <span>Kuvempunagar</span>
          </div>
        </li>
      </ul>

      <button type="button" className="hero-now-serving-explore" onClick={handleExplore}>
        Explore <span aria-hidden="true">→</span>
      </button>
    </aside>
  );
}

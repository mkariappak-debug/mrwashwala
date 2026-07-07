import React from "react";

export default function HeroNowServingCard() {
  const handleExplore = () => {
    const branchSection = document.getElementById("our-branches");
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
      </ul>

      <button type="button" className="hero-now-serving-explore" onClick={handleExplore}>
        Explore <span aria-hidden="true">→</span>
      </button>
    </aside>
  );
}

import React, { useEffect, useState } from "react";
import HomeBackgroundMedia from "../components/HomeBackgroundMedia";
import HeroBadge from "./HeroBadge";
import HeroNowServingCard from "./HeroNowServingCard";

const HOME_MASCOT_VIDEOS = ["/home-mascot-loop.mp4", "/home-mascot-pack.mp4"];

export default function Hero({ isMobile, homeMascotVideoIndex, onHomeMascotVideoEnded, onBookPickup }) {
  const [isBranchPanelOpen, setIsBranchPanelOpen] = useState(false);

  useEffect(() => {
    if (!isBranchPanelOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsBranchPanelOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isBranchPanelOpen]);

  useEffect(() => {
    const handleCloseBranchDrawer = () => {
      setIsBranchPanelOpen(false);
    };

    window.addEventListener("mrwashwala:close-branch-drawer", handleCloseBranchDrawer);

    return () => {
      window.removeEventListener("mrwashwala:close-branch-drawer", handleCloseBranchDrawer);
    };
  }, []);

  const handleOpenBranchesPanel = () => {
    setIsBranchPanelOpen(true);
  };

  const handleCloseBranchesPanel = () => {
    setIsBranchPanelOpen(false);
  };

  const handleExploreBranches = () => {
    handleCloseBranchesPanel();

    const branchSection = document.getElementById("branches-section");
    if (branchSection) {
      branchSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <HomeBackgroundMedia
        isMobile={isMobile}
      />
      <section id="home" className="hero-section">
      <div id="canvas-hero" className="hero-gradient-bg" />
      <div className="hero-overlay" />

      <div className="hero-content">
        <div className="hero-content-mobile">
          <HeroBadge />
          <div className="hero-copy">
            <h1 className="hero-title">
              <span className="desktop-title">
                Premium Wash,
                <br />
                Shine Like New!
              </span>

              <span className="mobile-title">
                Premium Wash,
                <br />
                Shine Like New!
              </span>
            </h1>

            <p className="hero-subtitle">
              <span className="gold-text">Premium Wash</span>
              <span className="white-text"> | </span>
              <span className="gold-text">Dry Cleaning</span>
              <span className="white-text"> | </span>
              <span className="gold-text">Laundry</span>
            </p>
            <div className="hero-cta">
              <button
                className="btn btn-primary"
                onClick={onBookPickup}
              >
                Book Pickup
              </button>

              <a
                href="https://wa.me/919035999271?text=Hi%20Mr.%20WashWala%2C%20I%20want%20to%20book%20a%20laundry%20pickup%20service!"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                WhatsApp Order
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-left-overlay">
        <div className="hero-floating-animation-space" />
        {isMobile ? (
          <>
            <button
              type="button"
              className="hero-mobile-branch-tab"
              onClick={handleOpenBranchesPanel}
              aria-label="Open branch locations"
            >
              📍 Branches
            </button>
            <div
              className={`hero-mobile-branch-overlay ${isBranchPanelOpen ? "is-open" : ""}`}
              onClick={handleCloseBranchesPanel}
            />
            <div
              className={`hero-mobile-branch-card ${isBranchPanelOpen ? "is-open" : ""}`}
              role="dialog"
              aria-modal="true"
              aria-label="Now serving from two locations in Mysuru"
            >
              <button
                type="button"
                className="hero-mobile-branch-close"
                onClick={handleCloseBranchesPanel}
                aria-label="Close branch locations"
              >
                ×
              </button>
              <HeroNowServingCard onExplore={handleExploreBranches} />
            </div>
          </>
        ) : (
          <HeroNowServingCard />
        )}
      </div>

      <video
        key={HOME_MASCOT_VIDEOS[homeMascotVideoIndex]}
        className="home-mascot-loop-video"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onEnded={onHomeMascotVideoEnded}
      >
        <source src={HOME_MASCOT_VIDEOS[homeMascotVideoIndex]} type="video/mp4" />
      </video>
    </section>
    </>
  );
}
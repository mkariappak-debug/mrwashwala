import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import CallButton from "../components/CallButton";
import EmailButton from "../components/EmailButton";
import FranchiseButton from "../components/FranchiseButton";
import HomeBackgroundMedia from "../components/HomeBackgroundMedia";

export default function SiteLayout({
  cartCount = 0,
  children,
  showFranchiseButton = false,
  showHomeBackground = false,
  isMobile = false,
  homeMascotVideoIndex = 0,
  onHomeMascotVideoEnded,
  className = ""
}) {
  const containerClass = ["app-layout-container", className].filter(Boolean).join(" ");

  return (
    <div className={containerClass}>
      {showHomeBackground && (
        <HomeBackgroundMedia
          isMobile={isMobile}
          homeMascotVideoIndex={homeMascotVideoIndex}
          onHomeMascotVideoEnded={onHomeMascotVideoEnded}
        />
      )}
      <Header cartCount={cartCount} />
      {children}
      <Footer />
      <WhatsAppButton />
      {showFranchiseButton && <FranchiseButton />}
      <CallButton />
      <EmailButton />
    </div>
  );
}

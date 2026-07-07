import React from "react";
import { useNavigate } from "react-router-dom";

import Hero from "../components/Hero";
import WhyChooseUs from "../components/WhyChooseUs";
import Gallery from "../components/Gallery";
import Testimonials from "../components/Testimonials";
import BranchesSection from "../components/BranchesSection";

export default function HomePage({
  isMobile,
  homeMascotVideoIndex,
  onHomeMascotVideoEnded
}) {
  const navigate = useNavigate();

  const handleBookPickup = () => {
    navigate("/services");
  };

  return (
    <>
      <Hero
        isMobile={isMobile}
        homeMascotVideoIndex={homeMascotVideoIndex}
        onHomeMascotVideoEnded={onHomeMascotVideoEnded}
        onBookPickup={handleBookPickup}
      />
      <WhyChooseUs />
      <Gallery />

      <Testimonials />
      <BranchesSection />
    </>
  );
}

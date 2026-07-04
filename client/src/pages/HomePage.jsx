import React from "react";
import { useNavigate } from "react-router-dom";
import HomeBackgroundMedia from "../components/HomeBackgroundMedia";

import Hero from "../components/Hero";
import WhyChooseUs from "../components/WhyChooseUs";
import Gallery from "../components/Gallery";
import Testimonials from "../components/Testimonials";

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
      <HomeBackgroundMedia
        isMobile={isMobile}
        homeMascotVideoIndex={homeMascotVideoIndex}
        onHomeMascotVideoEnded={onHomeMascotVideoEnded}
      />

      <Hero onBookPickup={handleBookPickup} />
      <WhyChooseUs />
      <Gallery />

      <Testimonials />
    </>
  );
}

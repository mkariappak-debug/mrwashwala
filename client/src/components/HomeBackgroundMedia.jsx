import React from "react";
import desktopVideo from "../assets/background-video.mp4";
import mobileVideo from "../assets/mobile-background-video.mp4";

export default function HomeBackgroundMedia({
  isMobile
}) {
  return (
    <video
      key={isMobile ? "mobile" : "desktop"}
      className="site-background-video"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    >
      <source src={isMobile ? mobileVideo : desktopVideo} type="video/mp4" />
    </video>
  );
}

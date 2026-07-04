import React from "react";
import desktopVideo from "../assets/background-video.mp4";
import mobileVideo from "../assets/mobile-background-video.mp4";

const HOME_MASCOT_VIDEOS = ["/home-mascot-loop.mp4", "/home-mascot-pack.mp4"];

export default function HomeBackgroundMedia({
  isMobile,
  homeMascotVideoIndex,
  onHomeMascotVideoEnded
}) {
  return (
    <>
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
    </>
  );
}

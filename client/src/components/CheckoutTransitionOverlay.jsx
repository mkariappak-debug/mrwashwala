import React, { useEffect, useMemo, useState } from "react";
import "./CheckoutTransitionOverlay.css";

const DEFAULT_ANIMATION_DURATION_MS = 4300;

function getStage(progress) {
  if (progress < 25) {
    return {
      title: "Collecting Your Clothes",
      subtitle: "Our mascot is gathering your garments carefully.",
      stateClass: "stage-collect"
    };
  }

  if (progress < 50) {
    return {
      title: "Heading To The Wash Station",
      subtitle: "Basket secured. Moving to premium wash cycle.",
      stateClass: "stage-carry"
    };
  }

  if (progress < 80) {
    return {
      title: "Wash Cycle Started",
      subtitle: "Bubbles and care tech are now in motion.",
      stateClass: "stage-wash"
    };
  }

  if (progress < 100) {
    return {
      title: "Preparing Confirmation",
      subtitle: "Final checks before we connect you on WhatsApp.",
      stateClass: "stage-confirm"
    };
  }

  return {
    title: "Laundry Request Confirmed",
    subtitle: "Great choice. Redirecting to WhatsApp now.",
    stateClass: "stage-done"
  };
}

export default function CheckoutTransitionOverlay({
  open,
  onComplete,
  videoSrc = "/checkout-transition.mp4",
  mascotSrc = "/MrWashwala.svg"
}) {
  const [progress, setProgress] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [durationMs, setDurationMs] = useState(DEFAULT_ANIMATION_DURATION_MS);

  const stage = useMemo(() => getStage(progress), [progress]);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setIsVideoReady(false);
      setDurationMs(DEFAULT_ANIMATION_DURATION_MS);
      return;
    }

    let frameId;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(pct);

      if (pct < 100) {
        frameId = requestAnimationFrame(animate);
      } else {
        window.setTimeout(() => {
          if (typeof onComplete === "function") {
            onComplete();
          }
        }, 350);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [open, onComplete, durationMs]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="checkout-transition-overlay" role="dialog" aria-modal="true" aria-live="polite">
      <div className="checkout-transition-bg" />

      <div className="checkout-transition-card">
        <div className={`checkout-scene ${stage.stateClass}`}>
          <div className="machine-bubbles" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <video
            className={`checkout-transition-video ${isVideoReady ? "is-ready" : ""}`}
            src={videoSrc}
            autoPlay
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setIsVideoReady(true)}
            onLoadedMetadata={(e) => {
              const durationSeconds = e.currentTarget?.duration;
              if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
                const ms = Math.round(durationSeconds * 1000);
                setDurationMs(Math.max(3000, Math.min(7000, ms)));
              }
            }}
          />
        </div>

        <div className="checkout-transition-content">
          <p className="transition-kicker">Mr Washwala Express Checkout</p>
          <h3>{stage.title}</h3>
          <p>{stage.subtitle}</p>

          <div className="checkout-progress-stations" aria-hidden="true">
            <div className="progress-station station-basket">Basket</div>
            <div className="progress-station station-machine">Machine</div>
            <div className="progress-station station-check">Confirm</div>
          </div>

          <div className="checkout-progress-track" aria-hidden="true">
            <div className="checkout-progress-fill" style={{ width: `${Math.round(progress)}%` }} />
            <img
              src={mascotSrc}
              alt="Mr Washwala mascot"
              className="checkout-progress-mascot"
              loading="eager"
              decoding="async"
              style={{ left: `${Math.round(progress)}%` }}
            />
          </div>

          <div className="checkout-progress-meta">
            <span>Preparing order</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

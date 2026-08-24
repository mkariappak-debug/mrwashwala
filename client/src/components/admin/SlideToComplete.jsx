import React, { useState, useRef, useEffect } from 'react';

export default function SlideToComplete({ onComplete, isSubmitting, label = 'SLIDE TO COMPLETE', desktopLabel = 'Mark as Complete' }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const handleRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragStart = (e) => {
    if (isSubmitting || progress === 100) return;
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    if (!isDragging || isSubmitting) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const containerRect = containerRef.current.getBoundingClientRect();
    const handleWidth = handleRef.current.offsetWidth;
    
    let newX = clientX - containerRect.left - (handleWidth / 2);
    let maxDrag = containerRect.width - handleWidth;
    
    if (newX < 0) newX = 0;
    if (newX > maxDrag) newX = maxDrag;

    const newProgress = (newX / maxDrag) * 100;
    setProgress(newProgress);
  };

  const handleDragEnd = () => {
    if (!isDragging || isSubmitting) return;
    setIsDragging(false);

    if (progress >= 95) {
      setProgress(100);
      onComplete();
    } else {
      setProgress(0); // snap back
    }
  };

  // Allow clicking on desktop
  if (!isMobile) {
    return (
      <button 
        type="button"
        className={`processing-desktop-btn ${isSubmitting ? 'loading' : ''}`}
        onClick={onComplete}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Completing...' : desktopLabel}
      </button>
    );
  }

  // Slide on mobile
  return (
    <div 
      className={`processing-slide-container ${isSubmitting ? 'submitting' : ''} ${progress === 100 ? 'completed' : ''}`}
      ref={containerRef}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      <div className="processing-slide-text">{isSubmitting ? 'Completing...' : label}</div>
      <div 
        className="processing-slide-fill" 
        style={{ width: `${progress}%` }} 
      />
      <div 
        className="processing-slide-handle"
        ref={handleRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{ left: `calc(${progress}% - ${progress > 0 ? (progress/100 * 56) : 0}px)` }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </div>
  );
}

import React, { useState } from 'react';

const GALLERY_ITEMS = [
  {
    id: 1,
    image:"/gallery/normalshoe.jpg",
    title: 'shoes cleaned'
  },
  {
    id: 2,
    image:"/gallery/saree.jpg",
    title: 'Delicate saree Care'
  },
  {
    id: 3,
    image:"/gallery/jean.jpg",
    title: 'Stain Removal Service'
  },
  {
    id: 4,
    image:"/gallery/nikeshoe.jpg",
    title: 'Shoe Cleaning'
  },
  {
    id: 5,
    image:"/gallery/blanket.jpg",
    title: 'blanket Wash'
  },
  {
    id: 6,
    image:"/gallery/collection.jpg",
    title: 'Wedding Outfit'
  },
  {
    id: 7,
    images:"/gallery/sir.jpg",
    title: 'Leather Care'
  },
  {
    id: 8,
    images:"/gallery/sir.jpg",
    title: 'Curtain Cleaning'
  },
  {
    id: 9,
    images:"/gallery/sir.jpg",
    title: 'Formal Wear Service'
  },
  {
    id: 10,
    image:"/gallery/sir.jpg",
    title: 'Specialty Cleaning'
  }
];

export default function Gallery() {
  const [isHovered, setIsHovered] = useState(false);

  // Duplicate items for seamless infinite scroll
  const duplicatedItems = [...GALLERY_ITEMS, ...GALLERY_ITEMS];

  return (
    <section className="gallery-section">
      <div className="container">
        <h2 className="section-title">Our Work Speaks for Itself</h2>
        <p className="section-subtitle">Real results from real garments</p>

        <div 
          className="gallery-carousel-wrapper"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left fade gradient */}
          <div className="carousel-fade-left"></div>

          {/* Carousel container */}
          <div className={`gallery-carousel ${isHovered ? 'paused' : 'scrolling'}`}>
            {duplicatedItems.map((item, index) => (
              <div key={index} className="gallery-card">
                <div className="card-image-container">
                  <img
  src={item.image}
  alt={item.title}
  className="gallery-image"
/>
                </div>

                {/* Card Title */}
                <div className="gallery-card-title">
                  <h3>{item.title}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Right fade gradient */}
          <div className="carousel-fade-right"></div>
        </div>
      </div>
    </section>
  );
}

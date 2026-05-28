import React from 'react';

const SERVICES_DATA = [
  {
    id: 'wash-fold',
    name: 'Wash & Fold',
    unit: 'kg',
    price: 49,
    features: ['Professional washing', 'Gentle drying', 'Neat folding'],
    featured: false
  },
  {
    id: 'dry-cleaning',
    name: 'Dry Cleaning',
    unit: 'item',
    price: 39,
    features: ['Delicate care', 'Stain removal', 'Professional pressing'],
    featured: true
  },
  {
    id: 'premium-bedding',
    name: 'Premium Bedding',
    unit: 'set',
    price: 129,
    features: ['Deep cleaning', 'Fabric care', 'Fresh delivery'],
    featured: false
  },
  {
    id: 'steam-press',
    name: 'Steam Press',
    unit: 'item',
    price: 79,
    features: ['Professional pressing', 'Crease removal', 'Perfect finish'],
    featured: false
  },
  {
    id: 'shoe-cleaning',
    name: 'Shoe Cleaning',
    unit: 'pair',
    price: 125,
    features: ['Deep cleaning', 'Protective coating', 'Like new look'],
    featured: false
  }
];

export default function Pricing({ cart, onUpdateQuantity }) {
  return (
    <section id="pricing" className="pricing-section">
      <div className="container">
        <h2 className="section-title">Our Premium Services & Pricing</h2>
        <p className="section-subtitle">Transparent pricing with no hidden charges</p>

        <div className="pricing-grid">
          {SERVICES_DATA.map((service, i) => {
            const cartItem = cart.find((item) => item.name === service.name);
            const quantity = cartItem ? cartItem.quantity : 0;
            const delay = i * 100;

            return (
              <div
                key={service.id}
                className={`pricing-card ${service.featured ? 'featured' : ''}`}
                data-aos="zoom-in"
                data-aos-delay={delay}
              >
                {service.featured && <div className="featured-badge">Popular</div>}
                <h3>{service.name}</h3>
                <p className="pricing-unit">per {service.unit}</p>
                <p className="pricing-amount">₹{service.price}</p>
                <ul className="pricing-features">
                  {service.features.map((feature, idx) => (
                    <li key={idx}>✓ {feature}</li>
                  ))}
                </ul>
                <div className="btn-container">
                  {quantity === 0 ? (
                    <button
                      className="btn btn-primary add-btn"
                      onClick={() => onUpdateQuantity(service.name, 1, service.price, service.unit)}
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div className="quantity-control">
                      <button
                        className="qty-decrease"
                        onClick={() => onUpdateQuantity(service.name, quantity - 1, service.price, service.unit)}
                      >
                        −
                      </button>
                      <span className="qty-display">{quantity}</span>
                      <button
                        className="qty-increase"
                        onClick={() => onUpdateQuantity(service.name, quantity + 1, service.price, service.unit)}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
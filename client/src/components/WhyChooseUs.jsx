import React from 'react';

const BENEFITS = [
  {
    icon: '⚡',
    title: 'Lightning-Fast Service',
    desc: 'Same-day pickup and delivery at your doorstep in under 2 hours. We understand your busy schedule and make laundry hassle-free. No waiting, no delays—just fresh, clean clothes delivered exactly when you need them.'
  },
  {
    icon: '✨',
    title: 'Premium Quality Guarantee',
    desc: 'ISO-certified facilities with state-of-the-art equipment ensure impeccable care. Every garment is treated with expert precision and attention to detail. Our trained professionals use premium fabrics-safe products to preserve the quality and longevity of your clothes.'
  },
  {
    icon: '🛡️',
    title: 'Trusted & Transparent',
    desc: 'Zero hidden charges. Upfront pricing, real-time order tracking, and 100% customer satisfaction guarantee on all services. We believe in complete transparency—know exactly what you\'re paying for and track your order at every step.'
  },
  {
    icon: '👑',
    title: 'Premium Experience',
    desc: 'Your clothes deserve luxury treatment. We use premium fabrics care products and handle delicates with white-glove service standards. From silk to wool, from formal wear to everyday comfort—everything gets the premium care it deserves.'
  },
  {
    icon: '🌍',
    title: 'Eco-Friendly Practices',
    desc: 'We\'re committed to sustainability with eco-friendly detergents and water-conservation techniques. Enjoy premium laundry services while caring for the environment—clean clothes and a clean planet.'
  }
];

export default function WhyChooseUs() {
  return (
    <section className="why-choose-section">
      <div className="container">
        <h2 className="section-title">Why Choose Mr. WashWala?</h2>
        <p className="section-subtitle">Experience premium laundry service excellence with our commitment to quality</p>

        <div className="why-choose-intro" data-aos="fade-up">
          <p>
            Mr. WashWala is Mysuru's most trusted laundry service, combining years of expertise with cutting-edge
            technology and a passionate team dedicated to perfection. We've earned the trust of thousands of
            customers across the city by delivering exceptional quality, lightning-fast service, and transparent
            pricing that no other provider can match. Every garment receives premium care with eco-friendly
            practices, making us not just the best choice for your clothes, but also for the environment.
          </p>
        </div>

        <div className="why-choose-grid">
          {BENEFITS.map((benefit, i) => (
            <div key={i} className="why-card" data-aos="fade-right" data-aos-delay={i * 100}>
              <div className="why-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
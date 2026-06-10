import React from 'react';

const FEEDBACKS = [
  {
    stars: 5,
    text: '"Mr. WashWala provides exceptional laundry service! My clothes always come back fresh and perfectly folded. Highly recommended!"',
    author: 'Rajesh Kumar',
    status: 'Verified Customer'
  },
  {
    stars: 5,
    text: '"Same-day delivery is a game changer! I no longer have to worry about running out of neat business shirts. Keep up the great work!"',
    author: 'Priya Sharma',
    status: 'Verified Customer'
  },
  {
    stars: 5,
    text: '"Best laundry service in Mysuru. Professional, affordable, and reliable. I\'ve been using them for 6 months!"',
    author: 'Amit Patel',
    status: 'Verified Customer'
  },
  {
    stars: 5,
    text: '"Their shoe cleaning service is outstanding! My sneakers look brand new. Definitely worth trying!"',
    author: 'Sneha Desai',
    status: 'Verified Customer'
  }
];

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="container">
        <h2 className="section-title">What Our Customers Say</h2>
        <p className="section-subtitle">Real feedback from our premium service subscribers</p>

        <div className="testimonials-carousel">
          {FEEDBACKS.map((f, i) => (
            <div key={i} className="testimonial-card" data-aos="zoom-in" data-aos-delay={i * 100}>
              <div className="stars">
                {'★'.repeat(f.stars)}
              </div>
              <p className="testimonial-text">{f.text}</p>
              <div className="testimonial-author">
                <h4>{f.author}</h4>
                <p>{f.status}</p>
              </div>
            </div>
          ))}
          
          {/* Google Reviews Card */}
          <a 
            href="https://www.google.com/maps/place/Mr.+Wash+Wala/@12.3418468,76.6119963,17z/data=!4m8!3m7!1s0x3baf7bb24121a2bb:0xfa784c6c8d775294!8m2!3d12.3418468!4d76.6145712!9m1!1b1!16s%2Fg%2F11n54qm_kk?entry=ttu&g_ep=EgoyMDI2MDYwMy4xIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="testimonial-card google-reviews-card"
            data-aos="zoom-in"
            data-aos-delay={FEEDBACKS.length * 100}
          >
            <div className="google-reviews-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#27187E" strokeWidth="2"/>
                <path d="M8 12L11 15L16 8" stroke="#27187E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>Check Out Our Google Reviews</h3>
              <p>See what customers say on Google Maps</p>
              <div className="google-stars">
                {'★'.repeat(5)}
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
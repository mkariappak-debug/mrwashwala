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
        </div>
      </div>
    </section>
  );
}
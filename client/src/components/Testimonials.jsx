import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const FEEDBACKS = [
  {
    stars: '★★★★★',
    text: '"Mr. WashWala provides exceptional laundry service! My clothes always come back fresh and perfectly folded. Highly recommended!"',
    author: 'Rajesh Kumar',
    status: 'Verified Customer'
  },
  {
    stars: '★★★★★',
    text: '"Same-day delivery is a game changer! I no longer have to worry about running out of neat business shirts. Keep up the great work!"',
    author: 'Priya Sharma',
    status: 'Verified Customer'
  },
  {
    stars: '★★★★★',
    text: '"Best laundry service in Mysuru. Professional, affordable, and reliable. I\'ve been using them for 6 months!"',
    author: 'Amit Patel',
    status: 'Verified Customer'
  },
  {
    stars: '★★★★★',
    text: '"Their shoe cleaning service is outstanding! My sneakers look brand new. Definitely worth trying!"',
    author: 'Sneha Desai',
    status: 'Verified Customer'
  }
];

export default function Testimonials() {
  return (
    <section className="py-14">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-center text-white mb-6">What Our Customers Say</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEEDBACKS.map((f, i) => (
            <div key={i} className="bg-white/5 p-5 rounded-lg shadow-sm text-white">
              <div className="stars flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <FontAwesomeIcon key={idx} icon={faStar} className="text-amber-400 text-base" />
                ))}
              </div>
              <p className="mt-2 text-sm text-white/85">{f.text}</p>
              <div className="testimonial-author">
                <h4 className="font-semibold mt-3">{f.author}</h4>
                <p>{f.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
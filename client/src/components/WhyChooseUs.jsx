import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faGlobe, faHeart, faAward } from '@fortawesome/free-solid-svg-icons';

const BENEFITS = [
  { icon: faTruck, title: 'Reliable Pickup & Delivery', desc: 'On-time pickups and express same-day delivery options for urgent needs.' },
  { icon: faGlobe, title: 'Eco-Friendly Practices', desc: 'We use biodegradable detergents and water-saving processes to reduce environmental impact.' },
  { icon: faHeart, title: 'Exceptional Customer Care', desc: 'Quick support via WhatsApp, phone, and email with a friendly, responsive team.' },
  { icon: faAward, title: 'Premium Quality', desc: 'Expert garment care including dry-cleaning and gentle handling for delicate items.' },
];

export default function WhyChooseUs() {
  return (
    <section className="py-14">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-center text-white mb-6">Why Choose Mr. WashWala?</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b, i) => (
            <div key={i} className="bg-white/5 p-5 rounded-lg text-white">
              <div className="text-2xl"><FontAwesomeIcon icon={b.icon} className="text-3xl" /></div>
              <h3 className="font-semibold mt-3">{b.title}</h3>
              <p className="text-sm mt-2 text-white/85">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
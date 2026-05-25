import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

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
    <section id="pricing" className="py-14">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-center text-white">Our Premium Services & Pricing</h2>
        <p className="text-center text-white/90 mt-2">Transparent pricing with no hidden charges</p>

        <div className="grid gap-6 mt-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES_DATA.map((service) => {
            const cartItem = cart.find(item => item.name === service.name);
            const quantity = cartItem ? cartItem.quantity : 0;

            return (
              <div key={service.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 flex flex-col justify-between shadow-lg">
                {service.featured && <div className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold ml-auto">Popular</div>}
                <div>
                  <h3 className="text-xl font-bold text-white mt-4">{service.name}</h3>
                  <p className="text-sm text-white/80 mt-1">per {service.unit}</p>
                  <p className="text-2xl font-extrabold text-white mt-4">₹{service.price}</p>
                  <ul className="text-white/85 mt-4 space-y-1">
                    {service.features.map((feature, index) => (
                      <li key={index}><FontAwesomeIcon icon={faCheck} className="text-amber-400 text-base mr-2" />{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  {quantity === 0 ? (
                    <button className="w-full bg-gradient-to-r from-accent to-blue-500 text-white font-semibold px-4 py-2 rounded-lg" onClick={() => onUpdateQuantity(service.name, 1, service.price, service.unit)}>Add to Cart</button>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <button className="px-3 py-1 bg-white/10 rounded" onClick={() => onUpdateQuantity(service.name, quantity - 1, service.price, service.unit)}>−</button>
                      <span className="px-3 py-1 bg-white/5 rounded">{quantity}</span>
                      <button className="px-3 py-1 bg-white/10 rounded" onClick={() => onUpdateQuantity(service.name, quantity + 1, service.price, service.unit)}>+</button>
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
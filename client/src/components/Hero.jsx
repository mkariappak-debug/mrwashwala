import React from 'react';

export default function Hero({ onBookPickup, onViewServices }) {
  return (
    <section id="home" className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <div id="canvas-hero" className="absolute inset-0 bg-transparent -z-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white/60 to-transparent blur-xl -z-10" />

      <div className="relative z-20 text-center text-white p-10 max-w-3xl mt-16">
        <h1 className="font-extrabold text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight drop-shadow-lg">Fresh Clothes Delivered to Your Doorstep</h1>
        <p className="mt-4 text-lg md:text-xl text-white/95 font-medium">Fast, Premium Laundry and Dry Cleaning at Your Doorstep across Mysuru</p>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <button onClick={onBookPickup} className="bg-gradient-to-r from-accent to-blue-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:translate-y-[-2px] transition-transform">Book Pickup</button>
          <button onClick={onViewServices} className="border border-white/20 text-white px-5 py-3 rounded-lg font-semibold hover:bg-white/10 transition">View Services</button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white z-20 cursor-pointer animate-bounce" onClick={onViewServices}>
        <span className="block">Scroll to explore</span>
        <span className="block text-2xl">↓</span>
      </div>
    </section>
  );
}
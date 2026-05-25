import React from 'react';

export default function Footer() {
  return (
    <footer className="py-8 mt-12 bg-transparent">
      <div className="max-w-[1100px] mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
        <div>
          <h3 className="font-bold text-xl">Mr. WashWala</h3>
          <p className="text-sm mt-2">Premium laundry & dry cleaning across Mysuru</p>
        </div>

        <div>
          <h4 className="font-semibold">Quick Links</h4>
          <ul className="mt-2 space-y-1">
            <li><a href="#home">Home</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Contact</h4>
          <p className="mt-2">+91 12345 67890</p>
          <p>support@washwala.com</p>
          <div className="mt-3 flex gap-3">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white/90">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white/90">Facebook</a>
          </div>
        </div>
      </div>
      <div className="text-center text-sm text-white/70 mt-8">© {new Date().getFullYear()} Mr. WashWala. All rights reserved.</div>
    </footer>
  );
  }

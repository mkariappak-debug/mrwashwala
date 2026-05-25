// src/App.jsx
import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import WhyChooseUs from "./components/WhyChooseUs";
import Pricing from "./components/Pricing";
import Cart from "./components/Cart";
import Testimonials from "./components/Testimonials";
import CheckoutModal from "./components/CheckoutModal";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

// Note: Ensure your global configurations, resets, and typography imports live here:
import "./index.css";

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    // lazy-load animation init to keep first paint fast
    import('./animations').then(mod => {
      try {
        mod.default();
      } catch (e) {
        // ignore
      }
    });
  }, []);

  // persist cart to localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('mrwashwala_cart');
      if (raw) setCart(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('mrwashwala_cart', JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  const handleUpdateQuantity = (name, quantity, price, unit) => {
    setCart((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.name !== name);
      const exists = prev.find((i) => i.name === name);
      if (exists) return prev.map((i) => (i.name === name ? { ...i, quantity } : i));
      return [...prev, { name, price, unit, quantity }];
    });
  };

  const handleRemoveItem = (name) => setCart((prev) => prev.filter((i) => i.name !== name));
  const handleCheckout = () => alert("Checkout not implemented in local preview");

  const openCheckout = () => setIsCheckoutOpen(true);
  const closeCheckout = () => setIsCheckoutOpen(false);

  const handleBookPickup = () => {
    const el = document.getElementById('cart');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleViewServices = () => {
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="app-layout-container">
      <Header cartCount={cart.reduce((s, i) => s + i.quantity, 0)} />

      <Hero onBookPickup={handleBookPickup} onViewServices={handleViewServices} />

      <WhyChooseUs />

      <Pricing cart={cart} onUpdateQuantity={handleUpdateQuantity} />

      <Cart cart={cart} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} onCheckout={openCheckout} />

      <Testimonials />

      <CheckoutModal open={isCheckoutOpen} cart={cart} onClose={closeCheckout} />

      <Contact />

      <Footer />
    </div>
  );
}
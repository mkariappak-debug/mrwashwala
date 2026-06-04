import bgVideo from "./assets/background-video.mp4";
import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import WhyChooseUs from "./components/WhyChooseUs";
import Pricing from "./components/Pricing";
import CustomizeSidebar from "./components/CustomizeSidebar";
import Cart from "./components/Cart";
import Testimonials from "./components/Testimonials";
import CheckoutModal from "./components/CheckoutModal";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import Franchise from "./components/Franchise";

import "./index.css";
import "./styles.css";

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  useEffect(() => {
    import("./animations")
      .then((mod) => {
        try {
          mod?.default?.();
        } catch (e) {
          console.log(e);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mrwashwala_cart");
      if (raw) {
        setCart(JSON.parse(raw));
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "mrwashwala_cart",
        JSON.stringify(cart)
      );
    } catch (e) {
      console.log(e);
    }
  }, [cart]);

  const handleUpdateQuantity = (
    name,
    quantity,
    price,
    unit
  ) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter(
          (item) => item.name !== name
        );
      }

      const exists = prev.find(
        (item) => item.name === name
      );

      if (exists) {
        return prev.map((item) =>
          item.name === name
            ? { ...item, quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          name,
          quantity,
          price,
          unit
        }
      ];
    });
  };

  const handleRemoveItem = (name) => {
    setCart((prev) =>
      prev.filter((item) => item.name !== name)
    );
  };
  const openCheckout = () => {
  console.log("OPEN CHECKOUT CLICKED");
  setIsCheckoutOpen(true);
};

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const openCustomize = () => {
    setIsCustomizeOpen(true);
  };

  const closeCustomize = () => {
    setIsCustomizeOpen(false);
  };


  const handleBookPickup = () => {
  const el = document.getElementById("pricing");

  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
};

  const handleViewServices = () => {
    const el = document.getElementById("pricing");

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

      return (
  <div className="app-layout-container">

    <video
      className="site-background-video"
      autoPlay
      muted
      loop
      playsInline
    >
      <source src={bgVideo} type="video/mp4" />
    </video>

      <Header
        cartCount={cart.reduce(
          (sum, item) => sum + item.quantity,
          0
        )}
      />

      <Hero
        onBookPickup={handleBookPickup}
        onViewServices={handleViewServices}
      />

      <WhyChooseUs />

      <Pricing
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onCustomize={openCustomize}
      />

      <CustomizeSidebar
        isOpen={isCustomizeOpen}
        onClose={closeCustomize}
        onUpdateQuantity={handleUpdateQuantity}
        cart={cart}
      />
      




      <Cart
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={openCheckout}
      />

      <Testimonials />

      <CheckoutModal
        open={isCheckoutOpen}
        cart={cart}
        onClose={closeCheckout}
      />

      <Contact />
       <Franchise/>
      <Footer />
      <WhatsAppButton />

    </div>
  );
}
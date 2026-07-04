import { Routes, Route } from "react-router-dom";
import FranchiseBrochure from "./pages/FranchiseBrochure";
import Branches from "./pages/Branches";
import BranchDetails from "./pages/BranchDetails";
import desktopVideo from "./assets/background-video.mp4";
import mobileVideo from "./assets/mobile-background-video.mp4";
import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import WhyChooseUs from "./components/WhyChooseUs";
import Pricing from "./components/Pricing";
import CustomizeSidebar from "./components/CustomizeSidebar";
import Cart from "./components/Cart";
import Testimonials from "./components/Testimonials";
import Gallery from "./components/Gallery";
import CheckoutModal from "./components/CheckoutModal";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FranchiseButton from "./components/FranchiseButton";
import WhatsAppButton from "./components/WhatsAppButton";
import CallButton from "./components/CallButton";
import EmailButton from "./components/EmailButton";
import Franchise from "./components/Franchise";

import "./index.css";
import "./styles.css";

const HOME_MASCOT_VIDEOS = ["/home-mascot-loop.mp4", "/home-mascot-pack.mp4"];

export default function App() {
 const [cart, setCart] = useState([]);
const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
const [homeMascotVideoIndex, setHomeMascotVideoIndex] = useState(0);
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
  useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);

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

    const handleHomeMascotVideoEnded = () => {
      setHomeMascotVideoIndex((prev) => (prev + 1) % HOME_MASCOT_VIDEOS.length);
    };

     return (
  <Routes>
    <Route
      path="/franchise-brochure"
      element={<FranchiseBrochure />}
    />

    <Route
      path="/branches"
      element={
        <div className="app-layout-container subpage-layout">
          <Header cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
          <Branches />
          <Footer />
          <WhatsAppButton />
          <CallButton />
          <EmailButton />
        </div>
      }
    />

    <Route
      path="/branches/:branchId"
      element={
        <div className="app-layout-container subpage-layout">
          <Header cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
          <BranchDetails />
          <Footer />
          <WhatsAppButton />
          <CallButton />
          <EmailButton />
        </div>
      }
    />

    <Route
      path="/"
      element={
        <div className="app-layout-container">
  <video
  key={isMobile ? 'mobile' : 'desktop'}
  className="site-background-video"
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
>
  <source
    src={isMobile ? mobileVideo : desktopVideo}
    type="video/mp4"
  />
</video>

<video
  key={HOME_MASCOT_VIDEOS[homeMascotVideoIndex]}
  className="home-mascot-loop-video"
  autoPlay
  muted
  playsInline
  preload="auto"
  aria-hidden="true"
  onEnded={handleHomeMascotVideoEnded}
>
  <source
    src={HOME_MASCOT_VIDEOS[homeMascotVideoIndex]}
    type="video/mp4"
  />
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

      <Gallery />

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
          <Franchise />
          <Footer />
          <WhatsAppButton />
          <FranchiseButton />
          <CallButton />
          <EmailButton />
        </div>
      }
    />
  </Routes>
);
}
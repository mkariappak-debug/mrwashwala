import { Routes, Route, Navigate } from "react-router-dom";
import FranchiseBrochure from "./pages/FranchiseBrochure";
import Branches from "./pages/Branches";
import BranchDetails from "./pages/BranchDetails";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import FranchisePage from "./pages/FranchisePage";
import ContactPage from "./pages/ContactPage";
import SiteLayout from "./layouts/SiteLayout";
import React, { useState, useEffect } from "react";

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


  const handleHomeMascotVideoEnded = () => {
    setHomeMascotVideoIndex((prev) => (prev + 1) % HOME_MASCOT_VIDEOS.length);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const renderHome = () => (
    <SiteLayout cartCount={cartCount} showFranchiseButton>
      <HomePage
        isMobile={isMobile}
        homeMascotVideoIndex={homeMascotVideoIndex}
        onHomeMascotVideoEnded={handleHomeMascotVideoEnded}
      />
    </SiteLayout>
  );

  return (
    <Routes>
      <Route path="/franchise-brochure" element={<FranchiseBrochure />} />

      <Route
        path="/branches"
        element={
          <SiteLayout cartCount={cartCount} className="subpage-layout">
            <Branches />
          </SiteLayout>
        }
      />

      <Route
        path="/branches/:branchId"
        element={
          <SiteLayout cartCount={cartCount} className="subpage-layout">
            <BranchDetails />
          </SiteLayout>
        }
      />

      <Route path="/" element={renderHome()} />
      <Route path="/home" element={renderHome()} />

      <Route
        path="/services"
        element={
          <SiteLayout
            cartCount={cartCount}
            showHomeBackground
            isMobile={isMobile}
            homeMascotVideoIndex={homeMascotVideoIndex}
            onHomeMascotVideoEnded={handleHomeMascotVideoEnded}
          >
            <ServicesPage
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              isCustomizeOpen={isCustomizeOpen}
              onOpenCustomize={openCustomize}
              onCloseCustomize={closeCustomize}
              onRemoveItem={handleRemoveItem}
              onOpenCheckout={openCheckout}
              isCheckoutOpen={isCheckoutOpen}
              onCloseCheckout={closeCheckout}
            />
          </SiteLayout>
        }
      />

      <Route path="/cart" element={<Navigate to="/services" replace />} />

      <Route
        path="/franchise"
        element={
          <SiteLayout
            cartCount={cartCount}
            showHomeBackground
            isMobile={isMobile}
            homeMascotVideoIndex={homeMascotVideoIndex}
            onHomeMascotVideoEnded={handleHomeMascotVideoEnded}
          >
            <FranchisePage />
          </SiteLayout>
        }
      />

      <Route
        path="/contact"
        element={
          <SiteLayout
            cartCount={cartCount}
            showHomeBackground
            isMobile={isMobile}
            homeMascotVideoIndex={homeMascotVideoIndex}
            onHomeMascotVideoEnded={handleHomeMascotVideoEnded}
          >
            <ContactPage />
          </SiteLayout>
        }
      />

      <Route path="/address" element={<Navigate to="/contact#address" replace />} />

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
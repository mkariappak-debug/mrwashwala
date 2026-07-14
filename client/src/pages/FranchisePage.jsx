import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Franchise from "../components/Franchise";

export default function FranchisePage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.state?.scrollToFranchiseEnquiry) {
      return;
    }

    const scrollTarget = window.setTimeout(() => {
      document.getElementById("franchise-enquiry")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);

    window.history.replaceState({}, document.title, window.location.pathname);

    return () => {
      window.clearTimeout(scrollTarget);
    };
  }, [location.state]);

  return <Franchise />;
}

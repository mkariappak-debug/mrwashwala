import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function FranchiseButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("mrwashwala:close-branch-drawer"));

    if (location.pathname !== "/franchise") {
      navigate("/franchise", { state: { scrollToFranchiseEnquiry: true } });
      return;
    }

    const section = document.getElementById("franchise-enquiry");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <button
      type="button"
      className="franchise-floating-btn"
      onClick={handleClick}
      aria-label="Franchise Opportunity"
    >
      <img
        src="/MrWashwala.svg"
        alt=""
        className="franchise-floating-icon"
        loading="eager"
        decoding="async"
        aria-hidden="true"
      />
      <span>Franchise</span>
    </button>
  );
}
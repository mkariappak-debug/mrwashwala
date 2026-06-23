import React from "react";

export default function FranchiseButton() {
  const handleClick = () => {
    const section = document.getElementById("download-brochure");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <button
      className="franchise-floating-btn"
      onClick={handleClick}
      aria-label="Franchise Opportunity"
    >
      🚀 Franchise
    </button>
  );
}
import React, { useState } from "react";

export default function FranchiseBrochure() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Later you can save to backend here

    const link = document.createElement("a");
    link.href = "/Brochure/Mr_WashWala_Brochure.pdf";
    link.download = "Mr_WashWala_Brochure.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("Thank you! Your brochure download has started.");
  };

  return (
    <div className="brochure-page">
      <div className="brochure-card">
        <h1>Download Franchise Brochure</h1>

        <p>
          Learn about investment plans, revenue projections,
          operational support, training, branding support and
          growth opportunities with Mr. WashWala.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name *"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number *"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address (Optional)"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="city"
            placeholder="City (Optional)"
            value={formData.city}
            onChange={handleChange}
          />

          <button type="submit">
            Submit & Download Brochure
          </button>
        </form>
      </div>
    </div>
  );
}
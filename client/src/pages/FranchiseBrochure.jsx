import "./FranchiseBrochure.css";
import React, { useState } from "react";

export default function FranchiseBrochure() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Please enter your phone number");
      return;
    }

    setLoading(true);

    try {
        const response = await fetch(
      "https://mrwashwala-server.onrender.com/api/franchise-leads",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save lead information"
        );
      }

      const link = document.createElement("a");
      link.href = "/Brochure/Mr_WashWala_Brochure.pdf";
      link.download = "Mr_WashWala_Brochure.pdf";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Thank you! Your brochure download has started.");

      setFormData({
        name: "",
        phone: "",
        email: "",
        city: "",
      });
    } catch (error) {
      console.error("Brochure Lead Error:", error);

      alert(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
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

       <div className="franchise-features">
  <div>✓ Low Investment</div>
  <div>✓ High ROI</div>
  <div>✓ Training Support</div>
  <div>✓ Marketing Support</div>
</div>
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

          <button
            type="submit"
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? "Submitting..."
              : "Submit & Download Brochure"}
          </button>
        </form>
      </div>
    </div>
  );
}
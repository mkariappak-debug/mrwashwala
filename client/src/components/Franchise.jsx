import React from "react";
import { Link } from "react-router-dom";

const franchiseData = [
  {
    title: "Express Kiosk",
    area: "180–250 sq. ft.",
    investment: "₹14 Lakhs",
    revenue: "approx ₹2Lakhs(after 6 months)",
    share: "70:30",
    roi: "12 Months",
  },
  {
    title: "Standard Outlet",
    area: "180–250 sq. ft.",
    investment: "₹18 Lakhs",
    revenue: "approx ₹3Lakhs(after 6 months)",
    share: "70:30",
    roi: "18 Months",
  },
  {
    title: "Premium Center",
    area: "180–250 sq. ft.",
    investment: "₹24 Lakhs",
    revenue: "approx ₹4Lakhs(after 6 months)",
    share: "70:30",
    roi: "18 Months",
  },
];

export default function Franchise() {
  return (
    <section id="franchise" className="franchise-section">
      <div className="container">
        <h2 className="franchise-title">
          Own a <span className="franchise-mr">Mr.</span>{" "}
          <span className="franchise-washwala">WashWala</span> Franchise
        </h2>

        <p className="section-subtitle">
          Join our growing laundry network and build a successful business with
          our proven franchise model.
        </p>

        <div className="franchise-grid-new">
          {franchiseData.map((item, index) => (
            <div className="franchise-card-new" key={index}>
              <div className="franchise-card-header">
                <h3>{item.title}</h3>
              </div>

              <div className="franchise-card-body">
                <div className="info-row">
                  <span>Area Required</span>
                  <strong>{item.area}</strong>
                </div>

                <div className="info-row">
                  <span>Investment</span>
                  <strong>{item.investment}</strong>
                </div>

                <div className="info-row">
                  <span>Estimated Monthly Revenue</span>
                  <strong>{item.revenue}</strong>
                </div>

                <div className="info-row">
                  <span>Revenue Share</span>
                  <strong>{item.share}</strong>
                </div>

                <div className="info-row">
                  <span>Estimated ROI</span>
                  <strong>{item.roi}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="franchise-benefits">
          <h3>What's Included with Every Franchise</h3>

          <div className="benefits-grid">
            <div className="benefit-item">
              ✓ Premium imported commercial equipment from South Korea (LG
              Commercial) and Germany
            </div>

            <div className="benefit-item">
              ✓ 24×7 Technical Assistance
            </div>

            <div className="benefit-item">
              ✓ Complete Operational & Staff Training
            </div>

            <div className="benefit-item">
              ✓ Marketing & Branding Support
            </div>
          </div>
        </div>

        <div className="franchise-buttons">
          <a
            href="https://wa.me/917019436720"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary franchise-btn"
            id="franchise-enquiry"
          >
            Enquire About Franchise
          </a>
<Link
  to="/franchise-brochure"
  id="download-brochure"
  className="btn brochure-btn"
>
  📄 Download Franchise Brochure
</Link>
        </div>
      </div>
    </section>
  );
}

import React, { useEffect, useState, useRef } from "react";
import API from "../api/api";

export default function Pricing({
  cart,
  onUpdateQuantity,
  onCustomize
}) {
  const [servicesList, setServicesList] = useState([]);
  const pricingRef = useRef(null);
  const getServiceImage = (serviceName) => {
  const images = {
    "Wash & Fold": "/pricing/fold.jpg",
    "Wash & Iron": "/pricing/shoe.jpg",
    "Dry Cleaning": "/pricing/dry.jpg",
    "Shoes Cleaning": "/pricing/iron.jpg",
    "Blanket Cleaning": "/pricing/bedsheet.jpg",
    "Customize Your Service": "/pricing/wash.jpg"
  };
  return images[serviceName] || "/pricing/fold.jpg";
};

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await API.get("/api/services", {
        params: { displayType: 'main' }
      });

      setServicesList([
        ...response.data,
        {
          _id: "custom-service",
          name: "Customize Your Service",
          unit: "package",
          price: "Custom",
          features: [
            "Choose your own services",
            "Flexible pricing",
            "Tailored to your needs"
          ],
          featured: false
        }
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  const scrollLeft = () => {
    pricingRef.current?.scrollBy({
      left: -350,
      behavior: "smooth"
    });
  };

  const scrollRight = () => {
    pricingRef.current?.scrollBy({
      left: 350,
      behavior: "smooth"
    });
  };

  return (
    <section id="pricing" className="pricing-section">
      <div className="container">

      <h2 className="section-title white-bg-heading">
  <span className="services-our">Our</span> <span className="services-premium">Premium</span> <span className="services-services">Services</span>
</h2>
      

        <p className="section-subtitle white-bg-subtitle">
          Transparent pricing with no hidden charges
        </p>

        <div className="pricing-slider-wrapper">

          <button
            className="pricing-arrow left"
            onClick={scrollLeft}
          >
            ←
          </button>

          <div
            className="pricing-grid"
            ref={pricingRef}
          >

            {servicesList.map((service, i) => {
              const cartItem = cart.find(
                (item) => item.name === service.name
              );

              const quantity = cartItem
                ? cartItem.quantity
                : 0;

              const delay = i * 100;
              console.log(service.name);

              return (
                <div
                  key={service._id}
                  className={`pricing-card ${
                    service.featured
                      ? "featured"
                      : ""
                  }`}
                  data-aos="zoom-in"
                  data-aos-delay={delay}
                >
                  {service.featured && (
                    <div className="featured-badge">
                      Popular
                    </div>
                  )}

                  <div className="card-image">
  <img
    src={getServiceImage(service.name)}
    alt={service.name}
  />
</div>

<h3>{service.name}</h3>

                  <p className="pricing-unit">
                    per {service.unit}
                  </p>

                  {service._id !==
                    "custom-service" && (
                    <p className="pricing-amount">
                      ₹{service.price}
                    </p>
                  )}

                  <ul className="pricing-features">
                    {(service.features || []).map(
                      (feature, idx) => (
                        <li key={idx}>
                          ✓ {feature}
                        </li>
                      )
                    )}
                  </ul>

                  <div className="btn-container">

                    {service._id ===
                    "custom-service" ? (
                      <button
                        className="btn btn-primary customize-btn"
                        onClick={onCustomize}
                      >
                        Customize Your Service
                      </button>
                    ) : quantity === 0 ? (
                      <button
                        className="btn btn-primary add-btn"
                        onClick={() =>
                          onUpdateQuantity(
                            service.name,
                            1,
                            service.price,
                            service.unit
                          )
                        }
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <div className="quantity-control">

                        <button
                          className="qty-decrease"
                          onClick={() =>
                            onUpdateQuantity(
                              service.name,
                              quantity - 1,
                              service.price,
                              service.unit
                            )
                          }
                        >
                          −
                        </button>

                        <span className="qty-display">
                          {quantity}
                        </span>

                        <button
                          className="qty-increase"
                          onClick={() =>
                            onUpdateQuantity(
                              service.name,
                              quantity + 1,
                              service.price,
                              service.unit
                            )
                          }
                        >
                          +
                        </button>

                      </div>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

          <button
            className="pricing-arrow right"
            onClick={scrollRight}
          >
            →
          </button>

        </div>

      </div>
    </section>
  );
}

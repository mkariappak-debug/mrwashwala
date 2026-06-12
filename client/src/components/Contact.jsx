import React from 'react';

export default function Contact() {
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="contact-title-box">
          <h2 className="section-title white-bg-heading">Get In Touch</h2>
        </div>

        <div className="contact-subtitle-box">
          <p className="section-subtitle white-bg-subtitle">
            We are always here to help you with your laundry needs
          </p>
        </div>

        <div className="contact-wrapper">
          <div className="contact-info">
            {/* Phone */}
            <div className="contact-card" data-aos="fade-right">
              <h3>📞 Phone</h3>
              <p>
                <a href="tel:7019436720">+91 7019436720</a>
              </p>
              <div className="contact-label">Available everyday</div>
            </div>

            {/* WhatsApp */}
            <div
              className="contact-card whatsapp-card"
              data-aos="fade-right"
              data-aos-delay="100"
            >
              <h3>💬 WhatsApp</h3>
              <p>
                <a
                  href="https://wa.me/7019436720?text=Hi%20Mr.%20WashWala%2C%20I%20want%20to%20know%20about%20your%20services"
                  target="_blank"
                  rel="noreferrer"
                >
                  Chat with us
                </a>
              </p>
              <div className="contact-label">
                Quick responses guaranteed
              </div>
            </div>

            {/* Email */}
            <div
              className="contact-card"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              <h3>✉️ Email</h3>
              <p>
                <a href="mailto:mrwashwala@gmail.com">
                  mrwashwala@gmail.com
                </a>
              </p>
              <div className="contact-label">
                We'll reply within 24 hours
              </div>
            </div>

            {/* Invisible scroll target for navbar Address link */}
            <div id="address"></div>

            {/* Address */}
            <div
              className="contact-card"
              data-aos="fade-right"
              data-aos-delay="300"
            >
              <h3>📍 Address</h3>
              <p>
                12 Vani Vilas Layout
                <br />
                Vijaynagar, Mysuru
                <br />
                Karnataka - 570017
              </p>
              <div className="contact-label">
                Open everyday 9 AM - 8 PM
              </div>
            </div>
          </div>

          {/* Google Map */}
          <div className="map-container" data-aos="fade-left">
            <iframe
              title="Mr. WashWala location"
              src="https://maps.google.com/maps?q=12%20Vani%20Vilas%20Layout%20Mysuru%20Vijaynagar&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
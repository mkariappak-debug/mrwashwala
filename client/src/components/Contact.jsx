import React from 'react';

export default function Contact() {
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <h2 className="section-title">Get in Touch</h2>
        <p className="section-subtitle">We are always here to help you with your laundry needs</p>

        <div className="contact-wrapper">
          <div className="contact-info">
            <div className="contact-card" data-aos="fade-right">
              <h3>📞 Phone</h3>
              <p>
                <a href="tel:8867295898">+91 8867295898</a>
              </p>
              <div className="contact-label">Available everyday</div>
            </div>

            <div className="contact-card whatsapp-card" data-aos="fade-right" data-aos-delay="100">
              <h3>💬 WhatsApp</h3>
              <p>
                <a
                  href="https://wa.me/918867295898?text=Hi%20Mr.%20WashWala%2C%20I%20want%20to%20know%20about%20your%20services"
                  target="_blank"
                  rel="noreferrer"
                >
                  Chat with us
                </a>
              </p>
              <div className="contact-label">Quick responses guaranteed</div>
            </div>

            <div className="contact-card" data-aos="fade-right" data-aos-delay="200">
              <h3>✉️ Email</h3>
              <p>
                <a href="mailto:mrwashwala@gmail.com">mrwashwala@gmail.com</a>
              </p>
              <div className="contact-label">We'll reply within 24 hours</div>
            </div>
          </div>

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

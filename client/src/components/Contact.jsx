import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

export default function Contact() {
  return (
    <section id="contact" className="py-14">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-center text-white">Get in Touch</h2>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white/5 p-5 rounded-lg">
              <h3 className="text-lg font-semibold"><FontAwesomeIcon icon={faPhone} className="mr-2 text-xl" />Phone</h3>
              <p className="mt-2"><a href="tel:8088980347" className="text-white/90">+91 80889 80347</a></p>
              <p className="text-sm text-white/70 mt-1">Available everyday</p>
            </div>

            <div className="bg-white/5 p-5 rounded-lg">
              <h3 className="text-lg font-semibold"><FontAwesomeIcon icon={faWhatsapp} className="mr-2 text-xl" />WhatsApp</h3>
              <p className="mt-2"><a href="https://wa.me/918088980347?text=Hi%20Mr.%20WashWala%2C%20I%20want%20to%20know%20about%20your%20services" target="_blank" rel="noreferrer" className="text-white/90">Chat with us</a></p>
              <p className="text-sm text-white/70 mt-1">Quick responses guaranteed</p>
            </div>

            <div className="bg-white/5 p-5 rounded-lg">
              <h3 className="text-lg font-semibold"><FontAwesomeIcon icon={faEnvelope} className="mr-2 text-xl" />Email</h3>
              <p className="mt-2"><a href="mailto:mrwashwala@gmail.com" className="text-white/90">mrwashwala@gmail.com</a></p>
              <p className="text-sm text-white/70 mt-1">We'll reply within 24 hours</p>
            </div>
          </div>

          <div className="bg-white/5 p-5 rounded-lg">
            <h3 className="text-lg font-semibold"><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-xl" />Location</h3>
            <div className="mt-3 rounded overflow-hidden">
              <iframe
                title="Mr. WashWala location"
                src="https://maps.google.com/maps?q=12%20Vani%20Vilas%20Layout%20Mysuru%20Vijaynagar&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
            <p className="text-sm text-white/70 mt-3">Open everyday</p>
          </div>
        </div>
      </div>
    </section>
  );
}

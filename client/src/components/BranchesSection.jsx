import React from 'react';
import { branchContent } from '../config/branchContent';
import { branches as branchConfig } from '../config/branches';

const branches = [
  {
    id: 1,
    title: 'Vijayanagar 2nd Stage',
    badge: 'Established Branch',
    description:
      'Serving customers with trusted premium laundry, dry cleaning, steam ironing, and doorstep pickup & delivery services.',
    location: 'Vijayanagar 2nd Stage, Mysuru',
    image:
      branchContent?.['vijaynagar-mysuru']?.cardImage ||
      '/branches/vijaynagar-2nd-stage-hero.jpg',
    mapLink: branchConfig.find((branch) => branch.id === 'vijaynagar-mysuru')?.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=12,+Vani+Vilas+Layout,+Stage+2,+Vijayanagar,+Mysuru,+Karnataka+570017',
    phone: '9035999271',
    whatsapp: '917019436720',
    isNew: false,
  },
  {
    id: 2,
    title: 'Vijayanagar 4th Stage',
    badge: 'Newly Opened',
    description:
      'Our newest Mr. WashWala outlet, bringing the same premium laundry experience with faster service and greater convenience to the Vijayanagar 4th Stage area.',
    location: 'Vijayanagar 4th Stage, Mysuru',
    image:
      branchContent?.['vijayanagar-2nd-stage-mysuru']?.cardImage ||
      '/branches/vijaynagar-hero.jpg',
    mapLink: branchConfig.find((branch) => branch.id === 'vijaynagar-2nd-stage-mysuru')?.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=7700A,+2nd+Phase,+Vijayanagar+4th+Stage,+Bhogadi,+Karnataka+570032',
    phone: '7019436720',
    whatsapp: '919035999271',
    isNew: true,
  },
];

export default function BranchesSection() {
  const buildWhatsAppUrl = (whatsapp, branchTitle) => {
    const phoneNumber = whatsapp?.toString().trim();
    if (!phoneNumber) return null;

    const message = `Hi Mr. WashWala, I want to contact the ${branchTitle} branch about laundry services.`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleContactBranch = (branch) => {
    const whatsappUrl = buildWhatsAppUrl(branch.whatsapp, branch.title);
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (branch.phone?.trim()) {
      window.location.href = `tel:${branch.phone.trim()}`;
      return;
    }

    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="branches-home-section" id="our-branches">
      <div className="container">
        <div className="branches-home-intro" data-aos="fade-up">
          <p className="branches-home-eyebrow">Our Branches</p>
          <h2 className="branches-home-title">Our Branches</h2>
          <p className="branches-home-subtitle">
            Choose the Mr. WashWala outlet that's most convenient for you.
          </p>
        </div>

        <div className="branches-home-grid">
          {branches.map((branch, index) => (
            <article
              className="branches-home-card"
              key={branch.id}
              data-aos="fade-up"
              data-aos-delay={index * 120}
            >
              <div className="branches-home-card-image">
                <img src={branch.image} alt={`${branch.title} branch`} />
                <span className="branches-home-card-badge">{branch.badge}</span>
                {branch.isNew && <span className="branches-home-card-new">NEW</span>}
              </div>

              <div className="branches-home-card-body">
                <h3 className="branches-home-card-title">{branch.title}</h3>
                <p className="branches-home-card-description">{branch.description}</p>

                <div className="branches-home-card-location">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 21s6-5.5 6-10a6 6 0 1 0-12 0c0 4.5 6 10 6 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  <span>{branch.location}</span>
                </div>

                <div className="branches-home-card-actions">
                  <a
                    href={branch.mapLink}
                    className="branches-home-action branches-home-action-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Maps
                  </a>
                  <button
                    type="button"
                    className="branches-home-action branches-home-action-secondary"
                    onClick={() => handleContactBranch(branch)}
                  >
                    Contact Branch
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

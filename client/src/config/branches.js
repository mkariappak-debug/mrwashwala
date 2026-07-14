/**
 * Central branch configuration.
 *
 * To add a new branch in the future, simply append another object to the
 * `branches` array below. Nothing else in the checkout flow needs to change —
 * distance calculation, "open now" detection, sorting and recommendation all
 * operate generically over this list (see `src/utils/branchLocator.js`).
 *
 * Fields:
 *  - id            Unique, stable identifier (used as React key / selection value)
 *  - name          Full display name of the outlet
 *  - shortName     Short label used in compact UI (badges, chips)
 *  - businessName  Brand name (same across all branches)
 *  - address       { line1, line2, line3, full } - full is used for messages/geocoding fallback
 *  - latitude/longitude  Approximate coordinates of the outlet (WGS84 decimal degrees)
 *  - phone         Contact number (same across all branches unless overridden)
 *  - whatsapp      WhatsApp number in international format, no "+" (used for wa.me links)
 *  - email         Contact email
 *  - isActive      Set to false to permanently hide/disable a branch (e.g. temporarily shut)
 *  - businessHours { open: "HH:MM", close: "HH:MM", daysOpen: [0-6] } 24hr format, 0=Sunday
 */

// Shared business info — extracted from the existing site content (Contact.jsx / Footer.jsx).
// Do not change these; both branches use identical contact details, only the address differs.
export const SHARED_BUSINESS_INFO = {
  businessName: "Mr. WashWala",
  phone: "7019436720",
  whatsapp: "917019436720",
  email: "mrwashwala@gmail.com",
  workingHoursLabel: "Open everyday 9 AM - 8 PM"
};

const DEFAULT_BUSINESS_HOURS = {
  open: "09:00",
  close: "20:00",
  // 0 = Sunday ... 6 = Saturday. Open every day, matching the site's existing "everyday" hours.
  daysOpen: [0, 1, 2, 3, 4, 5, 6]
};

export const branches = [
  {
    id: "vijaynagar-mysuru",
    name: "Mr. WashWala - Vijayanagar 2nd Stage, Mysuru",
    shortName: "Vijayanagar 2nd Stage",
    businessName: SHARED_BUSINESS_INFO.businessName,
    address: {
      line1: "12, Vani Vilas Layout",
      line2: "Stage 2, Vijayanagar",
      line3: "Mysuru, Karnataka 570017",
      full: "12, Vani Vilas Layout, Stage 2, Vijayanagar, Mysuru, Karnataka 570017"
    },
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=12,+Vani+Vilas+Layout,+Stage+2,+Vijayanagar,+Mysuru,+Karnataka+570017",
    // Approximate coordinates for Vani Vilas Layout, Vijayanagar 2nd Stage, Mysuru.
    latitude: 12.3192,
    longitude: 76.6172,
    phone: "7019436720",
    whatsapp: "919035999271",
    email: SHARED_BUSINESS_INFO.email,
    isActive: true,
    businessHours: DEFAULT_BUSINESS_HOURS
  },
  {
    id: "vijaynagar-2nd-stage-mysuru",
    name: "Mr. WashWala - Vijayanagar 4th Stage, Mysuru",
    shortName: "Vijayanagar 4th Stage",
    businessName: SHARED_BUSINESS_INFO.businessName,
    address: {
      line1: "7700A, 2nd Phase",
      line2: "Vijayanagar 4th Stage, Bhogadi",
      line3: "Karnataka 570032",
      full: "7700A, 2nd Phase, Vijayanagar 4th Stage, Bhogadi, Karnataka 570032"
    },
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=7700A,+2nd+Phase,+Vijayanagar+4th+Stage,+Bhogadi,+Karnataka+570032",
    // Approximate coordinates for Vijayanagar 4th Stage, Mysuru.
    latitude: 12.3505,
    longitude: 76.585,
    phone: "9035999271",
    whatsapp: SHARED_BUSINESS_INFO.whatsapp,
    email: SHARED_BUSINESS_INFO.email,
    isActive: true,
    businessHours: DEFAULT_BUSINESS_HOURS
  }

  // -----------------------------------------------------------------------
  // To add branch #3, #4, #5... just paste a new object here, e.g.:
  // {
  //   id: "hebbal-mysuru",
  //   name: "Mr. WashWala - Hebbal, Mysuru",
  //   shortName: "Hebbal Branch",
  //   businessName: SHARED_BUSINESS_INFO.businessName,
  //   address: { line1: "...", line2: "...", line3: "...", full: "..." },
  //   latitude: 12.34,
  //   longitude: 76.62,
  //   phone: SHARED_BUSINESS_INFO.phone,
  //   whatsapp: SHARED_BUSINESS_INFO.whatsapp,
  //   email: SHARED_BUSINESS_INFO.email,
  //   isActive: true,
  //   businessHours: DEFAULT_BUSINESS_HOURS
  // }
  // -----------------------------------------------------------------------
];

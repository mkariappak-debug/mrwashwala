/**
 * Branch page content — presentational data for the "Our Branches" pages
 * (Branches.jsx / BranchDetails.jsx).
 *
 * This is intentionally kept separate from `branches.js` (which drives
 * checkout/branch-selection logic). Nothing here affects ordering, pricing
 * or distance calculation.
 *
 * TO REPLACE MEDIA LATER:
 *   - Swap `cardImage` / `coverImage` for real storefront photos.
 *   - Replace items in `gallery` with real photos (any count works, the
 *     layout is a responsive grid).
 *   - Replace `video` with a real branch walkthrough video.
 *   All paths are relative to /client/public, so simply drop your file into
 *   `client/public/branches/<file>` and update the path below — no layout
 *   changes required.
 */

export const branchContent = {
  "vijaynagar-mysuru": {
    tagline: "Our flagship outlet, right in the heart of Vijayanagar.",
    cardImage: "/branches/vijaynagar-hero.jpg",
    coverImage: "/branches/vijaynagar-hero.jpg",
    gallery: [
      "/branches/vijaynagar-1.jpg",
      "/branches/vijaynagar-2.jpg",
      "/branches/vijaynagar-3.jpg",
      "/branches/vijaynagar-4.jpg",
    ],
    video: "/" + encodeURIComponent("Trimmerd Cloth fold and Packing.mp4"),
    about:
      "Our Vijayanagar outlet is where the Mr. WashWala story began. Tucked into Vani Vilas Layout, this flagship branch handles everything from everyday wash-and-fold to delicate saree care and premium dry cleaning, backed by the same attention to detail our customers have trusted us for from day one.",
    features: [
      {
        icon: "⚡",
        title: "Express Turnaround",
        desc: "Same-day wash & fold for orders placed before noon.",
      },
      {
        icon: "🧴",
        title: "Premium Fabric Care",
        desc: "Specialised handling for sarees, suits & delicates.",
      },
      {
        icon: "🚴",
        title: "Free Pickup & Drop",
        desc: "Doorstep collection and delivery across Vijayanagar.",
      },
      {
        icon: "🌟",
        title: "5-Star Rated Service",
        desc: "Consistently rated 4.9+ by our regular customers.",
      },
    ],
  },
  "bhogadi-mysuru": {
    tagline: "Modern, spacious and built for the Bhogadi community.",
    cardImage: "/branches/bogadi-hero.jpg",
    coverImage: "/branches/bogadi-hero.jpg",
    gallery: [
      "/branches/bogadi-1.jpg",
      "/branches/bogadi-2.jpg",
      "/branches/bogadi-3.jpg",
      "/branches/bogadi-4.jpg",
    ],
    video: "/checkout-transition.mp4",
    about:
      "Our Bhogadi branch in Vijayanagar 4th Stage was built to bring the full Mr. WashWala experience closer to home for residents on this side of Mysuru. From shoe cleaning to bulk household laundry, the outlet is equipped with the same premium machines and quality checks as our original location.",
    features: [
      {
        icon: "👟",
        title: "Specialty Shoe Care",
        desc: "Deep-cleaning and restoration for sneakers & leather.",
      },
      {
        icon: "🛏️",
        title: "Bulk Household Laundry",
        desc: "Bedsheets, blankets & curtains handled with ease.",
      },
      {
        icon: "🚴",
        title: "Free Pickup & Drop",
        desc: "Doorstep collection and delivery across Bhogadi.",
      },
      {
        icon: "🌟",
        title: "5-Star Rated Service",
        desc: "Consistently rated 4.9+ by our regular customers.",
      },
    ],
  },
};

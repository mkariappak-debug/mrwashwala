
import React, { useEffect, useRef, useState } from "react";
import CheckoutTransitionOverlay from "./CheckoutTransitionOverlay";
import BranchSelector from "./BranchSelector";
import AddressAutocomplete from "./AddressAutocomplete";
import API from "../api/api";
import { branches as branchConfig } from "../config/branches";
import { rankBranchesByDistance, pickRecommendedBranch, isBranchOpenNow, getBranchStatusLabel } from "../utils/branchLocator";
import { forwardGeocode } from "../utils/geocode";

const UPI_ID = (import.meta.env.VITE_UPI_ID || "9008433284@ybl").trim();
const UPI_PAYEE_NAME = (import.meta.env.VITE_UPI_PAYEE_NAME || "Mr WashWala").trim();

export default function CheckoutModal({
  open,
  cart = [],
  onClose,
  onConfirmOrder
}) {
const isOnlinePaymentEnabled = false;

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getRoundedDateTime = (stepMinutes = 15) => {
  const now = new Date();
  const rounded = new Date(now);

  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const roundedMinutes = Math.ceil(totalMinutes / stepMinutes) * stepMinutes;

  rounded.setHours(0, 0, 0, 0);
  rounded.setMinutes(roundedMinutes);

  const year = rounded.getFullYear();
  const month = String(rounded.getMonth() + 1).padStart(2, "0");
  const day = String(rounded.getDate()).padStart(2, "0");
  const hours = String(rounded.getHours()).padStart(2, "0");
  const minutes = String(rounded.getMinutes()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`
  };
};

const [formData, setFormData] = useState({
  name: "",
  phone: "",
  pickupDate: "",
  pickupTime: "",
  address: "",
  instructions: "",
  latitude: "",
  longitude: "",
  locationLink: ""
});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  // --- Multi-branch recommendation state -----------------------------------
  const [rankedBranches, setRankedBranches] = useState([]);
  const [recommendedBranchId, setRecommendedBranchId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const lastGeocodedAddressRef = useRef("");

  // The "existing/main" branch shown as the default selection the instant a
  // customer starts a manual address - first entry in the config, per the
  // spec's "Existing Branch (Current outlet address)" example.
  const DEFAULT_BRANCH_ID = branchConfig[0]?.id || null;

  // Tracks which flow produced the coordinates currently in formData, so the
  // pickup-date/time effect below can tell them apart:
  //  - "current-location": the existing "Use Current Location" behaviour,
  //    left completely untouched.
  //  - "manual": a manually typed/selected address - here the recommendation
  //    is only ever a suggestion and must never override the customer's
  //    branch selection.
  const locationSourceRef = useRef(null);

  // Branch "open now" status must reflect the *scheduled pickup slot*, not
  // the wall-clock moment the customer happens to be filling the form at.
  // Previously this used `new Date()` directly, so e.g. filling the form at
  // 12 AM for a 2 PM pickup made every branch look closed and unselectable,
  // even though it will clearly be open at pickup time.
  const getPickupReferenceDate = (data = formData) => {
    if (!data.pickupDate || !data.pickupTime) return new Date();
    const [year, month, day] = data.pickupDate.split("-").map(Number);
    const [hours, minutes] = data.pickupTime.split(":").map(Number);
    if (![year, month, day, hours, minutes].every(Number.isFinite)) return new Date();
    const ref = new Date();
    ref.setFullYear(year, month - 1, day);
    ref.setHours(hours, minutes, 0, 0);
    return ref;
  };

  // Runs the Haversine comparison against every configured branch and picks
  // the nearest OPEN (at the scheduled pickup time) branch as the
  // recommendation. Called only after we have real coordinates (current
  // location fix, or a successful address geocode) - never on every
  // keystroke.
  const resolveBranchesFromCoords = (latitude, longitude) => {
    const referenceDate = getPickupReferenceDate();
    const ranked = rankBranchesByDistance(branchConfig, latitude, longitude, referenceDate);
    const recommended = pickRecommendedBranch(ranked);

    setRankedBranches(ranked);
    setRecommendedBranchId(recommended ? recommended.id : null);
    setSelectedBranchId(recommended ? recommended.id : null);
  };

  // Builds the full branch list with no distance info (unknown until we have
  // coordinates). Used to render the branch selector INSTANTLY for manual
  // address entry, before any geocoding has even started.
  const buildBranchListWithoutDistance = () => {
    const referenceDate = getPickupReferenceDate();
    return branchConfig
      .filter((branch) => branch.isActive !== false)
      .map((branch) => ({
        ...branch,
        distanceKm: NaN, // unknown - BranchSelector hides the distance chip for non-finite values
        isOpenNow: isBranchOpenNow(branch, referenceDate),
        statusLabel: getBranchStatusLabel(branch, referenceDate)
      }));
  };

  // Re-labels open/closed status on whatever branch list is already showing,
  // without touching distances, the recommendation, or the customer's
  // selection. Used when only the pickup date/time changes.
  const refreshBranchStatuses = () => {
    const referenceDate = getPickupReferenceDate();
    setRankedBranches((prev) =>
      prev.map((branch) => ({
        ...branch,
        isOpenNow: isBranchOpenNow(branch, referenceDate),
        statusLabel: getBranchStatusLabel(branch, referenceDate)
      }))
    );
  };

  // Called the instant the customer focuses or starts typing a manual
  // address. Shows every branch right away - defaulting the selection to the
  // existing/main branch - so they can pick one immediately, with zero
  // waiting on geocoding. Never overwrites a list/selection that's already
  // on screen.
  const showManualBranchSelectorImmediately = () => {
    setRankedBranches((prev) => (prev.length ? prev : buildBranchListWithoutDistance()));
    setSelectedBranchId((prev) => prev || DEFAULT_BRANCH_ID);
  };

  // Applies the result of a *background* geocode for a manually entered
  // address: refreshes distances and sets the recommendation, but - unlike
  // `resolveBranchesFromCoords` above (which backs "Use Current Location" and
  // is left untouched) - it never overrides the customer's own branch
  // selection. The recommendation is purely an optional suggestion.
  // For manual addresses, we recommend the nearest branch regardless of
  // open/closed status (user can select any branch anyway).
  const applyBackgroundRecommendation = (latitude, longitude) => {
    const referenceDate = getPickupReferenceDate();
    const ranked = rankBranchesByDistance(branchConfig, latitude, longitude, referenceDate);
    
    // For manual address flow, recommend the nearest branch (first in ranked list)
    // regardless of open/closed status, since user can select any branch anyway
    const recommended = ranked.length > 0 ? ranked[0] : null;

    setRankedBranches(ranked);
    setRecommendedBranchId(recommended ? recommended.id : null);
    setSelectedBranchId((prev) => prev || (recommended ? recommended.id : DEFAULT_BRANCH_ID));
  };

  // Debounced-on-blur geocoding for manually typed addresses - fires only
  // after the customer leaves the field, never on every keystroke, and never
  // shows a spinner or blocks the branch selector that's already visible.
  const handleAddressBlur = async () => {
    const address = formData.address.trim();
    if (!address || address === lastGeocodedAddressRef.current) return;
    if (formData.latitude && formData.longitude && formData.locationLink) {
      // Coordinates already came from "Use Current Location"; skip re-geocoding.
      return;
    }

    // The branch selector is already showing (from focus/typing) with a
    // default selection - this call only runs silently in the background.
    try {
      const coords = await forwardGeocode(address);
      lastGeocodedAddressRef.current = address;

      if (coords) {
        locationSourceRef.current = "manual";
        setFormData((prev) => ({
          ...prev,
          latitude: coords.latitude.toString(),
          longitude: coords.longitude.toString(),
          locationLink: `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
        }));
        applyBackgroundRecommendation(coords.latitude, coords.longitude);
      }
      // Geocoding failed to find a match: show nothing - no error, no
      // warning, no recommendation. The customer keeps using whichever
      // branch they already have selected from the list shown above.
    } catch (error) {
      console.error("Forward geocoding error:", error);
      // Silent failure per spec - the customer is never interrupted.
    }
  };

  // Fires when the customer picks a suggestion from the autocomplete
  // dropdown. We already have exact, confirmed coordinates from Nominatim's
  // search result here, so there's no free-text parsing/guessing step at
  // all. Still treated as a background recommendation, not an override - the
  // customer's own branch choice always wins.
  const handleAddressSuggestionSelect = (suggestion) => {
    lastGeocodedAddressRef.current = suggestion.displayName;
    locationSourceRef.current = "manual";
    setFormData((prev) => ({
      ...prev,
      address: suggestion.displayName,
      latitude: suggestion.latitude.toString(),
      longitude: suggestion.longitude.toString(),
      locationLink: `https://www.google.com/maps?q=${suggestion.latitude},${suggestion.longitude}`
    }));
    applyBackgroundRecommendation(suggestion.latitude, suggestion.longitude);
  };

  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const [checkoutRedirectUrl, setCheckoutRedirectUrl] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("upi");
  const [showUpiStep, setShowUpiStep] = useState(false);
  const [upiIntentUrl, setUpiIntentUrl] = useState("");
  const [upiQrUrl, setUpiQrUrl] = useState("");
  const [utrNumber, setUtrNumber] = useState("");

  useEffect(() => {
    // Preload checkout animation video to avoid visible lag on submit.
    const preloadVideo = document.createElement("video");
    preloadVideo.src = "/checkout-transition.mp4";
    preloadVideo.preload = "auto";
    preloadVideo.muted = true;
    preloadVideo.playsInline = true;
    preloadVideo.load();

    return () => {
      preloadVideo.removeAttribute("src");
      preloadVideo.load();
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setIsTransitionOpen(false);
      setCheckoutRedirectUrl("");
      setPaymentMethod("upi");
      setShowUpiStep(false);
      setUpiIntentUrl("");
      setUpiQrUrl("");
      setUtrNumber("");
      setRankedBranches([]);
      setRecommendedBranchId(null);
      setSelectedBranchId(null);
      lastGeocodedAddressRef.current = "";
      locationSourceRef.current = null;
      return;
    }

    const today = getLocalDate();
    const rounded = getRoundedDateTime(15);

    setFormData((prev) => ({
      ...prev,
      pickupDate:
        !prev.pickupDate || prev.pickupDate < today
          ? rounded.date
          : prev.pickupDate,
      pickupTime: prev.pickupTime || rounded.time
    }));
  }, [open]);

  // Re-evaluate branch open/closed status whenever the customer changes the
  // pickup date or time - e.g. they picked "today" while every branch showed
  // closed for the current moment, then moved the slot to this afternoon; the
  // branch list should reflect that without requiring them to retype the
  // address.
  useEffect(() => {
    if (!open) return;

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      if (locationSourceRef.current === "current-location") {
        // "Use Current Location" flow - left completely unchanged.
        resolveBranchesFromCoords(lat, lng);
      } else {
        // Manual address flow - refresh distances/recommendation only, never
        // touch the customer's own branch selection.
        applyBackgroundRecommendation(lat, lng);
      }
    } else if (rankedBranches.length > 0) {
      // No coordinates yet (address not geocoded, or geocoding failed) -
      // just refresh open/closed labels against the new pickup slot.
      refreshBranchStatuses();
    }
    // Only the pickup slot should re-trigger this; coordinate changes are
    // already handled directly by the functions that set them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.pickupDate, formData.pickupTime, open]);

  if (!open) return null;

  // Get today's date in YYYY-MM-DD format for minimum date picker value
  const getTodayDate = () => {
    return getLocalDate();
  };

  
  const handleUseCurrentLocation = async () => {
    locationSourceRef.current = "current-location";
    setIsLocating(true);
    setLocationStatus("Fetching location...");

    if (!navigator.geolocation) {
      setLocationStatus("❌ Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocode using OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "Accept-Language": "en"
              }
            }
          );
          const data = await response.json();
          
          let address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          if (data.address) {
            // Build a readable address from components
            const parts = [];
            if (data.address.road) parts.push(data.address.road);
            if (data.address.house_number && data.address.road) {
              parts[0] = `${data.address.house_number} ${data.address.road}`;
            }
            if (data.address.city || data.address.town || data.address.village) {
              parts.push(data.address.city || data.address.town || data.address.village);
            }
            if (data.address.state) parts.push(data.address.state);
            if (data.address.postcode) parts.push(data.address.postcode);
            
            address = parts.filter(Boolean).join(", ");
          }

          const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

          setFormData({
            ...formData,
            address: address,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            locationLink: googleMapsLink
          });
          lastGeocodedAddressRef.current = address;
          resolveBranchesFromCoords(latitude, longitude);

          setLocationStatus("✓ Location captured successfully");
        } catch (error) {
          console.error("Geocoding error:", error);
          
          const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
          
          setFormData({
            ...formData,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            locationLink: googleMapsLink
          });
          resolveBranchesFromCoords(latitude, longitude);

          setLocationStatus("✓ Location captured (address lookup not available)");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationStatus("❌ Unable to fetch location. Please enter address manually.");
        setIsLocating(false);
      }
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const selectedBranch =
    rankedBranches.find((b) => b.id === selectedBranchId) || null;

  const buildWhatsAppMessage = (paymentInfo = null) => {
    const itemsText = cart
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} - ${item.quantity} ${item.unit}(s) x ₹${item.price} = ₹${item.price * item.quantity}`
      )
      .join("\n");

    return [
      "Hello Mr. WashWala 😊, I would like to place an order through the website.",
      "",
      "Customer Details:",
      `Name: ${formData.name}`,
      `Phone: ${formData.phone}`,
      `Pickup Date: ${formData.pickupDate.split("-").reverse().join("-")}`,
      `Pickup Time: ${formData.pickupTime}`,
      `Pickup Address: ${formData.address}`,
      formData.locationLink ? `Google Maps Location: ${formData.locationLink}` : null,
      selectedBranch ? `Pickup Branch: ${selectedBranch.name}` : null,
      formData.instructions ? `Instructions: ${formData.instructions}` : null,
      paymentInfo ? "" : null,
      paymentInfo ? "Payment Details:" : null,
      paymentInfo ? paymentInfo : null,
      "",
      "Order Summary:",
      itemsText,
      "",
      `Subtotal: ₹${subtotal}`,
      "Delivery Charge: Free",
      `Total: ₹${subtotal}`,
      "",
      "Please confirm the pickup.",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const openWhatsAppWithTransition = (message) => {
    const redirectUrl = `https://api.whatsapp.com/send/?phone=917019436720&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
    setCheckoutRedirectUrl(redirectUrl);
    setIsTransitionOpen(true);
  };

  const handleStartUpiFlow = () => {
    const amountInRupees = subtotal.toFixed(2);
    const note = encodeURIComponent(`Laundry order payment - ${formData.phone}`);
    const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_PAYEE_NAME)}&am=${amountInRupees}&cu=INR&tn=${note}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(upiUrl)}`;

    setUpiIntentUrl(upiUrl);
    setUpiQrUrl(qrUrl);
    setShowUpiStep(true);
  };

  const handleConfirmUpiPayment = () => {
    if (!utrNumber.trim()) {
      alert("Please enter UTR / transaction reference number after payment.");
      return;
    }

    const message = buildWhatsAppMessage(
      `Mode: UPI QR (Manual Verification)\nUTR: ${utrNumber.trim()}\nStatus: Payment completed by customer, verification pending.`
    );

    setShowUpiStep(false);
    openWhatsAppWithTransition(message);
  };

const handleSubmit = async (e) => {
    e.preventDefault();
if (
  !formData.name.trim() ||
  !formData.phone.trim() ||
  !formData.address.trim() ||
  !formData.pickupDate ||
  !formData.pickupTime
) {
  alert("Please fill all required fields");
  return;
}

if (!/^\d{10}$/.test(formData.phone)) {
  alert("Please enter a valid 10-digit phone number");
  return;
}

    setIsSubmitting(true);

    try {
      const message = buildWhatsAppMessage();

      // Best-effort persistence of the order (including branch recommendation
      // vs. the customer's final choice) so staff can see which outlet should
      // process it. This never blocks WhatsApp / UPI checkout if it fails.
      const recommendedBranch = rankedBranches.find(
        (b) => b.id === recommendedBranchId
      );
      API.post("/api/orders", {
        customer: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          instructions: formData.instructions || ""
        },
        items: cart,
        totalAmount: subtotal,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        paymentMethod,
        recommendedBranch: recommendedBranch
          ? { id: recommendedBranch.id, name: recommendedBranch.name }
          : null,
        selectedBranch: selectedBranch
          ? { id: selectedBranch.id, name: selectedBranch.name }
          : null
      }).catch((err) => {
        console.log("Order persistence skipped:", err?.message || err);
      });

      if (paymentMethod === "online") {
        if (!isOnlinePaymentEnabled) {
          alert("Online Payment Gateway is coming soon. Please use WhatsApp or UPI QR payment for now.");
          return;
        }

        const idempotencyKey = `pay-${Date.now()}-${formData.phone}`;

        const response = await API.post("/api/payments/checkout/initiate", {
          idempotencyKey,
          customer: {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            instructions: formData.instructions || ""
          },
          items: cart,
          totalAmount: subtotal,
          currency: "INR",
          metadata: {
            pickupDate: formData.pickupDate,
            pickupTime: formData.pickupTime,
            locationLink: formData.locationLink || "",
            flow: "online",
            recommendedBranch: recommendedBranch ? recommendedBranch.name : "",
            selectedBranch: selectedBranch ? selectedBranch.name : ""
          }
        });

        const { providerConfigured, provider = {}, merchantOrderId } = response.data || {};

        if (providerConfigured && provider.checkoutUrl) {
          window.location.assign(provider.checkoutUrl);
          return;
        }

        alert(
          `Online payment architecture is ready and provider setup is pending. Reference: ${merchantOrderId || "N/A"}. Please use WhatsApp checkout for now.`
        );
        return;
      }

      if (paymentMethod === "upi") {
        handleStartUpiFlow();
        return;
      }

      openWhatsAppWithTransition(message);
    } catch (err) {
      console.log(err);
      alert("Failed to place order");
    } finally 
    {
      setIsSubmitting(false);
    }
  };

  const handleTransitionComplete = () => {
    if (onConfirmOrder) {
      onConfirmOrder();
    }

    onClose();

    if (checkoutRedirectUrl) {
      const whatsappWindow = window.open(checkoutRedirectUrl, "_blank", "noopener,noreferrer");

      // Keep this tab on the site home page while WhatsApp opens separately.
      if (whatsappWindow) {
        window.location.assign("/");
      } else {
        // Fallback when popup is blocked.
        window.location.assign(checkoutRedirectUrl);
      }
    }
  };

  if (isTransitionOpen) {
    return (
      <CheckoutTransitionOverlay
        open={isTransitionOpen}
        onComplete={handleTransitionComplete}
      />
    );
  }

  if (showUpiStep) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(8px)",
          zIndex: 999999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px"
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            background: "rgba(255,255,255,0.97)",
            borderRadius: "22px",
            padding: "24px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.25)"
          }}
        >
          <h3 style={{ color: "#1d2f66", marginBottom: "10px" }}>Pay with UPI QR</h3>
          <p style={{ color: "#4d5f8f", marginBottom: "14px", fontSize: "14px" }}>
            Scan this QR in any UPI app and pay <strong>₹{subtotal}</strong>.
          </p>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
            <img
              src={upiQrUrl}
              alt="UPI Payment QR"
              style={{ width: "280px", height: "280px", borderRadius: "14px", border: "1px solid #e1e8fb" }}
            />
          </div>

          <div style={{ fontSize: "13px", color: "#5f6f98", marginBottom: "14px" }}>
            UPI ID: <strong>{UPI_ID}</strong>
          </div>

          <input
            type="text"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value.trimStart())}
            placeholder="Enter UTR / Transaction Reference Number"
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d5ddef",
              borderRadius: "10px",
              fontSize: "14px",
              marginBottom: "14px"
            }}
          />

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                window.location.href = upiIntentUrl;
              }}
              style={upiBtnPrimary}
            >
              Open UPI App
            </button>

            <button type="button" onClick={handleConfirmUpiPayment} style={upiBtnSecondary}>
              I Have Paid - Continue
            </button>

            <button
              type="button"
              onClick={() => setShowUpiStep(false)}
              style={upiBtnGhost}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(8px)",
        zIndex: 999999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          background: "rgba(255,255,255,0.96)",
          borderRadius: "24px",
          padding: "35px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        <button
          onClick={onClose}
          disabled={isSubmitting}
          style={{
            float: "right",
            border: "none",
            background: "transparent",
            fontSize: "28px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.5 : 1
          }}
        >
          ×
        </button>

        <h2
          style={{
            color: "#27187E",
            marginBottom: "25px"
          }}
        >
          Book Your Doorstep Pickup
        </h2>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "18px"
            }}
          >
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value
                })
              }
              style={inputStyle}
            />
<input
  type="tel"
  name="phone"
  placeholder="Phone Number"
  value={formData.phone}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);

    setFormData({
      ...formData,
      phone: value,
    });
  }}
  maxLength={10}
  required
  style={inputStyle}
/>
<input
  type="date"
  value={formData.pickupDate}
  min={getTodayDate()}
  onChange={(e) =>
    setFormData({
      ...formData,
      pickupDate: e.target.value,
    })
  }
  onKeyDown={(e) => e.preventDefault()}
  required
  style={{
    ...inputStyle,
    cursor: "pointer"
  }}
/>

<input
  type="time"
  value={formData.pickupTime}
  onChange={(e) =>
    setFormData({
      ...formData,
      pickupTime: e.target.value
    })
  }
  required
  style={inputStyle}
/>
            <AddressAutocomplete
              placeholder="Pickup Address"
              value={formData.address}
              onFocus={() => {
                // Show the branch selector the INSTANT the customer focuses
                // the manual address field - no waiting on geocoding.
                if (locationSourceRef.current !== "current-location") {
                  showManualBranchSelectorImmediately();
                }
              }}
              onChange={(text) => {
                locationSourceRef.current = "manual";
                setFormData((prev) => ({
                  ...prev,
                  address: text,
                  // Address was edited by hand - old lat/lng no longer trustworthy
                  // until either a suggestion is picked or blur re-geocodes it.
                  latitude: "",
                  longitude: "",
                  locationLink: ""
                }));
                // The previously shown RECOMMENDATION belongs to the OLD
                // address text - drop it immediately so a stale "nearest
                // branch" is never shown for an address the customer has
                // since changed. The branch selector itself, and the
                // customer's current selection, stay exactly as they were -
                // they're never blocked or reset while typing.
                lastGeocodedAddressRef.current = "";
                setRecommendedBranchId(null);
                setLocationStatus("");
                showManualBranchSelectorImmediately();
              }}
              onSelectSuggestion={handleAddressSuggestionSelect}
              onManualBlur={handleAddressBlur}
              style={{
                ...inputStyle,
                minHeight: "100px",
                marginBottom: "8px"
              }}
            />

            <div
              style={{
                gridColumn: "1 / -1",
                fontSize: "13px",
                color: "#666",
                marginBottom: "12px",
                lineHeight: "1.5"
              }}
            >
              Use this address for laundry pickup. If you are ordering for another location, enter that address manually.
            </div>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              style={{
                gridColumn: "1 / -1",
                padding: "12px",
                border: "2px solid #27187E",
                borderRadius: "12px",
                background: formData.locationLink ? "#27187E" : "#fff",
                color: formData.locationLink ? "#fff" : "#27187E",
                cursor: isLocating ? "not-allowed" : "pointer",
                fontWeight: "600",
                transition: "all 0.3s ease",
                fontSize: "15px",
                opacity: isLocating ? 0.6 : 1
              }}
            >
              {isLocating ? "📍 Fetching location..." : "📍 Use Current Location"}
            </button>

            {locationStatus && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  fontSize: "13px",
                  padding: "10px",
                  borderRadius: "8px",
                  marginTop: "8px",
                  background: locationStatus.includes("✓")
                    ? "#e8f5e9"
                    : "#ffebee",
                  color: locationStatus.includes("✓") ? "#2e7d32" : "#c62828",
                  border: `1px solid ${
                    locationStatus.includes("✓")
                      ? "#c8e6c9"
                      : "#ffcdd2"
                  }`
                }}
              >
                {locationStatus}
              </div>
            )}

            <BranchSelector
              rankedBranches={rankedBranches}
              recommendedBranchId={recommendedBranchId}
              selectedBranchId={selectedBranchId}
              onSelectBranch={setSelectedBranchId}
            />

            <textarea
              placeholder="Special Instructions"
              value={formData.instructions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  instructions: e.target.value
                })
              }
              style={{
                ...inputStyle,
                gridColumn: "1 / -1",
                minHeight: "90px"
              }}
            />

            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "4px"
              }}
            >
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                style={{
                  position: "relative",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: paymentMethod === "upi" ? "2px solid #27187E" : "1px solid #cfd8ea",
                  background: paymentMethod === "upi" ? "#eef1ff" : "#fff",
                  color: "#1b2c61",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                UPI QR Payment
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    padding: "1px 6px",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: "800",
                    background: "#dcfce7",
                    color: "#166534",
                    border: "1px solid #86efac",
                    lineHeight: "1.2"
                  }}
                >
                  Offer
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("whatsapp")}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: paymentMethod === "whatsapp" ? "2px solid #27187E" : "1px solid #cfd8ea",
                  background: paymentMethod === "whatsapp" ? "#eef1ff" : "#fff",
                  color: "#1b2c61",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                WhatsApp Checkout
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("online")}
                disabled={!isOnlinePaymentEnabled}
                style={{
                  position: "relative",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: paymentMethod === "online" ? "2px solid #27187E" : "1px solid #cfd8ea",
                  background: paymentMethod === "online" ? "#eef1ff" : "#fff",
                  color: "#1b2c61",
                  fontWeight: "600",
                  cursor: !isOnlinePaymentEnabled ? "not-allowed" : "pointer",
                  opacity: !isOnlinePaymentEnabled ? 0.55 : 1
                }}
              >
                <span>Online Payment</span>
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    padding: "1px 6px",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: "800",
                    background: "#fff3c4",
                    color: "#8a5a00",
                    border: "1px solid #f2cf66",
                    lineHeight: "1.2"
                  }}
                >
                  Offer 5%
                </span>
              </button>
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
                fontSize: "12px",
                color: "#5a6b96"
              }}
            >
              Selected: {paymentMethod === "online" ? "Online Payment" : paymentMethod === "upi" ? "UPI QR Payment" : "WhatsApp Checkout"}
            </div>

            
          </div>

          <div
            style={{
              marginTop: "25px",
              padding: "18px",
              background: "#f5f7ff",
              borderRadius: "14px"
            }}
          >
            <strong>Total Amount: ₹{subtotal}</strong>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "16px",
              border: "none",
              borderRadius: "12px",
              background: "#27187E",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            {isSubmitting
              ? "Processing..."
              : paymentMethod === "online"
              ? "Proceed to Online Payment"
              : paymentMethod === "upi"
              ? "Proceed to UPI QR"
              : "Confirm & Order via WhatsApp"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  border: "1px solid #ddd",
  borderRadius: "12px",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box"
};

const upiBtnPrimary = {
  flex: "1 1 180px",
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "#27187E",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer"
};

const upiBtnSecondary = {
  flex: "1 1 220px",
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "#22a06b",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer"
};

const upiBtnGhost = {
  flex: "1 1 120px",
  padding: "12px",
  border: "1px solid #c8d3f2",
  borderRadius: "10px",
  background: "#fff",
  color: "#263a74",
  fontWeight: "600",
  cursor: "pointer"
};


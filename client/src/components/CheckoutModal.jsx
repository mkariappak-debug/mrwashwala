
import React, { useEffect, useState } from "react";
import CheckoutTransitionOverlay from "./CheckoutTransitionOverlay";

export default function CheckoutModal({
  open,
  cart = [],
  onClose,
  onConfirmOrder
}) {
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
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const [checkoutRedirectUrl, setCheckoutRedirectUrl] = useState("");

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

  if (!open) return null;

  // Get today's date in YYYY-MM-DD format for minimum date picker value
  const getTodayDate = () => {
    return getLocalDate();
  };

  
  const handleUseCurrentLocation = async () => {
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
      const itemsText = cart
        .map(
          (item, index) =>
            `${index + 1}. ${item.name} - ${item.quantity} ${item.unit}(s) x ₹${item.price} = ₹${item.price * item.quantity}`
        )
        .join("\n");

     const message = [
  "Hello Mr. WashWala 😊, I would like to place an order through the website.",
        "",
        "Customer Details:",
`Name: ${formData.name}`,
`Phone: ${formData.phone}`,
`Pickup Date: ${formData.pickupDate
  .split("-")
  .reverse()
  .join("-")}`,
`Pickup Time: ${formData.pickupTime}`,
`Pickup Address: ${formData.address}`,
formData.locationLink
  ? `Google Maps Location: ${formData.locationLink}`
  : null,
formData.instructions ? `Instructions: ${formData.instructions}` : null,
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

      const redirectUrl = `https://api.whatsapp.com/send/?phone=917019436720&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
      setCheckoutRedirectUrl(redirectUrl);
      setIsTransitionOpen(true);
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
            <textarea
              placeholder="Pickup Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: e.target.value
                })
              }
              style={{
                ...inputStyle,
                gridColumn: "1 / -1",
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
              ? "Booking Order..."
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


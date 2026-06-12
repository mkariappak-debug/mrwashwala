
import React, { useState } from "react";

export default function CheckoutModal({
  open,
  cart = [],
  onClose,
  onConfirmOrder
}) 
{
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    instructions: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.phone ||
      !formData.address
    ) {
      alert("Please fill all required fields");
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
        "Hello Mr. WashWala, I would like to place an order through the website.",
        "",
        "Customer Details:",
        `Name: ${formData.name}`,
        `Phone: ${formData.phone}`,
        `Address: ${formData.address}`,
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

      window.open(
        `https://wa.me/917019436720?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      if (onConfirmOrder) {
        onConfirmOrder();
      }

      onClose();
    } catch (err) {
      console.log(err);
      alert("Failed to place order");
    } finally 
    {
      setIsSubmitting(false);
    }
  };

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
          style={{
            float: "right",
            border: "none",
            background: "transparent",
            fontSize: "28px",
            cursor: "pointer"
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
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value
                })
              }
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
                minHeight: "100px"
              }}
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


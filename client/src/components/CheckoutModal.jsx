import React, { useState } from 'react';

export default function CheckoutModal({
  open,
  cart,
  onClose,
  onConfirmOrder
}) {

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    instructions: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const subtotal = cart.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {

      const orderData = {
        customerName: formData.name,
        phone: formData.phone,
        address: formData.address,

        services: cart.map((item) => ({
          serviceName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),

        totalAmount: subtotal,
      };

      const response = await fetch(
        'http://localhost:5000/api/orders',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        }
      );

      const savedOrder = await response.json();

      const itemsText = cart
        .map(
          (item) =>
            `- ${item.name}: ${item.quantity} ${item.unit}(s) (₹${
              item.price * item.quantity
            })`
        )
        .join('%0A');

      const message =
        `*NEW ORDER FROM MR. WASHWALA WEBAPP*%0A%0A` +
        `*Order ID:* ${savedOrder._id}%0A%0A` +
        `*Customer Details:*%0A` +
        `- Name: ${formData.name}%0A` +
        `- Phone: ${formData.phone}%0A` +
        `- Address: ${formData.address}%0A` +
        `${
          formData.instructions
            ? `- Instructions: ${formData.instructions}%0A`
            : ''
        }%0A` +
        `*Order Details:*%0A${itemsText}%0A%0A` +
        `*Total Amount:* ₹${subtotal}%0A%0A` +
        `Please confirm my doorstep pickup booking!`;

      window.open(
        `https://wa.me/918088980347?text=${message}`,
        '_blank'
      );

      if (onConfirmOrder) {
        onConfirmOrder();
      }

      onClose();

    } catch (error) {

      console.log(error);

      alert('Failed to place order');

    } finally {

      setIsSubmitting(false);

    }
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">

        <button
          className="modal-close"
          onClick={onClose}
        >
          &times;
        </button>

        <h2>Book Your Doorstep Pickup</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value
              })
            }
          />

          <textarea
            placeholder="Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Special Instructions"
            value={formData.instructions}
            onChange={(e) =>
              setFormData({
                ...formData,
                instructions: e.target.value
              })
            }
          />

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {
              isSubmitting
                ? 'Booking Order...'
                : 'Confirm & Order via WhatsApp'
            }
          </button>

        </form>

      </div>
    </div>
  );
}
<div className="pickup-modal">

  <span className="pickup-close">×</span>

  <h2>Book Your Doorstep Pickup</h2>

  <form className="pickup-form">

      <input
        type="text"
        placeholder="Your Name"
      />

      <input
        type="tel"
        placeholder="Phone Number"
      />

      <input
        type="text"
        placeholder="Address"
      />

      <input
        type="text"
        placeholder="Preferred Pickup Time"
      />

      <textarea
        placeholder="Special Instructions"
      />

      <button
        type="submit"
        className="pickup-submit"
      >
        Confirm & Order via WhatsApp
      </button>

  </form>

</div>
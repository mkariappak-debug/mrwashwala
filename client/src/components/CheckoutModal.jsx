import React, { useState } from 'react';

export default function CheckoutModal({ open, cart, onClose }) {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', instructions: '' });

  if (!open) return null;

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert('Please fill out all required fields.');
      return;
    }
    // Generate WhatsApp text
    const itemsText = cart.map(item => `- ${item.name}: ${item.quantity} ${item.unit}(s) (₹${item.price * item.quantity})`).join('%0A');
    const message = `*NEW ORDER FROM MR. WASHWALA WEBAPP*%0A%0A` +
      `*Customer Details:*%0A` +
      `- Name: ${formData.name}%0A` +
      `- Phone: ${formData.phone}%0A` +
      `- Address: ${formData.address}%0A` +
      `${formData.instructions ? `- Instructions: ${formData.instructions}%0A` : ''}%0A` +
      `*Order Details:*%0A${itemsText}%0A%0A` +
      `*Total Amount:* ₹${subtotal}%0A%0A` +
      `Please confirm my doorstep pickup booking!`;

    window.open(`https://wa.me/918088980347?text=${message}`, '_blank');
    onClose();
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          &times;
        </button>
        <h2>Book Your Doorstep Pickup</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="modal-name">Full Name *</label>
            <input
              type="text"
              id="modal-name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-phone">Phone Number *</label>
            <input
              type="tel"
              id="modal-phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter 10-digit number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-address">Doorstep Address *</label>
            <textarea
              id="modal-address"
              required
              rows="3"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="House/Apartment No, Street, Landmark, Mysuru"
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-instructions">Special Instructions (Optional)</label>
            <input
              type="text"
              id="modal-instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="e.g. Wash separate, handle delicates carefully"
            />
          </div>

          <div className="checkout-summary">
            <h3>Selected Services</h3>
            <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '10px' }}>
              {cart.map((item) => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <strong>Total Amount: ₹{subtotal}</strong>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Confirm & Order via WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}

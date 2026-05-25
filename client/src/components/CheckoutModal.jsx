import React from 'react';

export default function CheckoutModal({ open, cart, onClose }) {
  if (!open) return null;

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl p-6 w-[520px] max-w-full">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Checkout Summary</h2>
          <button className="text-2xl" onClick={onClose}>&times;</button>
        </div>

        <div className="mt-4 space-y-3">
          {cart.map((item) => (
            <div key={item.name} className="flex justify-between">
              <div>{item.name} × {item.quantity}</div>
              <div>₹{item.price * item.quantity}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-right font-bold">Total: ₹{subtotal}</div>

        <div className="mt-6 flex gap-3 justify-end">
          <button className="bg-gradient-to-r from-accent to-blue-500 text-white px-4 py-2 rounded" onClick={() => { alert('Payment flow not implemented'); }}>Pay Now</button>
          <button className="px-4 py-2 border rounded" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

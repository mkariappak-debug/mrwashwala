import React from 'react';

export default function Cart({ cart, onUpdateQuantity, onRemoveItem, onCheckout }) {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const delivery = subtotal > 0 ? 0 : 0; // Configurable delivery fee
  const total = subtotal + delivery;

  return (
    <section id="cart" className="cart-section py-14 bg-gradient-to-b from-white to-sky-50 relative overflow-hidden">
      <div className="parallax-bg absolute inset-0 opacity-50 -z-10" aria-hidden="true"></div>
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-center text-white">Your Shopping Cart</h2>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
            {cart.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm text-muted mt-2">Add services from our list above to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.name} className="flex items-center justify-between bg-white/5 p-4 rounded-md">
                    <div>
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <p className="text-sm text-white/80">₹{item.price} per {item.unit}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="px-3 py-1 bg-white/10 rounded" onClick={() => onUpdateQuantity(item.name, item.quantity - 1, item.price, item.unit)}>−</button>
                      <span className="px-3 py-1 bg-white/5 rounded">{item.quantity}</span>
                      <button className="px-3 py-1 bg-white/10 rounded" onClick={() => onUpdateQuantity(item.name, item.quantity + 1, item.price, item.unit)}>+</button>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{item.price * item.quantity}</div>
                      <button className="text-sm text-red-400 mt-2" onClick={() => onRemoveItem(item.name)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="cart-summary bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="flex justify-between mt-4"><span>Subtotal:</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between mt-2"><span>Delivery Charge:</span><span>{subtotal > 0 ? 'Free' : '₹0'}</span></div>
            <div className="flex justify-between mt-4 font-extrabold text-lg"><span>Total:</span><span>₹{total}</span></div>
            <button className="mt-6 w-full bg-gradient-to-r from-accent to-blue-500 text-white py-3 rounded-lg disabled:opacity-50" disabled={cart.length === 0} onClick={onCheckout}>Proceed to Checkout</button>
          </aside>
        </div>
      </div>
    </section>
  );
}
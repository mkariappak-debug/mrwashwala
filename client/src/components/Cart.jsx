import React from 'react';

export default function Cart({ cart, onUpdateQuantity, onRemoveItem, onCheckout }) {
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal;

  return (
    <section id="cart" className="cart-section">
      <div className="container">
        <h2 className="section-title white-bg-heading">Your Shopping Cart</h2>

        <div className="cart-wrapper">
          <div className="cart-items-container">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty</p>
                <span className="empty-cart-subtitle">Add services from our list below to get started</span>
              </div>
            ) : (
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.name} className="cart-item">
                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <p>₹{item.price} per {item.unit}</p>
                    </div>

                    <div className="cart-item-quantity">
                      <button
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(item.name, item.quantity - 1, item.price, item.unit)}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(item.name, item.quantity + 1, item.price, item.unit)}
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-price">
                      ₹{item.price * item.quantity}
                    </div>

                    <button className="btn-remove" onClick={() => onRemoveItem(item.name)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-item">
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-item">
              <span>Delivery Charge:</span>
              <span>{subtotal > 0 ? 'Free' : '₹0'}</span>
            </div>
            <div className="summary-item total">
              <span>Total:</span>
              <span>₹{total}</span>
            </div>
            <button
  className="btn btn-primary btn-block"
  disabled={cart.length === 0}
  onClick={() => {
    console.log("BUTTON CLICKED");
    onCheckout();
  }}
>
  Proceed to Checkout
</button>
          </aside>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from "react";

const DATA = {
  "Dry Clean": {
    "Men's Wear": [
      { name: "Shirt/T-Shirt", price: 39 },
      { name: "Formal/Jeans", price: 44 },
      { name: "Coat", price: 149 },
      { name: "Suit (2 Piece)", price: 249 },
      { name: "Suit (3 Piece)", price: 299 },
      { name: "Jacket", price: 99 }
    ],

    "Women's Wear": [
      { name: "Kurta", price: 75 },
      { name: "Salwar", price: 75 },
      { name: "Saree", price: 159 },
      { name: "Dress", price: 100 },
      { name: "Western", price: 99 }
    ],

    Others: [
      { name: "Carpet (sq ft)", price: 24 },
      { name: "Toy Cleaning", price: 399 },
      { name: "Bag Cleaning", price: 199 },
      { name: "Curtain Cleaning(sq ft)", price: 39 }
    ]
  },

  "Bed Set Clean": [
    { name: "Big Blankets", price: 225 },
    { name: "Small Blankets", price: 199 },
    { name: "Bedsheets", price: 129 }
  ],

  "Shoe Cleaning": [
    { name: "Sports Shoe", price: 210 },
    { name: "Casual Shoe", price: 200 },
    { name: "Formal/Leather", price: 299 },
    { name: "Boots", price: 299 }
  ]
};

export default function CustomizeSidebar({
  isOpen,
  onClose,
  onUpdateQuantity,
  cart
}) {
  const [toast, setToast] = useState("");

  const [openSections, setOpenSections] = useState({
    dry: true,
    men: false,
    women: false,
    others: false
  });

  const getCartQty = (itemName) => {
    const item = cart.find((i) => i.name === itemName);
    return item ? item.quantity : 0;
  };

  const getMessage = (itemName) => {
    const messages = {
      "Shirt/T-Shirt": "👕 One clean shirt coming up!",
      "Formal/Jeans": "👖 Fresh jeans on the way!",
      "Coat": "🧥 Your coat will look brand new!",
      "Jacket": "🧥 Jacket refresh incoming!",
      "Kurta": "✨ Fresh kurta coming up!",
      "Salwar": "✨ Fresh salwar coming up!",
      "Saree": "🌸 Your saree is in good hands!",
      "Dress": "👗 One sparkling dress coming up!",
      "Western": "✨ Fresh western wear coming up!",
      "Big Blankets": "🛏️ One fluffy blanket coming up!",
      "Small Blankets": "🛏️ Cozy blanket refresh incoming!",
      "Bedsheets": "🛌 Fresh bedsheets on the way!",
      "Sports Shoe": "👟 Sports shoes getting a makeover!",
      "Casual Shoe": "👟 Casual shoes freshening up!",
      "Formal/Leather": "✨ Leather shoes getting polished!",
      "Boots": "🥾 Boots cleaning in progress!",
      "Toy Cleaning": "🧸 Toy cleaning coming up!",
      "Bag Cleaning": "👜 Bag cleaning in progress!",
      "Curtain Cleaning": "🪟 Curtains getting a fresh clean!"
    };

    return messages[itemName] || `✨ ${itemName} added to cart!`;
  };

  const updateQty = (itemName, price, change) => {
    const currentQty = getCartQty(itemName);
    const nextQty = Math.max(0, currentQty + change);

    onUpdateQuantity(
      itemName,
      nextQty,
      price,
      "item"
    );

    if (change > 0) {
      setToast(getMessage(itemName));

      setTimeout(() => {
        setToast("");
      }, 2000);
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (!isOpen) return null;

  return (
    <>
      {toast && (
        <div className="toast-message">
          {toast}
        </div>
      )}

      <div
        className="sidebar-overlay"
        onClick={onClose}
      />

      <div className="custom-sidebar">

        <div className="sidebar-header">
          <h2>Customize Service</h2>

          <button onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sidebar-section">
          <h3
            onClick={() =>
              setOpenSections((s) => ({
                ...s,
                dry: !s.dry
              }))
            }
          >
            Dry Clean
          </h3>

          {openSections.dry && (
            <>
              {["Men's Wear", "Women's Wear", "Others"].map(
                (group) => {
                  const key =
                    group === "Men's Wear"
                      ? "men"
                      : group === "Women's Wear"
                      ? "women"
                      : "others";

                  return (
                    <div key={group}>
                      <h4
                        onClick={() =>
                          setOpenSections((s) => ({
                            ...s,
                            [key]: !s[key]
                          }))
                        }
                      >
                        {group}
                      </h4>

                      {openSections[key] &&
                        DATA["Dry Clean"][group].map(
                          (item) => (
                            <ItemRow
                              key={item.name}
                              item={item}
                              quantity={getCartQty(item.name)}
                              onChange={updateQty}
                            />
                          )
                        )}
                    </div>
                  );
                }
              )}
            </>
          )}
        </div>

        <div className="sidebar-section">
          <h3>Bed Set Clean</h3>

          {DATA["Bed Set Clean"].map((item) => (
            <ItemRow
              key={item.name}
              item={item}
              quantity={getCartQty(item.name)}
              onChange={updateQty}
            />
          ))}
        </div>

        <div className="sidebar-section">
          <h3>Shoe Cleaning</h3>

          {DATA["Shoe Cleaning"].map((item) => (
            <ItemRow
              key={item.name}
              item={item}
              quantity={getCartQty(item.name)}
              onChange={updateQty}
            />
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-summary">
            <p>
              <strong>Items:</strong> {totalItems}
            </p>

            <p>
              <strong>Subtotal:</strong> ₹{subtotal}
            </p>
          </div>
        </div>

      </div>
    </>
  );
}

function ItemRow({
  item,
  quantity,
  onChange
}) {
  return (
    <div className="custom-item">
      <div className="item-info">
        <strong>{item.name}</strong>
        <div>₹{item.price}</div>
      </div>

      <div className="quantity-control">
        <button
          onClick={() =>
            onChange(
              item.name,
              item.price,
              -1
            )
          }
        >
          −
        </button>

        <span>{quantity}</span>

        <button
          onClick={() =>
            onChange(
              item.name,
              item.price,
              1
            )
          }
        >
          +
        </button>
      </div>
    </div>
  );
}


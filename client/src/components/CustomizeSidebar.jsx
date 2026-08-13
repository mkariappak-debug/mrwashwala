
import React, { useEffect, useMemo, useState } from "react";
import API from "../api/api";

export default function CustomizeSidebar({
  isOpen,
  onClose,
  onUpdateQuantity,
  cart
}) {
  const [toast, setToast] = useState("");
  const [services, setServices] = useState([]);
  const [openSections, setOpenSections] = useState({});

  useEffect(() => {
    const fetchCustomizeServices = async () => {
      try {
        const response = await API.get('/api/services', {
          params: { displayType: 'customize' }
        });
        setServices(response.data || []);
      } catch (error) {
        console.error('Failed to load customize services', error);
      }
    };

    fetchCustomizeServices();
  }, []);

  const groupedServices = useMemo(() => {
    return services.reduce((result, service) => {
      const category = service.customizeCategory || 'Other';
      const subcategory = service.customizeSubcategory || '';

      if (!result[category]) {
        result[category] = {
          subcategories: {},
          items: []
        };
      }

      if (subcategory) {
        if (!result[category].subcategories[subcategory]) {
          result[category].subcategories[subcategory] = [];
        }
        result[category].subcategories[subcategory].push(service);
      } else {
        result[category].items.push(service);
      }

      return result;
    }, {});
  }, [services]);

  useEffect(() => {
    const nextOpen = {};
    Object.keys(groupedServices).forEach((category) => {
      nextOpen[`category-${category}`] = true;
      Object.keys(groupedServices[category].subcategories).forEach((subcategory) => {
        nextOpen[`subcategory-${category}-${subcategory}`] = false;
      });
    });
    setOpenSections((prev) => ({ ...nextOpen, ...prev }));
  }, [groupedServices]);

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

          {Object.entries(groupedServices).length === 0 ? (
          <div className="sidebar-section">
            <p className="admin-empty-state">No customize services available.</p>
          </div>
        ) : (
          Object.entries(groupedServices).map(([category, group]) => {
            const categoryKey = `category-${category}`;
            return (
              <div className="sidebar-section" key={category}>
                <h3
                  onClick={() =>
                    setOpenSections((s) => ({
                      ...s,
                      [categoryKey]: !s[categoryKey]
                    }))
                  }
                >
                  {category}
                </h3>

                {openSections[categoryKey] && (
                  <>
                    {group.items.map((item) => (
                      <ItemRow
                        key={item.id || item.name}
                        item={item}
                        quantity={getCartQty(item.name)}
                        onChange={updateQty}
                      />
                    ))}

                    {Object.entries(group.subcategories).map(([subcategory, items]) => {
                      const subcategoryKey = `subcategory-${category}-${subcategory}`;
                      return (
                        <div key={subcategory}>
                          <h4
                            onClick={() =>
                              setOpenSections((s) => ({
                                ...s,
                                [subcategoryKey]: !s[subcategoryKey]
                              }))
                            }
                          >
                            {subcategory}
                          </h4>

                          {openSections[subcategoryKey] &&
                            items.map((item) => (
                              <ItemRow
                                key={item.id || item.name}
                                item={item}
                                quantity={getCartQty(item.name)}
                                onChange={updateQty}
                              />
                            ))}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            );
          })
        )}

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


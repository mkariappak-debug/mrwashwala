import React from "react";
import Pricing from "../components/Pricing";
import CustomizeSidebar from "../components/CustomizeSidebar";
import Cart from "../components/Cart";
import CheckoutModal from "../components/CheckoutModal";

export default function ServicesPage({
  cart,
  onUpdateQuantity,
  isCustomizeOpen,
  onOpenCustomize,
  onCloseCustomize,
  onRemoveItem,
  onOpenCheckout,
  isCheckoutOpen,
  onCloseCheckout
}) {
  return (
    <>
      <Pricing cart={cart} onUpdateQuantity={onUpdateQuantity} onCustomize={onOpenCustomize} />
      <CustomizeSidebar
        isOpen={isCustomizeOpen}
        onClose={onCloseCustomize}
        onUpdateQuantity={onUpdateQuantity}
        cart={cart}
      />

      <Cart
        cart={cart}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        onCheckout={onOpenCheckout}
      />

      <CheckoutModal open={isCheckoutOpen} cart={cart} onClose={onCloseCheckout} />
    </>
  );
}

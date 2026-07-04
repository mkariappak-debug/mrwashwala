import React from "react";
import Cart from "../components/Cart";
import CheckoutModal from "../components/CheckoutModal";

export default function CartPage({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
  isCheckoutOpen,
  onCloseCheckout
}) {
  return (
    <>
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

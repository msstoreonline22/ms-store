import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import api from "../api/axios";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import { useCart } from "../context/CartContext";
import { calculateCartTotals } from "../utils/calculateCartTotals";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const { data: activeOffer } = useQuery({
    queryKey: ["active-offer"],
    queryFn: async () => {
      const res = await api.get("/offers/active");
      return res.data.offer;
    },
  });

  const totals = calculateCartTotals(cartItems, 0, 0, activeOffer);

  if (!cartItems.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-ms-navy shadow-sm">
          <ShoppingBag size={26} />
        </div>

        <h1 className="mt-6 text-3xl font-black text-ms-navy">
          Your cart is empty
        </h1>

        <p className="mt-3 text-ms-muted">
          Start building your fit from the latest MS Store drop.
        </p>

        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-full bg-ms-navy px-7 py-4 text-sm font-black text-white transition hover:bg-ms-blue"
        >
          Shop now
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Link
        to="/shop"
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-ms-muted transition hover:text-ms-navy"
      >
        <ArrowLeft size={16} />
        Continue shopping
      </Link>

      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
          Cart
        </p>
        <h1 className="mt-2 text-4xl font-black text-ms-navy">
          Your selected pieces
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <CartItem
              key={item.cartKey}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>

        <CartSummary totals={totals} activeOffer={activeOffer} />
      </div>
    </section>
  );
}
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CreditCard, Tag, Truck, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { calculateCartTotals } from "../utils/calculateCartTotals";
import { formatCurrency } from "../utils/formatCurrency";
import { getImageUrl } from "../utils/getImageUrl";
import { GOVERNORATES, getDeliveryZone } from "../utils/constants";

const initialForm = {
  fullName: "",
  phone: "",
  secondPhone: "",
  email: "",
  governorate: "",
  city: "",
  address: "",
  notes: "",
  paymentMethod: "cash",
};

const DEFAULT_INSTAPAY_NUMBER = "01210439134";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();

  const [formData, setFormData] = useState(initialForm);
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscountCode, setAppliedDiscountCode] = useState(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await api.get("/settings");
      return res.data.settings;
    },
  });

  const { data: activeOffer } = useQuery({
    queryKey: ["active-offer"],
    queryFn: async () => {
      const res = await api.get("/offers/active");
      return res.data.offer;
    },
  });

  useEffect(() => {
    if (user) {
      setFormData((current) => ({
        ...current,
        fullName: current.fullName || user.name || "",
        phone: current.phone || user.phone || "",
        email: current.email || user.email || "",
      }));
    }
  }, [user]);

  const deliveryZone = getDeliveryZone(formData.governorate);

  const deliveryFee = useMemo(() => {
    if (!settings?.deliveryFees) return 0;

    return deliveryZone === "cairoGiza"
      ? settings.deliveryFees.cairoGiza
      : settings.deliveryFees.otherGovernorates;
  }, [settings, deliveryZone]);

  const baseTotals = calculateCartTotals(cartItems, deliveryFee, 0, activeOffer);

  const totals = calculateCartTotals(
    cartItems,
    deliveryFee,
    appliedDiscountCode?.amount || 0,
    activeOffer
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!cartItems.length) return "Your cart is empty";
    if (!formData.fullName.trim()) return "Full name is required";
    if (!formData.phone.trim()) return "Phone number is required";
    if (!formData.governorate) return "Governorate is required";
    if (!formData.city.trim()) return "City / area is required";
    if (!formData.address.trim()) return "Full address is required";

    return "";
  };

  const handleApplyDiscount = async () => {
    if (!discountInput.trim()) {
      toast.error("Enter a discount code");
      return;
    }

    try {
      setIsApplyingDiscount(true);

      const res = await api.post("/discount-codes/validate", {
        code: discountInput,
        subtotalAfterOffer: baseTotals.subtotalAfterOffer,
      });

      setAppliedDiscountCode(res.data.discountCode);
      toast.success(res.data.message || "Discount code applied");
    } catch (error) {
      setAppliedDiscountCode(null);
      toast.error(error.response?.data?.message || "Invalid discount code");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscountCode(null);
    setDiscountInput("");
    toast.success("Discount code removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();

    if (error) {
      toast.error(error);
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        customerInfo: {
          fullName: formData.fullName,
          phone: formData.phone,
          secondPhone: formData.secondPhone,
          email: formData.email,
          governorate: formData.governorate,
          city: formData.city,
          address: formData.address,
          notes: formData.notes,
        },
        items: cartItems,
        paymentMethod: formData.paymentMethod,
        deliveryZone,
        discountCode: appliedDiscountCode
          ? {
              code: appliedDiscountCode.code,
            }
          : null,
      };

      const res = await api.post("/orders", payload);

      clearCart();

      toast.success("Order placed successfully");

      navigate(`/order-success?order=${res.data.order.orderNumber}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to place order. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cartItems.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
        <h1 className="text-3xl font-black text-ms-navy">
          Your cart is empty
        </h1>
        <p className="mt-3 text-ms-muted">
          Add products first before checkout.
        </p>

        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-full bg-ms-navy px-7 py-4 text-sm font-black text-white"
        >
          Shop now
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Link
        to="/cart"
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-ms-muted transition hover:text-ms-navy"
      >
        <ArrowLeft size={16} />
        Back to cart
      </Link>

      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
          Checkout
        </p>
        <h1 className="mt-2 text-4xl font-black text-ms-navy">
          Confirm your order
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-ms-navy">
              Contact details
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full name *"
                className="rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy"
              />

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number *"
                className="rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy"
              />

              <input
                name="secondPhone"
                value={formData.secondPhone}
                onChange={handleChange}
                placeholder="Second phone optional"
                className="rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy"
              />

              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email optional"
                className="rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-ms-navy">
              Delivery address
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <select
                name="governorate"
                value={formData.governorate}
                onChange={handleChange}
                className="rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy"
              >
                <option value="">Governorate *</option>
                {GOVERNORATES.map((governorate) => (
                  <option key={governorate} value={governorate}>
                    {governorate}
                  </option>
                ))}
              </select>

              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City / area *"
                className="rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy"
              />

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address *"
                rows="4"
                className="rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy md:col-span-2"
              />

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Order notes optional"
                rows="3"
                className="rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy md:col-span-2"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-ms-navy">
              Payment method
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label
                className={`cursor-pointer rounded-2xl border p-5 transition ${
                  formData.paymentMethod === "cash"
                    ? "border-ms-navy bg-ms-cream"
                    : "border-ms-border"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === "cash"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <Truck className="text-ms-navy" size={22} />
                <p className="mt-3 font-black text-ms-navy">
                  Cash on delivery
                </p>
                <p className="mt-1 text-sm text-ms-muted">
                  Pay when your order arrives.
                </p>
              </label>

              <label
                className={`cursor-pointer rounded-2xl border p-5 transition ${
                  formData.paymentMethod === "instapay"
                    ? "border-ms-navy bg-ms-cream"
                    : "border-ms-border"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="instapay"
                  checked={formData.paymentMethod === "instapay"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <CreditCard className="text-ms-navy" size={22} />
                <p className="mt-3 font-black text-ms-navy">InstaPay</p>
                <p className="mt-1 text-sm text-ms-muted">
                  Transfer before confirmation.
                </p>
              </label>
            </div>

            {formData.paymentMethod === "instapay" && (
              <div className="mt-5 rounded-2xl bg-ms-cream p-5">
                <p className="text-sm font-bold text-ms-navy">
                  InstaPay number:
                </p>
                <p className="mt-2 text-lg font-black text-ms-navy">
                  {settings?.instapayNumber || DEFAULT_INSTAPAY_NUMBER}
                </p>
                <p className="mt-2 text-sm text-ms-muted">
                  After placing the order, MS Store will confirm the payment
                  details with you.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm lg:sticky lg:top-28">
          <h2 className="text-xl font-black text-ms-navy">Order summary</h2>

          {activeOffer?.isActive && (
            <div className="mt-5 rounded-2xl bg-ms-cream p-4">
              <p className="text-sm font-black text-ms-navy">
                {activeOffer.title}
              </p>
              {activeOffer.description && (
                <p className="mt-1 text-xs leading-5 text-ms-muted">
                  {activeOffer.description}
                </p>
              )}
            </div>
          )}

          <div className="mt-5 space-y-4">
            {cartItems.map((item) => (
              <div key={item.cartKey} className="flex gap-3">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="h-16 w-16 shrink-0 rounded-2xl bg-ms-cream object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ms-navy">
                    {item.name}
                  </p>
                  <p className="text-xs text-ms-muted">
                    {item.quantity} x {item.size}
{item.color && item.color !== "Default" ? ` / ${item.color}` : ""}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-bold text-ms-navy">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-ms-cream p-4">
            <p className="text-sm font-black text-ms-navy">Discount code</p>

            {appliedDiscountCode ? (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
                <div>
                  <p className="text-sm font-black text-ms-navy">
                    {appliedDiscountCode.code}
                  </p>
                  <p className="text-xs text-green-700">
                    Saved {formatCurrency(appliedDiscountCode.amount)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={removeDiscount}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-600 hover:bg-red-50"
                  aria-label="Remove discount"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <input
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  placeholder="Enter code"
                  className="min-w-0 flex-1 rounded-full border border-ms-border bg-white px-4 py-3 text-sm uppercase outline-none focus:border-ms-navy"
                />

                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={isApplyingDiscount}
                  className="inline-flex items-center gap-2 rounded-full bg-ms-navy px-4 py-3 text-sm font-black text-white transition hover:bg-ms-blue disabled:bg-ms-muted"
                >
                  <Tag size={16} />
                  {isApplyingDiscount ? "..." : "Apply"}
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4 border-t border-ms-border pt-5 text-sm">
            <div className="flex justify-between text-ms-muted">
              <span>Normal subtotal</span>
              <span className="font-bold text-ms-navy">
                {formatCurrency(totals.normalSubtotal)}
              </span>
            </div>

            {totals.offerDiscount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>{totals.offerTitle || "Offer discount"}</span>
                <span className="font-bold">
                  - {formatCurrency(totals.offerDiscount)}
                </span>
              </div>
            )}

            {totals.discountCodeAmount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount code</span>
                <span className="font-bold">
                  - {formatCurrency(totals.discountCodeAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-ms-muted">
              <span>Subtotal</span>
              <span className="font-bold text-ms-navy">
                {formatCurrency(totals.subtotalAfterDiscountCode)}
              </span>
            </div>

            <div className="flex justify-between text-ms-muted">
              <span>Delivery</span>
              <span className="font-bold text-ms-navy">
                {formData.governorate
                  ? formatCurrency(deliveryFee)
                  : "Select governorate"}
              </span>
            </div>

            <div className="flex justify-between border-t border-ms-border pt-4">
              <span className="text-base font-black text-ms-navy">Total</span>
              <span className="text-base font-black text-ms-navy">
                {formatCurrency(totals.total)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-full bg-ms-navy px-6 py-4 text-sm font-black text-white transition hover:bg-ms-blue disabled:cursor-not-allowed disabled:bg-ms-muted"
          >
            {isSubmitting ? "Placing order..." : "Place order"}
          </button>
        </aside>
      </form>
    </section>
  );
}

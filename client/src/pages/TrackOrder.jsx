import { useState } from "react";
import { Link } from "react-router-dom";
import { PackageSearch, Search } from "lucide-react";
import toast from "react-hot-toast";

import api from "../api/axios";
import { formatCurrency } from "../utils/formatCurrency";
import { getImageUrl } from "../utils/getImageUrl";
import { formatOrderStatus, getOrderStatusClass } from "../utils/constants";

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackOrder = async (e) => {
    e.preventDefault();

    const cleanOrderNumber = orderNumber.trim().toUpperCase();

    if (!cleanOrderNumber) {
      toast.error("Enter your order number");
      return;
    }

    try {
      setIsLoading(true);
      setOrder(null);

      const res = await api.get(`/orders/track/${cleanOrderNumber}`);

      setOrder(res.data.order);
      toast.success("Order found");
    } catch (error) {
      setOrder(null);
      toast.error(error.response?.data?.message || "Order not found");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-ms-navy shadow-sm">
          <PackageSearch size={27} />
        </div>

        <p className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
          Track order
        </p>

        <h1 className="mt-2 text-4xl font-black text-ms-navy md:text-5xl">
          Check your order status
        </h1>

        <p className="mt-4 text-sm leading-6 text-ms-muted">
          Enter your order number, like <strong>MS-1001</strong>, to see the
          current status and order details.
        </p>
      </div>

      <form
        onSubmit={handleTrackOrder}
        className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-[2rem] border border-ms-border bg-white p-4 shadow-sm sm:flex-row"
      >
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Enter order number e.g. MS-1001"
          className="min-w-0 flex-1 rounded-full border border-ms-border bg-ms-cream px-5 py-4 text-sm font-bold uppercase text-ms-navy outline-none focus:border-ms-navy"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ms-navy px-7 py-4 text-sm font-black text-white transition hover:bg-ms-blue disabled:cursor-not-allowed disabled:bg-ms-muted"
        >
          <Search size={17} />
          {isLoading ? "Searching..." : "Track"}
        </button>
      </form>

      {order && (
        <div className="mt-10 rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-ms-border pb-6 md:flex-row md:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-black text-ms-navy">
                  {order.orderNumber}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${getOrderStatusClass(
                    order.status
                  )}`}
                >
                  {formatOrderStatus(order.status)}
                </span>
              </div>

              <p className="mt-2 text-sm text-ms-muted">
                Placed on {new Date(order.createdAt).toLocaleString("en-EG")}
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ms-muted">
                Total
              </p>
              <p className="mt-1 text-3xl font-black text-ms-navy">
                {formatCurrency(order.total)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Info label="Customer" value={order.customerInfo?.fullName} />
            <Info label="Phone" value={order.customerInfo?.phone} />
            <Info label="Payment" value={order.paymentMethod} />
            <Info label="Governorate" value={order.customerInfo?.governorate} />
            <Info label="City / Area" value={order.customerInfo?.city} />
            <Info label="Delivery" value={formatCurrency(order.deliveryFee)} />
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-black text-ms-navy">Products</h3>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {order.items.map((item) => (
                <div
                  key={`${item.product}-${item.size}-${item.color}`}
                  className="flex gap-3 rounded-2xl bg-ms-cream p-3"
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-ms-navy">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-ms-muted">
                      {item.quantity} x {item.size}
                      {item.color && item.color !== "Default"
                        ? ` / ${item.color}`
                        : ""}
                    </p>

                    <p className="mt-1 text-xs font-bold text-ms-navy">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[2rem] bg-ms-cream p-5">
            <h3 className="text-lg font-black text-ms-navy">Payment summary</h3>

            <div className="mt-4 space-y-3 text-sm">
              <Row
                label="Normal subtotal"
                value={formatCurrency(order.normalSubtotal)}
              />

              {order.offerDiscount > 0 && (
                <Row
                  label="Offer discount"
                  value={`- ${formatCurrency(order.offerDiscount)}`}
                />
              )}

              {order.discountCode?.amount > 0 && (
                <Row
                  label={`Code ${order.discountCode.code}`}
                  value={`- ${formatCurrency(order.discountCode.amount)}`}
                />
              )}

              <Row
                label="Subtotal"
                value={formatCurrency(
                  order.subtotalAfterDiscountCode ?? order.subtotalAfterOffer
                )}
              />

              <Row label="Delivery" value={formatCurrency(order.deliveryFee)} />

              <div className="border-t border-ms-border pt-3">
                <Row label="Total" value={formatCurrency(order.total)} strong />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/shop"
              className="inline-flex justify-center rounded-full bg-ms-navy px-7 py-4 text-sm font-black text-white transition hover:bg-ms-blue"
            >
              Continue shopping
            </Link>

            <Link
              to="/"
              className="inline-flex justify-center rounded-full border border-ms-border bg-white px-7 py-4 text-sm font-black text-ms-navy transition hover:bg-ms-cream"
            >
              Back home
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-ms-cream p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-ms-muted">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold capitalize text-ms-navy">
        {value || "N/A"}
      </p>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-ms-muted">{label}</span>
      <span
        className={`text-right ${
          strong ? "text-lg font-black text-ms-navy" : "font-bold text-ms-navy"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

import { Link } from "react-router-dom";
import { PackageSearch, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import api from "../api/axios";
import { formatCurrency } from "../utils/formatCurrency";
import { getImageUrl } from "../utils/getImageUrl";
import { formatOrderStatus, getOrderStatusClass } from "../utils/constants";

export default function MyOrders() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const res = await api.get("/orders/my-orders");
      return res.data.orders;
    },
  });

  const orders = data || [];

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <p className="text-ms-muted">Loading your orders...</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          Failed to load your orders. Please login again.
        </div>
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-ms-navy shadow-sm">
          <PackageSearch size={26} />
        </div>

        <h1 className="mt-6 text-3xl font-black text-ms-navy">
          No orders yet
        </h1>

        <p className="mt-3 text-ms-muted">
          Your orders will appear here once you place them while logged in.
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
    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
          My Orders
        </p>
        <h1 className="mt-2 text-4xl font-black text-ms-navy">
          Track your orders
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-ms-muted">
          Check your MS Store order status, payment method, and total.
        </p>
      </div>

      <div className="space-y-5">
        {orders.map((order) => (
          <div
            key={order._id}
            className="rounded-[2rem] border border-ms-border bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-black text-ms-navy">
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
                <p className="mt-1 text-2xl font-black text-ms-navy">
                  {formatCurrency(order.total)}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {order.items.map((item) => (
                <div
                  key={`${order._id}-${item.product}-${item.size}-${item.color}`}
                  className="flex gap-3 rounded-2xl bg-ms-cream p-3"
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-ms-navy">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-ms-muted">
                      {item.quantity} x {item.size}
{item.color && item.color !== "Default" ? ` / ${item.color}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 border-t border-ms-border pt-5 text-sm md:grid-cols-3">
              <Info label="Payment" value={order.paymentMethod} />
              <Info
                label="Delivery"
                value={formatCurrency(order.deliveryFee)}
              />
              <Info
                label="Discount"
                value={`- ${formatCurrency(order.discount || 0)}`}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-ms-cream p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-ms-muted">
        {label}
      </p>
      <p className="mt-1 font-bold capitalize text-ms-navy">{value}</p>
    </div>
  );
}

import {
  AlertTriangle,
  BarChart3,
  Package,
  Receipt,
  ShoppingBag,
  TicketPercent,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import api from "../../api/axios";
import StatCard from "../../components/admin/StatCard";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatOrderStatus, getOrderStatusClass } from "../../utils/constants";

export default function Analytics() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-detailed-analytics"],
    queryFn: async () => {
      const res = await api.get("/analytics/admin/details");
      return res.data.analytics;
    },
  });

  const analytics = data || {};
  const summary = analytics.summary || {};
  const revenueByDay = analytics.revenueByDay || [];
  const ordersByStatus = analytics.ordersByStatus || [];
  const bestSellers = analytics.bestSellers || [];
  const lowStockProducts = analytics.lowStockProducts || [];
  const topDiscountCodes = analytics.topDiscountCodes || [];

  const maxRevenue = Math.max(
    ...revenueByDay.map((day) => Number(day.revenue || 0)),
    1
  );

  if (isLoading) {
    return <p className="text-ms-muted">Loading analytics...</p>;
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
        Failed to load analytics. Make sure you are logged in as admin.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
          Analytics
        </p>
        <h2 className="mt-2 text-4xl font-black text-ms-navy">
          Store analytics
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ms-muted">
          Understand revenue, order performance, product sales, discount usage,
          and low-stock products.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total revenue"
          value={formatCurrency(summary.totalRevenue)}
          helper="Excludes cancelled orders"
          icon={BarChart3}
        />

        <StatCard
          title="Average order"
          value={formatCurrency(summary.averageOrderValue)}
          helper="Average paid order value"
          icon={Receipt}
        />

        <StatCard
          title="Completed orders"
          value={summary.completedOrderCount || 0}
          helper="All non-cancelled orders"
          icon={ShoppingBag}
        />

        <StatCard
          title="Cancelled orders"
          value={summary.cancelledOrders || 0}
          helper="Orders marked cancelled"
          icon={AlertTriangle}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h3 className="text-xl font-black text-ms-navy">
                Revenue last 7 days
              </h3>
              <p className="mt-1 text-sm text-ms-muted">
                Daily revenue from non-cancelled orders.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {revenueByDay.map((day) => {
              const width = Math.max(
                6,
                (Number(day.revenue || 0) / maxRevenue) * 100
              );

              return (
                <div key={day.date}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <div>
                      <p className="font-bold text-ms-navy">
                        {new Date(day.date).toLocaleDateString("en-EG", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                      <p className="text-xs text-ms-muted">
                        {day.orders} order{day.orders === 1 ? "" : "s"}
                      </p>
                    </div>

                    <p className="font-black text-ms-navy">
                      {formatCurrency(day.revenue)}
                    </p>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-ms-cream">
                    <div
                      className="h-full rounded-full bg-ms-navy"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black text-ms-navy">Orders by status</h3>
          <p className="mt-1 text-sm text-ms-muted">
            Current distribution of order statuses.
          </p>

          <div className="mt-6 space-y-3">
            {ordersByStatus.length > 0 ? (
              ordersByStatus.map((status) => (
                <div
                  key={status._id}
                  className="flex items-center justify-between rounded-2xl bg-ms-cream p-4"
                >
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${getOrderStatusClass(
                      status._id
                    )}`}
                  >
                    {formatOrderStatus(status._id)}
                  </span>

                  <span className="text-lg font-black text-ms-navy">
                    {status.count}
                  </span>
                </div>
              ))
            ) : (
              <EmptyText text="No orders yet." />
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ms-cream text-ms-navy">
              <Package size={21} />
            </div>
            <div>
              <h3 className="text-xl font-black text-ms-navy">
                Best-selling products
              </h3>
              <p className="text-sm text-ms-muted">
                Ranked by quantity sold.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {bestSellers.length > 0 ? (
              bestSellers.map((product, index) => (
                <div
                  key={product._id || product.name}
                  className="flex items-center gap-4 rounded-2xl bg-ms-cream p-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-ms-navy">
                    {index + 1}
                  </div>

                  <img
                    src={product.image || "/images/products/placeholder.webp"}
                    alt={product.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black text-ms-navy">
                      {product.name}
                    </p>
                    <p className="text-sm text-ms-muted">
                      {product.quantitySold} sold
                    </p>
                  </div>

                  <p className="font-black text-ms-navy">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))
            ) : (
              <EmptyText text="No product sales yet." />
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ms-cream text-ms-navy">
              <AlertTriangle size={21} />
            </div>
            <div>
              <h3 className="text-xl font-black text-ms-navy">
                Low-stock products
              </h3>
              <p className="text-sm text-ms-muted">
                Products with 3 or fewer items left.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-4 rounded-2xl bg-ms-cream p-4"
                >
                  <img
                    src={
                      product.images?.[0] ||
                      "/images/products/placeholder.webp"
                    }
                    alt={product.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black text-ms-navy">
                      {product.name}
                    </p>
                    <p className="text-sm text-ms-muted">
                      {formatCurrency(product.price)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      product.stock <= 0
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {product.stock} left
                  </span>
                </div>
              ))
            ) : (
              <EmptyText text="No low-stock products. Looking healthy." />
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ms-cream text-ms-navy">
            <TicketPercent size={21} />
          </div>
          <div>
            <h3 className="text-xl font-black text-ms-navy">
              Discount code usage
            </h3>
            <p className="text-sm text-ms-muted">
              Most used discount codes.
            </p>
          </div>
        </div>

        {topDiscountCodes.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-ms-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-ms-cream text-xs uppercase tracking-[0.16em] text-ms-muted">
                  <tr>
                    <th className="px-5 py-4">Code</th>
                    <th className="px-5 py-4">Discount</th>
                    <th className="px-5 py-4">Usage</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-ms-border">
                  {topDiscountCodes.map((code) => (
                    <tr key={code._id}>
                      <td className="px-5 py-4 font-black text-ms-navy">
                        {code.code}
                      </td>

                      <td className="px-5 py-4 text-ms-muted">
                        {code.type === "percentage"
                          ? `${code.value}%`
                          : formatCurrency(code.value)}
                      </td>

                      <td className="px-5 py-4 text-ms-muted">
                        {code.usedCount}
                        {code.usageLimit > 0
                          ? ` / ${code.usageLimit}`
                          : " / Unlimited"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            code.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {code.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyText text="No discount code usage yet." />
        )}
      </div>
    </div>
  );
}

function EmptyText({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-ms-border bg-ms-cream p-6 text-center text-sm text-ms-muted">
      {text}
    </div>
  );
}
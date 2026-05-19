import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Search, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../../api/axios";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  ORDER_STATUSES,
  formatOrderStatus,
  getOrderStatusClass,
} from "../../utils/constants";

export default function Orders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [orderToDelete, setOrderToDelete] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-orders", status, search],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (status !== "all") {
        params.append("status", status);
      }

      if (search.trim()) {
        params.append("search", search.trim());
      }

      const res = await api.get(`/orders/admin?${params.toString()}`);
      return res.data.orders;
    },
  });

  const orders = data || [];

  const deleteMutation = useMutation({
    mutationFn: async (orderId) => {
      const res = await api.delete(`/orders/admin/${orderId}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Order deleted successfully");
      setOrderToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete order");
    },
  });

  const handleDelete = (order) => {
    setOrderToDelete(order);
  };

  const totalRevenue = useMemo(() => {
    return orders
      .filter((order) => order.status !== "cancelled")
      .reduce((total, order) => total + Number(order.total || 0), 0);
  }, [orders]);

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
            Orders
          </p>
          <h2 className="mt-2 text-4xl font-black text-ms-navy">
            Manage orders
          </h2>
          <p className="mt-3 text-sm text-ms-muted">
            Review customer orders, filter by status, and update fulfillment.
          </p>
        </div>

        <div className="rounded-[2rem] border border-ms-border bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ms-muted">
            Current view revenue
          </p>
          <p className="mt-1 text-2xl font-black text-ms-navy">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 rounded-[2rem] border border-ms-border bg-white p-4 shadow-sm lg:grid-cols-[1fr_260px]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ms-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number, name, or phone..."
            className="w-full rounded-full border border-ms-border bg-ms-cream py-3 pl-11 pr-4 text-sm outline-none focus:border-ms-navy"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-full border border-ms-border bg-ms-cream px-4 py-3 text-sm font-bold text-ms-navy outline-none focus:border-ms-navy"
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-ms-muted">Loading orders...</p>}

      {isError && (
        <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          Failed to load orders. Make sure you are logged in as admin.
        </div>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <div className="rounded-[2rem] border border-dashed border-ms-border bg-white p-10 text-center">
          <h3 className="text-xl font-black text-ms-navy">No orders found</h3>
          <p className="mt-3 text-sm text-ms-muted">
            Orders will appear here once customers place them.
          </p>
        </div>
      )}

      {!isLoading && !isError && orders.length > 0 && (
        <>
          <div className="space-y-3 lg:hidden">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-[2rem] border border-ms-border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-ms-navy">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 truncate text-sm text-ms-muted">
                      {order.customerInfo?.fullName || "Customer"}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${getOrderStatusClass(
                      order.status
                    )}`}
                  >
                    {formatOrderStatus(order.status)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <OrderInfo
                    label="Total"
                    value={formatCurrency(order.total)}
                    strong
                  />
                  <OrderInfo
                    label="Date"
                    value={new Date(order.createdAt).toLocaleDateString("en-EG")}
                  />
                  <OrderInfo
                    label="Phone"
                    value={order.customerInfo?.phone || "N/A"}
                  />
                  <OrderInfo label="Payment" value={order.paymentMethod} />
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Link
                    to={`/admin/orders/${order._id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ms-navy px-5 py-3 text-sm font-black text-white transition hover:bg-ms-blue"
                  >
                    <Eye size={17} />
                    View order
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(order)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 size={17} />
                    Delete order
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-[2rem] border border-ms-border bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-ms-cream text-xs uppercase tracking-[0.16em] text-ms-muted">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ms-border text-sm">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-ms-cream/50">
                    <td className="px-5 py-4 font-black text-ms-navy">
                      {order.orderNumber}
                    </td>

                    <td className="px-5 py-4 text-ms-navy">
                      {order.customerInfo?.fullName}
                    </td>

                    <td className="px-5 py-4 text-ms-muted">
                      {order.customerInfo?.phone}
                    </td>

                    <td className="px-5 py-4 capitalize text-ms-muted">
                      {order.paymentMethod}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${getOrderStatusClass(
                          order.status
                        )}`}
                      >
                        {formatOrderStatus(order.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-black text-ms-navy">
                      {formatCurrency(order.total)}
                    </td>

                    <td className="px-5 py-4 text-ms-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-EG")}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ms-navy text-white transition hover:bg-ms-blue"
                        aria-label="View order"
                      >
                        <Eye size={17} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(order)}
                        disabled={deleteMutation.isPending}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Delete order"
                      >
                        <Trash2 size={17} />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(orderToDelete)}
        title="Delete order"
        description={`Delete order ${
          orderToDelete?.orderNumber || ""
        }? Stock will be restored automatically if needed.`}
        confirmLabel="Delete order"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onClose={() => setOrderToDelete(null)}
        onConfirm={() => deleteMutation.mutate(orderToDelete._id)}
      />
    </div>
  );
}

function OrderInfo({ label, value, strong }) {
  return (
    <div className="rounded-2xl bg-ms-cream p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ms-muted">
        {label}
      </p>
      <p
        className={`mt-1 break-words text-sm ${
          strong ? "font-black text-ms-navy" : "font-bold text-ms-navy"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

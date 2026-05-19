import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../../api/axios";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { formatCurrency } from "../../utils/formatCurrency";
import { getImageUrl } from "../../utils/getImageUrl";
import {
  ORDER_STATUSES,
  formatOrderStatus,
  getOrderStatusClass,
} from "../../utils/constants";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const res = await api.get(`/orders/admin/${id}`);
      const fetchedOrder = res.data.order;

      setStatus(fetchedOrder.status);
      setAdminNote(fetchedOrder.adminNote || "");

      return fetchedOrder;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put(`/orders/admin/${id}/status`, {
        status,
        adminNote,
      });

      return res.data.order;
    },
    onSuccess: () => {
      toast.success("Order updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update order");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/orders/admin/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Order deleted successfully");
      setShowDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      navigate("/admin/orders");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete order");
    },
  });

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  if (isLoading) {
    return <p className="text-ms-muted">Loading order...</p>;
  }

  if (isError || !order) {
    return (
      <div>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 text-sm font-bold text-ms-muted hover:text-ms-navy"
        >
          <ArrowLeft size={16} />
          Back to orders
        </Link>

        <div className="mt-8 rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          Failed to load order.
        </div>
      </div>
    );
  }

  const customer = order.customerInfo || {};

  return (
    <div>
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-bold text-ms-muted hover:text-ms-navy"
      >
        <ArrowLeft size={16} />
        Back to orders
      </Link>

      <div className="mt-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
            Order details
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-4xl font-black text-ms-navy">
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
          <p className="mt-3 text-sm text-ms-muted">
            Created on {new Date(order.createdAt).toLocaleString("en-EG")}
          </p>
        </div>

        <div className="rounded-[2rem] border border-ms-border bg-white px-6 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ms-muted">
            Order total
          </p>
          <p className="mt-1 text-3xl font-black text-ms-navy">
            {formatCurrency(order.total)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-ms-navy">Products</h3>

            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <div
                  key={`${item.product}-${item.size}-${item.color}`}
                  className="grid gap-4 rounded-3xl bg-ms-cream p-4 sm:grid-cols-[90px_1fr_auto]"
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />

                  <div>
                    <p className="font-black text-ms-navy">{item.name}</p>
                    <p className="mt-2 text-sm text-ms-muted">
  Size:{" "}
  <span className="font-bold text-ms-navy">
    {item.size}
  </span>
  {item.color && item.color !== "Default" && (
    <>
      {" · "}
      Color:{" "}
      <span className="font-bold text-ms-navy">
        {item.color}
      </span>
    </>
  )}
</p>
                    <p className="mt-1 text-sm text-ms-muted">
                      Quantity:{" "}
                      <span className="font-bold text-ms-navy">
                        {item.quantity}
                      </span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-ms-muted">Line total</p>
                    <p className="mt-1 font-black text-ms-navy">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-ms-navy">
              Customer details
            </h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Info label="Name" value={customer.fullName} />
              <Info label="Phone" value={customer.phone} />
              <Info label="Second phone" value={customer.secondPhone || "N/A"} />
              <Info label="Email" value={customer.email || "N/A"} />
              <Info label="Governorate" value={customer.governorate} />
              <Info label="City / Area" value={customer.city} />
              <div className="md:col-span-2">
                <Info label="Full address" value={customer.address} />
              </div>
              <div className="md:col-span-2">
                <Info label="Customer notes" value={customer.notes || "N/A"} />
              </div>
            </div>
          </div>
        </div>

        <aside className="h-fit space-y-6 xl:sticky xl:top-28">
          <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-ms-navy">
              Update order
            </h3>

            <p className="mt-2 text-sm leading-6 text-ms-muted">
  Changing the order status will email the customer if they entered an email.
</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-bold text-ms-navy">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm font-bold text-ms-navy outline-none focus:border-ms-navy"
                >
                  {ORDER_STATUSES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-ms-navy">
                  Admin note
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows="4"
                  placeholder="Private note for this order..."
                  className="mt-2 w-full rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy"
                />
              </div>

              <button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ms-navy px-6 py-4 text-sm font-black text-white transition hover:bg-ms-blue disabled:cursor-not-allowed disabled:bg-ms-muted"
              >
                <Save size={17} />
                {updateMutation.isPending ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-red-100 bg-red-50 p-6 shadow-sm">
            <h3 className="text-xl font-black text-red-800">Delete order</h3>
            <p className="mt-2 text-sm leading-6 text-red-700">
              This permanently removes the order. Stock will be restored
              automatically if it has not already been restored.
            </p>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-700 px-6 py-4 text-sm font-black text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              <Trash2 size={17} />
              {deleteMutation.isPending ? "Deleting..." : "Delete order"}
            </button>
          </div>

          <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-ms-navy">Payment</h3>

            <div className="mt-5 space-y-3 text-sm">
              <Row label="Payment method" value={order.paymentMethod} />
              <Row label="Normal subtotal" value={formatCurrency(order.normalSubtotal)} />
<Row
  label="Offer discount"
  value={`- ${formatCurrency(order.offerDiscount || 0)}`}
/>
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
        </aside>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete order"
        description={`Delete order ${order.orderNumber}? Stock will be restored automatically if needed.`}
        confirmLabel="Delete order"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-ms-cream p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-ms-muted">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-bold text-ms-navy">
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

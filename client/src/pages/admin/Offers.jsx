import { useEffect, useMemo, useState } from "react";
import { Mail, Power, Save, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../../api/axios";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { formatCurrency } from "../../utils/formatCurrency";

const emptyForm = {
  title: "3 T-Shirts for 1000 EGP",
  description: "Buy any 3 MS Store graphic t-shirts for only 1000 EGP.",
  requiredQuantity: 3,
  offerPrice: 1000,
  appliesToAllProducts: true,
  products: [],
  isActive: true,
};

export default function Offers() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);

  const {
    data: offersData,
    isLoading: offersLoading,
    isError: offersError,
  } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => {
      const res = await api.get("/offers/admin");
      return res.data.offers;
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ["admin-products-for-offers"],
    queryFn: async () => {
      const res = await api.get("/products/admin");
      return res.data.products;
    },
  });

  const offers = offersData || [];
  const products = productsData || [];

  const selectedProducts = useMemo(() => {
    return products.filter((product) => formData.products.includes(product._id));
  }, [products, formData.products]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: formData.title,
        description: formData.description,
        requiredQuantity: Number(formData.requiredQuantity),
        offerPrice: Number(formData.offerPrice),
        appliesToAllProducts: formData.appliesToAllProducts,
        products: formData.appliesToAllProducts ? [] : formData.products,
        isActive: formData.isActive,
      };

      if (editingId) {
        const res = await api.put(`/offers/admin/${editingId}`, payload);
        return res.data;
      }

      const res = await api.post("/offers/admin", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Offer saved successfully");

      setEditingId("");
      setFormData(emptyForm);

      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      queryClient.invalidateQueries({ queryKey: ["active-offer"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save offer");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.patch(`/offers/admin/${id}/toggle-status`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Offer updated");
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      queryClient.invalidateQueries({ queryKey: ["active-offer"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update offer");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/offers/admin/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Offer deleted successfully");
      setConfirmDialog(null);
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      queryClient.invalidateQueries({ queryKey: ["active-offer"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete offer");
    },
  });

  const sendEmailMutation = useMutation({
  mutationFn: async (id) => {
    const res = await api.post(`/offers/admin/${id}/send-email`);
    return res.data;
  },
  onSuccess: (data) => {
    toast.success(data.message || "Offer email sent");
    setConfirmDialog(null);
  },
  onError: (error) => {
    toast.error(error.response?.data?.message || "Failed to send offer email");
  },
});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleProductSelection = (productId) => {
    setFormData((current) => {
      const alreadySelected = current.products.includes(productId);

      return {
        ...current,
        products: alreadySelected
          ? current.products.filter((id) => id !== productId)
          : [...current.products, productId],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Offer title is required");
      return;
    }

    if (Number(formData.requiredQuantity) <= 0) {
      toast.error("Required quantity must be more than 0");
      return;
    }

    if (Number(formData.offerPrice) < 0) {
      toast.error("Offer price cannot be negative");
      return;
    }

    if (!formData.appliesToAllProducts && formData.products.length === 0) {
      toast.error("Select products or apply offer to all products");
      return;
    }

    saveMutation.mutate();
  };

  const handleEdit = (offer) => {
    setEditingId(offer._id);

    setFormData({
      title: offer.title || "",
      description: offer.description || "",
      requiredQuantity: offer.requiredQuantity || 3,
      offerPrice: offer.offerPrice || 1000,
      appliesToAllProducts: Boolean(offer.appliesToAllProducts),
      products: Array.isArray(offer.products)
        ? offer.products.map((product) => product._id || product)
        : [],
      isActive: Boolean(offer.isActive),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId("");
    setFormData(emptyForm);
  };

  const handleDelete = (offer) => {
    setConfirmDialog({ type: "delete", offer });
  };

  const handleSendEmail = (offer) => {
  setConfirmDialog({ type: "send-email", offer });
};

  useEffect(() => {
    if (formData.appliesToAllProducts && formData.products.length > 0) {
      setFormData((current) => ({
        ...current,
        products: [],
      }));
    }
  }, [formData.appliesToAllProducts, formData.products.length]);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
          Offers
        </p>
        <h2 className="mt-2 text-4xl font-black text-ms-navy">
          Manage offers
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ms-muted">
          Create bundle offers like “3 T-Shirts for 1000 EGP” and choose whether
          they apply to all products or selected products only.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm xl:sticky xl:top-28"
        >
          <h3 className="text-xl font-black text-ms-navy">
            {editingId ? "Edit offer" : "Create offer"}
          </h3>

          <div className="mt-6 space-y-4">
            <Field
              label="Offer title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="3 T-Shirts for 1000 EGP"
            />

            <div>
              <label className="text-sm font-bold text-ms-navy">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Offer description..."
                className="mt-2 w-full rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Required quantity"
                name="requiredQuantity"
                type="number"
                value={formData.requiredQuantity}
                onChange={handleChange}
                placeholder="3"
              />

              <Field
                label="Offer price"
                name="offerPrice"
                type="number"
                value={formData.offerPrice}
                onChange={handleChange}
                placeholder="1000"
              />
            </div>

            <label className="flex items-center gap-2 rounded-2xl bg-ms-cream px-4 py-3 text-sm font-bold text-ms-navy">
              <input
                type="checkbox"
                name="appliesToAllProducts"
                checked={formData.appliesToAllProducts}
                onChange={handleChange}
              />
              Apply to all products
            </label>

            <label className="flex items-center gap-2 rounded-2xl bg-ms-cream px-4 py-3 text-sm font-bold text-ms-navy">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active
            </label>

            {!formData.appliesToAllProducts && (
              <div className="rounded-2xl border border-ms-border p-4">
                <p className="text-sm font-black text-ms-navy">
                  Select products
                </p>

                <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
                  {products.map((product) => (
                    <label
                      key={product._id}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl bg-ms-cream p-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={formData.products.includes(product._id)}
                        onChange={() => toggleProductSelection(product._id)}
                      />

                      <img
                        src={product.images?.[0] || "/images/products/placeholder.webp"}
                        alt={product.name}
                        className="h-10 w-10 rounded-xl object-cover"
                      />

                      <span className="font-bold text-ms-navy">
                        {product.name}
                      </span>
                    </label>
                  ))}
                </div>

                {selectedProducts.length > 0 && (
                  <p className="mt-3 text-xs text-ms-muted">
                    Selected: {selectedProducts.length} product
                    {selectedProducts.length === 1 ? "" : "s"}
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ms-navy px-6 py-4 text-sm font-black text-white transition hover:bg-ms-blue disabled:cursor-not-allowed disabled:bg-ms-muted"
          >
            <Save size={17} />
            {saveMutation.isPending
              ? "Saving..."
              : editingId
              ? "Save changes"
              : "Create offer"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="mt-3 w-full rounded-full border border-ms-border bg-white px-6 py-4 text-sm font-black text-ms-navy transition hover:bg-ms-cream"
            >
              Cancel edit
            </button>
          )}
        </form>

        <div>
          {offersLoading && <p className="text-ms-muted">Loading offers...</p>}

          {offersError && (
            <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
              Failed to load offers.
            </div>
          )}

          {!offersLoading && !offersError && offers.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-ms-border bg-white p-10 text-center">
              <h3 className="text-xl font-black text-ms-navy">
                No offers yet
              </h3>
              <p className="mt-3 text-sm text-ms-muted">
                Create your first bundle offer from the form.
              </p>
            </div>
          )}

          {!offersLoading && !offersError && offers.length > 0 && (
            <div className="space-y-4">
              {offers.map((offer) => (
                <div
                  key={offer._id}
                  className="rounded-[2rem] border border-ms-border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => handleEdit(offer)}
                          className="text-left text-xl font-black text-ms-navy hover:text-ms-blue"
                        >
                          {offer.title}
                        </button>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            offer.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {offer.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-ms-muted">
                        {offer.description || "No description"}
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <Info
                          label="Required quantity"
                          value={offer.requiredQuantity}
                        />
                        <Info
                          label="Offer price"
                          value={formatCurrency(offer.offerPrice)}
                        />
                        <Info
                          label="Applies to"
                          value={
                            offer.appliesToAllProducts
                              ? "All products"
                              : `${offer.products?.length || 0} selected`
                          }
                        />
                      </div>

                      {!offer.appliesToAllProducts &&
                        offer.products?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {offer.products.map((product) => (
                              <span
                                key={product._id}
                                className="rounded-full bg-ms-cream px-3 py-1 text-xs font-bold text-ms-navy"
                              >
                                {product.name}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="flex gap-2">

                        <button
  onClick={() => handleSendEmail(offer)}
  disabled={sendEmailMutation.isPending}
  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-ms-navy transition hover:bg-ms-cream disabled:cursor-not-allowed disabled:opacity-50"
  aria-label="Email offer"
>
  <Mail size={17} />
</button>

                      <button
                        onClick={() => toggleMutation.mutate(offer._id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-ms-navy transition hover:bg-ms-cream"
                        aria-label="Toggle offer"
                      >
                        <Power size={17} />
                      </button>

                      <button
                        onClick={() => handleDelete(offer)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-red-600 transition hover:bg-red-50"
                        aria-label="Delete offer"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmDialog)}
        title={
          confirmDialog?.type === "delete" ? "Delete offer" : "Email offer"
        }
        description={
          confirmDialog?.type === "delete"
            ? `Delete offer "${
                confirmDialog?.offer?.title || "this offer"
              }"? This cannot be undone.`
            : `Send offer "${
                confirmDialog?.offer?.title || "this offer"
              }" to all registered customers with emails?`
        }
        confirmLabel={
          confirmDialog?.type === "delete" ? "Delete offer" : "Send email"
        }
        variant={confirmDialog?.type === "delete" ? "danger" : "default"}
        isLoading={
          confirmDialog?.type === "delete"
            ? deleteMutation.isPending
            : sendEmailMutation.isPending
        }
        onClose={() => setConfirmDialog(null)}
        onConfirm={() => {
          if (confirmDialog?.type === "delete") {
            deleteMutation.mutate(confirmDialog.offer._id);
            return;
          }

          sendEmailMutation.mutate(confirmDialog.offer._id);
        }}
      />
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="text-sm font-bold text-ms-navy">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={type === "number" ? 0 : undefined}
        className="mt-2 w-full rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy"
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
      <p className="mt-1 font-black text-ms-navy">{value}</p>
    </div>
  );
}

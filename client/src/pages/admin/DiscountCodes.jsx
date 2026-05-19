import { useState } from "react";
import { Mail, Power, Save, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../../api/axios";
import { formatCurrency } from "../../utils/formatCurrency";

const emptyForm = {
  code: "",
  type: "percentage",
  value: "",
  minOrderAmount: 0,
  usageLimit: 0,
  expiresAt: "",
  isActive: true,
};

export default function DiscountCodes() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-discount-codes"],
    queryFn: async () => {
      const res = await api.get("/discount-codes/admin");
      return res.data.discountCodes;
    },
  });

  const discountCodes = data || [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        code: formData.code,
        type: formData.type,
        value: Number(formData.value),
        minOrderAmount: Number(formData.minOrderAmount || 0),
        usageLimit: Number(formData.usageLimit || 0),
        expiresAt: formData.expiresAt || null,
        isActive: formData.isActive,
      };

      if (editingId) {
        const res = await api.put(`/discount-codes/admin/${editingId}`, payload);
        return res.data;
      }

      const res = await api.post("/discount-codes/admin", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Discount code saved");
      setFormData(emptyForm);
      setEditingId("");
      queryClient.invalidateQueries({ queryKey: ["admin-discount-codes"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save discount code");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.patch(`/discount-codes/admin/${id}/toggle-status`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Discount code updated");
      queryClient.invalidateQueries({ queryKey: ["admin-discount-codes"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update discount code");
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/discount-codes/admin/${id}/send-email`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Discount email sent");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send discount email");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/discount-codes/admin/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Discount code deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-discount-codes"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete discount code");
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error("Code is required");
      return;
    }

    if (formData.value === "" || Number(formData.value) <= 0) {
      toast.error("Discount value must be more than 0");
      return;
    }

    if (formData.type === "percentage" && Number(formData.value) > 100) {
      toast.error("Percentage discount cannot be more than 100%");
      return;
    }

    saveMutation.mutate();
  };

  const handleEdit = (discountCode) => {
    setEditingId(discountCode._id);
    setFormData({
      code: discountCode.code || "",
      type: discountCode.type || "percentage",
      value: discountCode.value || "",
      minOrderAmount: discountCode.minOrderAmount || 0,
      usageLimit: discountCode.usageLimit || 0,
      expiresAt: discountCode.expiresAt
        ? new Date(discountCode.expiresAt).toISOString().slice(0, 10)
        : "",
      isActive: Boolean(discountCode.isActive),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId("");
    setFormData(emptyForm);
  };

  const handleDelete = (discountCode) => {
    const confirmed = window.confirm(
      `Delete discount code "${discountCode.code}"? This cannot be undone.`
    );

    if (confirmed) {
      deleteMutation.mutate(discountCode._id);
    }
  };

  const handleSendEmail = (discountCode) => {
    const confirmed = window.confirm(
      `Send discount code "${discountCode.code}" to all registered customers with emails?`
    );

    if (confirmed) {
      sendEmailMutation.mutate(discountCode._id);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
          Discount codes
        </p>
        <h2 className="mt-2 text-4xl font-black text-ms-navy">
          Manage discount codes
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ms-muted">
          Create promo codes customers can apply during checkout and send them
          by email to registered customers.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm xl:sticky xl:top-28"
        >
          <h3 className="text-xl font-black text-ms-navy">
            {editingId ? "Edit discount code" : "Create discount code"}
          </h3>

          <div className="mt-6 space-y-4">
            <Field
              label="Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="MS10"
            />

            <div>
              <label className="text-sm font-bold text-ms-navy">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm font-bold text-ms-navy outline-none focus:border-ms-navy"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>

            <Field
              label={formData.type === "percentage" ? "Value %" : "Value EGP"}
              name="value"
              type="number"
              value={formData.value}
              onChange={handleChange}
              placeholder={formData.type === "percentage" ? "10" : "100"}
            />

            <Field
              label="Minimum order amount"
              name="minOrderAmount"
              type="number"
              value={formData.minOrderAmount}
              onChange={handleChange}
              placeholder="0"
            />

            <Field
              label="Usage limit"
              name="usageLimit"
              type="number"
              value={formData.usageLimit}
              onChange={handleChange}
              placeholder="0 means unlimited"
              helper="Use 0 for unlimited usage."
            />

            <Field
              label="Expiry date"
              name="expiresAt"
              type="date"
              value={formData.expiresAt}
              onChange={handleChange}
            />

            <label className="flex items-center gap-2 rounded-2xl bg-ms-cream px-4 py-3 text-sm font-bold text-ms-navy">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active
            </label>
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
              : "Create code"}
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
          {isLoading && <p className="text-ms-muted">Loading discount codes...</p>}

          {isError && (
            <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
              Failed to load discount codes.
            </div>
          )}

          {!isLoading && !isError && discountCodes.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-ms-border bg-white p-10 text-center">
              <h3 className="text-xl font-black text-ms-navy">
                No discount codes yet
              </h3>
              <p className="mt-3 text-sm text-ms-muted">
                Create your first code from the form.
              </p>
            </div>
          )}

          {!isLoading && !isError && discountCodes.length > 0 && (
            <>
              <div className="space-y-3 lg:hidden">
                {discountCodes.map((discountCode) => (
                  <div
                    key={discountCode._id}
                    className="rounded-[2rem] border border-ms-border bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(discountCode)}
                        className="min-w-0 text-left font-black text-ms-navy hover:text-ms-blue"
                      >
                        {discountCode.code}
                      </button>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                          discountCode.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {discountCode.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <CodeInfo
                        label="Discount"
                        value={
                          discountCode.type === "percentage"
                            ? `${discountCode.value}%`
                            : formatCurrency(discountCode.value)
                        }
                        strong
                      />
                      <CodeInfo
                        label="Minimum"
                        value={formatCurrency(discountCode.minOrderAmount)}
                      />
                      <CodeInfo
                        label="Usage"
                        value={`${discountCode.usedCount}${
                          discountCode.usageLimit > 0
                            ? ` / ${discountCode.usageLimit}`
                            : " / Unlimited"
                        }`}
                      />
                      <CodeInfo
                        label="Expiry"
                        value={
                          discountCode.expiresAt
                            ? new Date(
                                discountCode.expiresAt
                              ).toLocaleDateString("en-EG")
                            : "No expiry"
                        }
                      />
                    </div>

                    <div className="mt-4 flex justify-end gap-2 border-t border-ms-border pt-4">
                      <button
                        type="button"
                        onClick={() => handleSendEmail(discountCode)}
                        disabled={sendEmailMutation.isPending}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-ms-navy transition hover:bg-ms-cream disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Email discount code"
                      >
                        <Mail size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleMutation.mutate(discountCode._id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-ms-navy transition hover:bg-ms-cream"
                        aria-label="Toggle discount code"
                      >
                        <Power size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(discountCode)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-red-600 transition hover:bg-red-50"
                        aria-label="Delete discount code"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-[2rem] border border-ms-border bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead className="bg-ms-cream text-xs uppercase tracking-[0.16em] text-ms-muted">
                    <tr>
                      <th className="px-5 py-4">Code</th>
                      <th className="px-5 py-4">Discount</th>
                      <th className="px-5 py-4">Minimum</th>
                      <th className="px-5 py-4">Usage</th>
                      <th className="px-5 py-4">Expiry</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-ms-border text-sm">
                    {discountCodes.map((discountCode) => (
                      <tr key={discountCode._id} className="hover:bg-ms-cream/50">
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleEdit(discountCode)}
                            className="font-black text-ms-navy hover:text-ms-blue"
                          >
                            {discountCode.code}
                          </button>
                        </td>

                        <td className="px-5 py-4 font-bold text-ms-navy">
                          {discountCode.type === "percentage"
                            ? `${discountCode.value}%`
                            : formatCurrency(discountCode.value)}
                        </td>

                        <td className="px-5 py-4 text-ms-muted">
                          {formatCurrency(discountCode.minOrderAmount)}
                        </td>

                        <td className="px-5 py-4 text-ms-muted">
                          {discountCode.usedCount}
                          {discountCode.usageLimit > 0
                            ? ` / ${discountCode.usageLimit}`
                            : " / Unlimited"}
                        </td>

                        <td className="px-5 py-4 text-ms-muted">
                          {discountCode.expiresAt
                            ? new Date(discountCode.expiresAt).toLocaleDateString(
                                "en-EG"
                              )
                            : "No expiry"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              discountCode.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {discountCode.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleSendEmail(discountCode)}
                              disabled={sendEmailMutation.isPending}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-ms-navy transition hover:bg-ms-cream disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label="Email discount code"
                            >
                              <Mail size={17} />
                            </button>

                            <button
                              onClick={() =>
                                toggleMutation.mutate(discountCode._id)
                              }
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-ms-navy transition hover:bg-ms-cream"
                              aria-label="Toggle discount code"
                            >
                              <Power size={17} />
                            </button>

                            <button
                              onClick={() => handleDelete(discountCode)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-red-600 transition hover:bg-red-50"
                              aria-label="Delete discount code"
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
        </div>
      </div>
    </div>
  );
}

function CodeInfo({ label, value, strong }) {
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

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  helper,
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
      {helper && <p className="mt-2 text-xs text-ms-muted">{helper}</p>}
    </div>
  );
}

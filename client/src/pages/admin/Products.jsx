import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Edit, EyeOff, Plus, Search, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../../api/axios";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { formatCurrency } from "../../utils/formatCurrency";
import { getImageUrl } from "../../utils/getImageUrl";

export default function Products() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [productToDelete, setProductToDelete] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-products", search, status],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (status !== "all") {
        params.append("status", status);
      }

      const res = await api.get(`/products/admin?${params.toString()}`);
      return res.data.products;
    },
  });

  const products = data || [];

  const totalStock = useMemo(() => {
    return products.reduce((total, product) => total + Number(product.stock || 0), 0);
  }, [products]);

  const toggleMutation = useMutation({
    mutationFn: async (productId) => {
      const res = await api.patch(`/products/admin/${productId}/toggle-status`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Product updated");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["featured-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update product");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId) => {
      const res = await api.delete(`/products/admin/${productId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
      setProductToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["featured-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });

  const handleDelete = (product) => {
    setProductToDelete(product);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
            Products
          </p>
          <h2 className="mt-2 text-4xl font-black text-ms-navy">
            Manage products
          </h2>
          <p className="mt-3 text-sm text-ms-muted">
            Add, edit, hide, and organize MS Store products.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="rounded-[2rem] border border-ms-border bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ms-muted">
              Current view stock
            </p>
            <p className="mt-1 text-2xl font-black text-ms-navy">{totalStock}</p>
          </div>

          <Link
            to="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ms-navy px-6 py-4 text-sm font-black text-white transition hover:bg-ms-blue"
          >
            <Plus size={18} />
            Add product
          </Link>
        </div>
      </div>

      <div className="mb-6 grid gap-4 rounded-[2rem] border border-ms-border bg-white p-4 shadow-sm lg:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ms-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-ms-border bg-ms-cream py-3 pl-11 pr-4 text-sm outline-none focus:border-ms-navy"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-full border border-ms-border bg-ms-cream px-4 py-3 text-sm font-bold text-ms-navy outline-none focus:border-ms-navy"
        >
          <option value="all">All products</option>
          <option value="active">Visible only</option>
          <option value="hidden">Hidden only</option>
        </select>
      </div>

      {isLoading && <p className="text-ms-muted">Loading products...</p>}

      {isError && (
        <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          Failed to load products. Make sure you are logged in as admin.
        </div>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <div className="rounded-[2rem] border border-dashed border-ms-border bg-white p-10 text-center">
          <h3 className="text-xl font-black text-ms-navy">No products found</h3>
          <p className="mt-3 text-sm text-ms-muted">
            Products will appear here once they are created.
          </p>
        </div>
      )}

      {!isLoading && !isError && products.length > 0 && (
        <>
          <div className="space-y-3 lg:hidden">
            {products.map((product) => (
              <div
                key={product._id}
                className="rounded-[2rem] border border-ms-border bg-white p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  <img
                    src={getImageUrl(product.images?.[0])}
                    alt={product.name}
                    className="h-20 w-20 shrink-0 rounded-2xl bg-ms-cream object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black text-ms-navy">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-ms-muted">
                      {product.category || "T-Shirts"}
                      {product.badge ? ` - ${product.badge}` : ""}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusPill
                        active={product.stock > 0}
                        activeText={`${product.stock} in stock`}
                        inactiveText="Out of stock"
                      />
                      <StatusPill
                        active={product.isActive}
                        activeText="Visible"
                        inactiveText="Hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Info label="Price" value={formatCurrency(product.price)} />
                  <Info
                    label="Featured"
                    value={product.isFeatured ? "Yes" : "No"}
                  />
                  <Info label="Sizes" value={product.sizes?.join(", ") || "-"} />
                  <Info
                    label="Colors"
                    value={product.colors?.join(", ") || "-"}
                  />
                </div>

                <ProductActions
                  product={product}
                  onToggle={() => toggleMutation.mutate(product._id)}
                  onDelete={() => handleDelete(product)}
                  className="mt-4 justify-end border-t border-ms-border pt-4"
                />
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-[2rem] border border-ms-border bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-ms-cream text-xs uppercase tracking-[0.16em] text-ms-muted">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Sizes</th>
                  <th className="px-5 py-4">Colors</th>
                  <th className="px-5 py-4">Featured</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ms-border text-sm">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-ms-cream/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(product.images?.[0])}
                          alt={product.name}
                          className="h-14 w-14 rounded-2xl object-cover"
                        />

                        <div>
                          <p className="font-black text-ms-navy">{product.name}</p>
                          <p className="mt-1 text-xs text-ms-muted">
                            {product.category || "T-Shirts"}
                            {product.badge ? ` · ${product.badge}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-black text-ms-navy">
                      {formatCurrency(product.price)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          product.stock > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-ms-muted">
                      {product.sizes?.join(", ") || "-"}
                    </td>

                    <td className="px-5 py-4 text-ms-muted">
                      {product.colors?.join(", ") || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          product.isFeatured
                            ? "bg-blue-100 text-blue-800"
                            : "bg-ms-cream text-ms-muted"
                        }`}
                      >
                        {product.isFeatured ? "Featured" : "No"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isActive ? "Visible" : "Hidden"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-ms-navy transition hover:bg-ms-cream"
                          aria-label="Edit product"
                        >
                          <Edit size={17} />
                        </Link>

                        <button
                          onClick={() => toggleMutation.mutate(product._id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-ms-navy transition hover:bg-ms-cream"
                          aria-label="Hide or show product"
                        >
                          <EyeOff size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(product)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-red-600 transition hover:bg-red-50"
                          aria-label="Delete product"
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
        open={Boolean(productToDelete)}
        title="Delete product"
        description={`Are you sure you want to delete "${
          productToDelete?.name || "this product"
        }"? This cannot be undone.`}
        confirmLabel="Delete product"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onClose={() => setProductToDelete(null)}
        onConfirm={() => deleteMutation.mutate(productToDelete._id)}
      />
    </div>
  );
}

function ProductActions({ product, onToggle, onDelete, className = "" }) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <Link
        to={`/admin/products/${product._id}/edit`}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-ms-navy transition hover:bg-ms-cream"
        aria-label="Edit product"
      >
        <Edit size={17} />
      </Link>

      <button
        type="button"
        onClick={onToggle}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-ms-navy transition hover:bg-ms-cream"
        aria-label="Hide or show product"
      >
        <EyeOff size={17} />
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-red-600 transition hover:bg-red-50"
        aria-label="Delete product"
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-ms-cream p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ms-muted">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-ms-navy">
        {value}
      </p>
    </div>
  );
}

function StatusPill({ active, activeText, inactiveText }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {active ? activeText : inactiveText}
    </span>
  );
}

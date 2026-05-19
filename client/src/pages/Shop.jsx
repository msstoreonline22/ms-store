import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import api from "../api/axios";
import ProductCard from "../components/product/ProductCard";

export default function Shop() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [stockFilter, setStockFilter] = useState("all");

  const {
    data: productsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data.products;
    },
  });

  const products = productsData || [];

  const filteredProducts = useMemo(() => {
    let nextProducts = [...products];

    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      nextProducts = nextProducts.filter((product) => {
        return (
          product.name?.toLowerCase().includes(normalizedSearch) ||
          product.category?.toLowerCase().includes(normalizedSearch) ||
          product.badge?.toLowerCase().includes(normalizedSearch)
        );
      });
    }

    if (stockFilter === "in-stock") {
      nextProducts = nextProducts.filter((product) => Number(product.stock || 0) > 0);
    }

    if (stockFilter === "low-stock") {
      nextProducts = nextProducts.filter((product) => {
        const stock = Number(product.stock || 0);
        return stock > 0 && stock <= 3;
      });
    }

    if (sort === "featured") {
      nextProducts.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }

    if (sort === "newest") {
      nextProducts.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    if (sort === "price-low") {
      nextProducts.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sort === "price-high") {
      nextProducts.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    if (sort === "stock-high") {
      nextProducts.sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0));
    }

    return nextProducts;
  }, [products, search, sort, stockFilter]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
            Shop
          </p>

          <h1 className="mt-2 text-4xl font-black text-ms-navy md:text-5xl">
            MS Store drop
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-ms-muted">
            Browse graphic t-shirts, build your fit, and unlock the active
            bundle offer at checkout.
          </p>
        </div>

        <div className="rounded-full bg-white px-5 py-3 text-sm font-black text-ms-navy shadow-sm">
          {filteredProducts.length} product
          {filteredProducts.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="mb-8 rounded-[2rem] border border-ms-border bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
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

          <div className="relative">
            <SlidersHorizontal
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ms-muted"
            />

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full appearance-none rounded-full border border-ms-border bg-ms-cream py-3 pl-11 pr-4 text-sm font-bold text-ms-navy outline-none focus:border-ms-navy"
            >
              <option value="all">All stock</option>
              <option value="in-stock">In stock</option>
              <option value="low-stock">Low stock</option>
            </select>
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full rounded-full border border-ms-border bg-ms-cream px-4 py-3 text-sm font-bold text-ms-navy outline-none focus:border-ms-navy"
          >
            <option value="featured">Featured first</option>
            <option value="newest">Newest first</option>
            <option value="price-low">Price low to high</option>
            <option value="price-high">Price high to low</option>
            <option value="stock-high">Stock high to low</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-[420px] animate-pulse rounded-[2rem] bg-white"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          Failed to load products. Please refresh and try again.
        </div>
      )}

      {!isLoading && !isError && filteredProducts.length === 0 && (
        <div className="rounded-[2rem] border border-dashed border-ms-border bg-white p-10 text-center">
          <h2 className="text-2xl font-black text-ms-navy">
            No products found
          </h2>

          <p className="mt-3 text-sm text-ms-muted">
            Try changing the search or filters.
          </p>
        </div>
      )}

      {!isLoading && !isError && filteredProducts.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
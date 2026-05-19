import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

import { formatCurrency } from "../../utils/formatCurrency";
import { getImageUrl } from "../../utils/getImageUrl";

export default function ProductCard({ product }) {
  const firstImage = getImageUrl(product.images?.[0]);
  const secondImage = getImageUrl(product.images?.[1] || product.images?.[0]);

  const stock = Number(product.stock || 0);
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 3;

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-ms-border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link
        to={`/products/${product.slug}`}
        className="relative block overflow-hidden bg-ms-cream"
      >
        {product.badge && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-ms-navy px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
            {product.badge}
          </span>
        )}

        {isOutOfStock && (
          <span className="absolute right-4 top-4 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
            Sold out
          </span>
        )}

        <img
          src={firstImage}
          alt={product.name}
          className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:opacity-0"
          loading="lazy"
        />

        <img
          src={secondImage}
          alt={product.name}
          className="absolute inset-0 aspect-[4/5] h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
          loading="lazy"
        />
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              to={`/products/${product.slug}`}
              className="block truncate text-lg font-black text-ms-navy transition hover:text-ms-blue"
            >
              {product.name}
            </Link>

            <p className="mt-1 text-sm text-ms-muted">
              {product.category || "T-Shirts"}
            </p>
          </div>

          <p className="shrink-0 text-base font-black text-ms-navy">
            {formatCurrency(product.price)}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p
            className={`text-sm font-bold ${
              isOutOfStock ? "text-red-600" : "text-green-700"
            }`}
          >
            {isOutOfStock
              ? "Out of stock"
              : isLowStock
              ? `Only ${stock} left`
              : "In stock"}
          </p>

          <Link
            to={`/products/${product.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-ms-navy px-4 py-2 text-xs font-black text-white transition hover:bg-ms-blue"
          >
            <ShoppingBag size={15} />
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

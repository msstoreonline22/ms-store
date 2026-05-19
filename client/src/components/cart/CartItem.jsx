import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import { getImageUrl } from "../../utils/getImageUrl";

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const shouldShowColor = item.color && item.color !== "Default";

  return (
    <div className="grid grid-cols-[86px_1fr] gap-4 rounded-[2rem] border border-ms-border bg-white p-4 shadow-sm sm:grid-cols-[112px_1fr_auto] sm:items-center">
      <Link
        to={`/products/${item.slug}`}
        className="overflow-hidden rounded-2xl bg-ms-cream"
      >
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          className="aspect-square w-full object-cover"
        />
      </Link>

      <div className="min-w-0">
        <Link
          to={`/products/${item.slug}`}
          className="block truncate text-base font-black text-ms-navy hover:text-ms-blue sm:text-lg"
        >
          {item.name}
        </Link>

        <p className="mt-2 text-sm text-ms-muted">
          Size: <span className="font-bold text-ms-navy">{item.size}</span>
          {shouldShowColor && (
            <>
              {" · "}
              Color:{" "}
              <span className="font-bold text-ms-navy">{item.color}</span>
            </>
          )}
        </p>

        <p className="mt-2 text-sm font-bold text-ms-navy">
          {formatCurrency(item.price)}
        </p>
      </div>

      <div className="col-span-2 flex items-center justify-between gap-3 border-t border-ms-border pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
        <select
          value={item.quantity}
          onChange={(e) => onUpdateQuantity(item.cartKey, Number(e.target.value))}
          className="rounded-full border border-ms-border bg-ms-cream px-4 py-2 text-sm font-bold text-ms-navy outline-none focus:border-ms-navy"
          aria-label={`Quantity for ${item.name}`}
        >
          {Array.from({ length: item.stock }, (_, index) => index + 1).map(
            (option) => (
              <option key={option} value={option}>
                {option}
              </option>
            )
          )}
        </select>

        <button
          onClick={() => onRemove(item.cartKey)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border text-red-600 transition hover:bg-red-50"
          aria-label="Remove item"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}

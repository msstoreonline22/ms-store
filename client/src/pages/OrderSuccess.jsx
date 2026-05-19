import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center lg:px-8">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700">
        <CheckCircle2 size={34} />
      </div>

      <h1 className="mt-6 text-4xl font-black text-ms-navy">
        Order placed successfully
      </h1>

      <p className="mt-4 text-ms-muted">
        Thank you for ordering from MS Store. The team will contact you soon to
        confirm your order, payment method, and delivery details.
      </p>

      {orderNumber && (
        <div className="mx-auto mt-8 max-w-sm rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-ms-muted">
            Order number
          </p>
          <p className="mt-2 text-3xl font-black text-ms-navy">{orderNumber}</p>
          <p className="mt-3 text-xs leading-5 text-ms-muted">
            Save this number. You can use it later to track your order.
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {orderNumber && (
          <Link
            to={`/track-order`}
            className="rounded-full bg-ms-navy px-7 py-4 text-sm font-black text-white transition hover:bg-ms-blue"
          >
            Track order
          </Link>
        )}

        <Link
          to="/shop"
          className="rounded-full border border-ms-border bg-white px-7 py-4 text-sm font-black text-ms-navy transition hover:shadow-soft"
        >
          Continue shopping
        </Link>

        <Link
          to="/"
          className="rounded-full border border-ms-border bg-white px-7 py-4 text-sm font-black text-ms-navy transition hover:shadow-soft"
        >
          Back home
        </Link>
      </div>
    </section>
  );
}
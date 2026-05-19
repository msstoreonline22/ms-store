import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";

export default function CartSummary({ totals, activeOffer }) {
  const remainingToUnlock =
    activeOffer && activeOffer.requiredQuantity
      ? Number(activeOffer.requiredQuantity) -
        (totals.eligibleOfferQuantity % Number(activeOffer.requiredQuantity))
      : 0;

  const shouldShowUnlockMessage =
    activeOffer &&
    activeOffer.isActive &&
    totals.eligibleOfferQuantity > 0 &&
    totals.offerGroups === 0 &&
    remainingToUnlock > 0 &&
    remainingToUnlock < Number(activeOffer.requiredQuantity);

  return (
    <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-ms-navy">Order summary</h2>

      {activeOffer?.isActive && (
        <div className="mt-5 rounded-2xl bg-ms-cream p-4">
          <p className="text-sm font-black text-ms-navy">{activeOffer.title}</p>
          {activeOffer.description && (
            <p className="mt-1 text-xs leading-5 text-ms-muted">
              {activeOffer.description}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 space-y-4 text-sm">
        <div className="flex justify-between gap-4 text-ms-muted">
          <span>Normal subtotal</span>
          <span className="font-bold text-ms-navy">
            {formatCurrency(totals.normalSubtotal)}
          </span>
        </div>

        {totals.offerDiscount > 0 && (
          <div className="flex justify-between gap-4 text-green-700">
            <span>{totals.offerTitle || "Offer saved"}</span>
            <span className="font-bold">
              - {formatCurrency(totals.offerDiscount)}
            </span>
          </div>
        )}

        <div className="flex justify-between gap-4 text-ms-muted">
          <span>Subtotal after offer</span>
          <span className="font-bold text-ms-navy">
            {formatCurrency(totals.subtotalAfterOffer)}
          </span>
        </div>

        <div className="flex justify-between gap-4 text-ms-muted">
          <span>Delivery</span>
          <span className="font-bold text-ms-navy">
            Calculated at checkout
          </span>
        </div>

        <div className="border-t border-ms-border pt-4">
          <div className="flex justify-between gap-4">
            <span className="text-base font-black text-ms-navy">Total</span>
            <span className="text-base font-black text-ms-navy">
              {formatCurrency(totals.subtotalAfterOffer)}
            </span>
          </div>
        </div>
      </div>

      {shouldShowUnlockMessage && (
        <div className="mt-5 rounded-2xl bg-ms-cream p-4 text-sm text-ms-navy">
          Add {remainingToUnlock} more eligible item
          {remainingToUnlock === 1 ? "" : "s"} to unlock the offer.
        </div>
      )}

      <Link
        to="/checkout"
        className="mt-6 inline-flex w-full justify-center rounded-full bg-ms-navy px-6 py-4 text-sm font-black text-white transition hover:bg-ms-blue"
      >
        Continue to checkout
      </Link>
    </div>
  );
}
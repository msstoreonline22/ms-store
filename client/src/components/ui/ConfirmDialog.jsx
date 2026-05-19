import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ms-navy/55 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-ms-border bg-white shadow-soft">
        <div className="flex items-start gap-4 border-b border-ms-border bg-ms-cream p-5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              isDanger
                ? "bg-red-100 text-red-700"
                : "bg-ms-navy text-white"
            }`}
          >
            <AlertTriangle size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-black text-ms-navy">{title}</h3>
            {description && (
              <p className="mt-2 text-sm leading-6 text-ms-muted">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ms-border bg-white text-ms-navy transition hover:bg-ms-cream disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close dialog"
          >
            <X size={17} />
          </button>
        </div>

        <div className="flex flex-col-reverse gap-3 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex justify-center rounded-full border border-ms-border bg-white px-5 py-3 text-sm font-black text-ms-navy transition hover:bg-ms-cream disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex justify-center rounded-full px-5 py-3 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isDanger
                ? "bg-red-700 hover:bg-red-800"
                : "bg-ms-navy hover:bg-ms-blue"
            }`}
          >
            {isLoading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

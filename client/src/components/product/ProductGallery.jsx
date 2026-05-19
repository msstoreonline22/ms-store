import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getImageUrl } from "../../utils/getImageUrl";

export default function ProductGallery({ images = [], productName = "Product" }) {
  const safeImages = useMemo(() => {
    const sourceImages = Array.isArray(images) && images.length ? images : [null];
    return sourceImages.map(getImageUrl);
  }, [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = safeImages[activeIndex] || safeImages[0];
  const hasMultipleImages = safeImages.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [productName, safeImages.length]);

  const showPreviousImage = () => {
    setActiveIndex((current) =>
      current === 0 ? safeImages.length - 1 : current - 1
    );
  };

  const showNextImage = () => {
    setActiveIndex((current) =>
      current === safeImages.length - 1 ? 0 : current + 1
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[2rem] border border-ms-border bg-white shadow-sm">
        <img
          src={activeImage}
          alt={productName}
          className="aspect-[4/5] w-full object-cover"
        />

        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-ms-border bg-white/95 text-ms-navy shadow-sm transition hover:bg-ms-cream"
              aria-label="Previous product image"
            >
              <ChevronLeft size={21} />
            </button>

            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-ms-border bg-white/95 text-ms-navy shadow-sm transition hover:bg-ms-cream"
              aria-label="Next product image"
            >
              <ChevronRight size={21} />
            </button>
          </>
        )}
      </div>

      {hasMultipleImages && (
        <div className="grid grid-cols-4 gap-3">
          {safeImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`overflow-hidden rounded-2xl border bg-white transition ${
                activeImage === image
                  ? "border-ms-navy shadow-sm"
                  : "border-ms-border hover:border-ms-navy"
              }`}
              aria-label={`View ${productName} image ${index + 1}`}
            >
              <img
                src={image}
                alt={productName}
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

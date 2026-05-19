import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CreditCard, ShoppingBag, Truck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import api from "../api/axios";
import ProductGallery from "../components/product/ProductGallery";
import { formatCurrency } from "../utils/formatCurrency";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { slug } = useParams();
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await api.get(`/products/${slug}`);
      return res.data.product;
    },
  });

  const hasColors = product?.colors?.length > 0;
  const stock = Number(product?.stock || 0);
  const isLowStock = stock > 0 && stock <= 3;

  const quantityOptions = useMemo(() => {
    if (!product?.stock) return [1];

    return Array.from({ length: product.stock }, (_, index) => index + 1);
  }, [product?.stock]);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <p className="text-ms-muted">Loading product...</p>
      </section>
    );
  }

  if (isError || !product) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <h1 className="text-3xl font-black text-ms-navy">Product not found</h1>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-ms-navy"
        >
          <ArrowLeft size={16} />
          Back to shop
        </Link>
      </section>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      product,
      size: selectedSize,
      color: hasColors ? selectedColor : "Default",
      quantity,
    });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Link
        to="/shop"
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-ms-muted transition hover:text-ms-navy"
      >
        <ArrowLeft size={16} />
        Back to shop
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.badge && (
            <span className="inline-flex rounded-full bg-ms-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
              {product.badge}
            </span>
          )}

          <h1 className="mt-5 text-4xl font-black text-ms-navy">
            {product.name}
          </h1>

          <p className="mt-3 text-2xl font-black text-ms-navy">
            {formatCurrency(product.price)}
          </p>

          <p className="mt-5 max-w-xl leading-7 text-ms-muted">
            {product.description}
          </p>

          <div className="mt-8 rounded-[2rem] border border-ms-border bg-white p-5">
            <p className="text-sm font-bold text-ms-navy">Choose size</p>

            <div className="mt-4 flex flex-wrap gap-3">
              {product.sizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-full border px-5 py-3 text-sm font-bold transition ${
                    selectedSize === size
                      ? "border-ms-navy bg-ms-navy text-white"
                      : "border-ms-border bg-ms-cream text-ms-navy hover:border-ms-navy"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {hasColors && (
            <div className="mt-5 rounded-[2rem] border border-ms-border bg-white p-5">
              <p className="text-sm font-bold text-ms-navy">Choose color</p>

              <div className="mt-4 flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-full border px-5 py-3 text-sm font-bold transition ${
                      selectedColor === color
                        ? "border-ms-navy bg-ms-navy text-white"
                        : "border-ms-border bg-ms-cream text-ms-navy hover:border-ms-navy"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 rounded-[2rem] border border-ms-border bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-ms-navy">Quantity</p>
                <p className="mt-1 text-xs text-ms-muted">
                  {stock <= 0
                    ? "Out of stock"
                    : isLowStock
                    ? `Only ${stock} left`
                    : "In stock"}
                </p>
              </div>

              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="rounded-full border border-ms-border bg-ms-cream px-5 py-3 text-sm font-bold text-ms-navy outline-none"
              >
                {quantityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ms-navy px-7 py-4 text-sm font-black text-white transition hover:bg-ms-blue disabled:cursor-not-allowed disabled:bg-ms-muted"
          >
            <ShoppingBag size={18} />
            Add to cart
          </button>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-ms-border bg-white p-4">
              <Truck className="text-ms-navy" size={20} />
              <p className="mt-3 text-sm font-bold text-ms-navy">
                Fast delivery
              </p>
            </div>

            <div className="rounded-3xl border border-ms-border bg-white p-4">
              <CreditCard className="text-ms-navy" size={20} />
              <p className="mt-3 text-sm font-bold text-ms-navy">
                Cash / InstaPay
              </p>
            </div>

            <div className="rounded-3xl border border-ms-border bg-white p-4">
              <ShoppingBag className="text-ms-navy" size={20} />
              <p className="mt-3 text-sm font-bold text-ms-navy">
                Bundle offers
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

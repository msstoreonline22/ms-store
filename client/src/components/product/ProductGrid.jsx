import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [] }) {
  if (!products.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-ms-border bg-white p-10 text-center">
        <h3 className="text-lg font-bold text-ms-navy">No products found</h3>
        <p className="mt-2 text-sm text-ms-muted">
          Products will appear here once they are added.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
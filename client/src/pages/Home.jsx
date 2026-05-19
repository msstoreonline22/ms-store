import { Link } from "react-router-dom";
import { ArrowRight, Truck, CreditCard, Shirt, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import ProductGrid from "../components/product/ProductGrid";

export default function Home() {
  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await api.get("/settings");
      return res.data.settings;
    },
  });

  const { data: featuredData, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await api.get("/products/featured");
      return res.data.products;
    },
  });

  const featuredProducts = featuredData || [];
  const activeOffer = settingsData?.announcementText || "3 T-Shirts for 1000 EGP";

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-ms-border bg-white px-4 py-2 text-sm font-semibold text-ms-navy">
              {activeOffer}
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-tight tracking-tight text-ms-navy md:text-6xl">
              Wear the art. Own the statement.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-ms-muted">
              Premium cotton graphic t-shirts with bold printed designs, easy
              everyday styling, and fast delivery across Egypt.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ms-navy px-7 py-4 text-sm font-bold text-white transition hover:bg-ms-blue"
              >
                Shop now
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/shop"
                className="inline-flex items-center justify-center rounded-full border border-ms-border bg-white px-7 py-4 text-sm font-bold text-ms-navy transition hover:shadow-soft"
              >
                View the drop
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[500px] lg:ml-auto">
            <div className="relative overflow-hidden rounded-[2rem] border border-ms-border bg-white p-5 shadow-sm">
              <div className="relative min-h-[420px] overflow-hidden rounded-[1.5rem] bg-ms-navy p-8 text-white">
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10" />
                <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-white/10" />
                <div className="absolute right-10 top-24 h-24 w-24 rounded-full border border-white/20" />
                <div className="absolute bottom-24 right-16 h-3 w-3 rounded-full bg-white/50" />
                <div className="absolute left-12 top-32 h-2 w-2 rounded-full bg-white/40" />

                <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white/80">
                      <Sparkles size={14} />
                      MS Store
                    </div>

                    <h2 className="mt-8 max-w-sm text-4xl font-black leading-tight md:text-5xl">
                      Simple fits. Strong details.
                    </h2>

                    <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
                      Design-led graphic tees made for everyday wear, clean
                      styling, and confident streetwear energy.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] bg-white/10 p-4 backdrop-blur">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">
                        Starting at
                      </p>
                      <p className="mt-2 text-2xl font-black text-white">
                        500 EGP
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] bg-white p-4 text-ms-navy">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-ms-muted">
                        Active offer
                      </p>
                      <p className="mt-2 text-lg font-black">{activeOffer}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ms-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:grid-cols-3 lg:px-8">
          <div className="flex items-center gap-3">
            <Shirt className="text-ms-navy" size={22} />
            <p className="text-sm font-semibold text-ms-navy">100% cotton</p>
          </div>

          <div className="flex items-center gap-3">
            <Truck className="text-ms-navy" size={22} />
            <p className="text-sm font-semibold text-ms-navy">
              Fast delivery across Egypt
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CreditCard className="text-ms-navy" size={22} />
            <p className="text-sm font-semibold text-ms-navy">
              Cash or InstaPay
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
              Featured drop
            </p>
            <h2 className="mt-2 text-3xl font-black text-ms-navy">
              Best picks from MS Store
            </h2>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-ms-navy hover:text-ms-blue"
          >
            View all products
            <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <p className="text-ms-muted">Loading products...</p>
        ) : (
          <ProductGrid products={featuredProducts} />
        )}
      </section>
    </>
  );
}
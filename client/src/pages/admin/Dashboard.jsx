import { Boxes, DollarSign, ShoppingBag, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import StatCard from "../../components/admin/StatCard";
import { formatCurrency } from "../../utils/formatCurrency";

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const res = await api.get("/analytics/admin/overview");
      return res.data.overview;
    },
  });

  const { data: activeOffer } = useQuery({
    queryKey: ["active-offer"],
    queryFn: async () => {
      const res = await api.get("/offers/active");
      return res.data.offer;
    },
  });

  const overview = data || {};

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
          Overview
        </p>
        <h2 className="mt-2 text-4xl font-black text-ms-navy">
          Store performance
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ms-muted">
          Track revenue, orders, products, and customer growth from one place.
        </p>
      </div>

      {isLoading && <p className="text-ms-muted">Loading dashboard...</p>}

      {isError && (
        <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          Failed to load dashboard. Make sure you are logged in as admin.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total revenue"
              value={formatCurrency(overview.totalRevenue)}
              helper="Excludes cancelled orders"
              icon={DollarSign}
            />

            <StatCard
              title="Total orders"
              value={overview.totalOrders || 0}
              helper={`${overview.pendingOrders || 0} pending`}
              icon={ShoppingBag}
            />

            <StatCard
              title="Products"
              value={overview.totalProducts || 0}
              helper={`${overview.activeProducts || 0} active`}
              icon={Boxes}
            />

            <StatCard
              title="Customers"
              value={overview.totalCustomers || 0}
              helper="Registered customer accounts"
              icon={Users}
            />
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-black text-ms-navy">
                Quick notes
              </h3>
              <div className="mt-5 space-y-3 text-sm text-ms-muted">
                <p>
                  Pending orders should be reviewed daily so customers get
                  confirmation quickly.
                </p>
                <p>
                  Stock is automatically reduced when orders are placed.
                </p>
                <p>
                  Delivery, InstaPay, and announcement settings are controlled
                  from the Settings page.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-black text-ms-navy">
                Current active offer
              </h3>

              {activeOffer ? (
                <>
                  <p className="mt-5 rounded-2xl bg-ms-cream p-5 text-sm font-bold text-ms-navy">
                    {activeOffer.title}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-ms-muted">
                    Required quantity:{" "}
                    <strong>{activeOffer.requiredQuantity}</strong>
                    <br />
                    Offer price:{" "}
                    <strong>{formatCurrency(activeOffer.offerPrice)}</strong>
                    <br />
                    Applies to:{" "}
                    <strong>
                      {activeOffer.appliesToAllProducts
                        ? "All products"
                        : `${activeOffer.products?.length || 0} selected products`}
                    </strong>
                  </p>
                </>
              ) : (
                <p className="mt-5 rounded-2xl bg-ms-cream p-5 text-sm font-bold text-ms-navy">
                  No active offer right now.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
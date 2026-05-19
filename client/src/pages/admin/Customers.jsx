import { useMemo, useState } from "react";
import { Mail, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import api from "../../api/axios";
import { formatCurrency } from "../../utils/formatCurrency";

export default function Customers() {
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-customers", search],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      const res = await api.get(`/customers/admin?${params.toString()}`);
      return res.data.customers;
    },
  });

  const customers = data || [];

  const totalCustomerRevenue = useMemo(() => {
    return customers.reduce(
      (total, customer) => total + Number(customer.totalSpent || 0),
      0
    );
  }, [customers]);

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
            Customers
          </p>
          <h2 className="mt-2 text-4xl font-black text-ms-navy">
            Manage customers
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ms-muted">
            View registered customers, contact info, order count, and total
            spending.
          </p>
        </div>

        <div className="rounded-[2rem] border border-ms-border bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ms-muted">
            Current view revenue
          </p>
          <p className="mt-1 text-2xl font-black text-ms-navy">
            {formatCurrency(totalCustomerRevenue)}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-[2rem] border border-ms-border bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ms-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full rounded-full border border-ms-border bg-ms-cream py-3 pl-11 pr-4 text-sm outline-none focus:border-ms-navy"
          />
        </div>
      </div>

      {isLoading && <p className="text-ms-muted">Loading customers...</p>}

      {isError && (
        <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          Failed to load customers. Make sure you are logged in as admin.
        </div>
      )}

      {!isLoading && !isError && customers.length === 0 && (
        <div className="rounded-[2rem] border border-dashed border-ms-border bg-white p-10 text-center">
          <h3 className="text-xl font-black text-ms-navy">
            No customers found
          </h3>
          <p className="mt-3 text-sm text-ms-muted">
            Registered customers will appear here.
          </p>
        </div>
      )}

      {!isLoading && !isError && customers.length > 0 && (
        <>
          <div className="space-y-3 lg:hidden">
            {customers.map((customer) => (
              <div
                key={customer._id}
                className="rounded-[2rem] border border-ms-border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-black text-ms-navy">
                      {customer.name}
                    </p>
                    <p className="mt-1 truncate text-sm text-ms-muted">
                      {customer.email}
                    </p>
                  </div>

                  <a
                    href={`mailto:${customer.email}`}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ms-navy text-white transition hover:bg-ms-blue"
                    aria-label="Email customer"
                  >
                    <Mail size={17} />
                  </a>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <CustomerInfo label="Phone" value={customer.phone || "N/A"} />
                  <CustomerInfo label="Orders" value={customer.totalOrders} />
                  <CustomerInfo
                    label="Total spent"
                    value={formatCurrency(customer.totalSpent)}
                    strong
                  />
                  <CustomerInfo
                    label="Joined"
                    value={new Date(customer.createdAt).toLocaleDateString(
                      "en-EG"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-[2rem] border border-ms-border bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-ms-cream text-xs uppercase tracking-[0.16em] text-ms-muted">
                <tr>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Orders</th>
                  <th className="px-5 py-4">Total spent</th>
                  <th className="px-5 py-4">Joined</th>
                  <th className="px-5 py-4 text-right">Email</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ms-border text-sm">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-ms-cream/50">
                    <td className="px-5 py-4">
                      <p className="font-black text-ms-navy">
                        {customer.name}
                      </p>
                      <p className="mt-1 text-xs text-ms-muted">
                        {customer.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-ms-muted">
                      {customer.phone || "N/A"}
                    </td>

                    <td className="px-5 py-4 font-black text-ms-navy">
                      {customer.totalOrders}
                    </td>

                    <td className="px-5 py-4 font-black text-ms-navy">
                      {formatCurrency(customer.totalSpent)}
                    </td>

                    <td className="px-5 py-4 text-ms-muted">
                      {new Date(customer.createdAt).toLocaleDateString("en-EG")}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <a
                        href={`mailto:${customer.email}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ms-navy text-white transition hover:bg-ms-blue"
                        aria-label="Email customer"
                      >
                        <Mail size={17} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

function CustomerInfo({ label, value, strong }) {
  return (
    <div className="rounded-2xl bg-ms-cream p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ms-muted">
        {label}
      </p>
      <p
        className={`mt-1 break-words text-sm ${
          strong ? "font-black text-ms-navy" : "font-bold text-ms-navy"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

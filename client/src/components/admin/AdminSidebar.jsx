import {
  BarChart3,
  Boxes,
  Home,
  LayoutDashboard,
  Percent,
  Settings,
  ShoppingBag,
  TicketPercent,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const adminLinks = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Products",
    to: "/admin/products",
    icon: Boxes,
  },
  {
    label: "Orders",
    to: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Offers",
    to: "/admin/offers",
    icon: Percent,
  },
  {
    label: "Discount Codes",
    to: "/admin/discount-codes",
    icon: TicketPercent,
  },
  {
    label: "Customers",
    to: "/admin/customers",
    icon: Users,
  },
  {
    label: "Analytics",
    to: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    to: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  return (
    <aside className="hidden min-h-screen w-72 border-r border-ms-border bg-white p-5 lg:block">
      <div className="mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ms-navy text-sm font-black text-white">
          MS
        </div>

        <p className="mt-4 text-sm font-black uppercase tracking-[0.22em] text-ms-navy">
          MS Store
        </p>
        <p className="mt-1 text-xs text-ms-muted">Admin dashboard</p>
      </div>

      <nav className="space-y-2">
        {adminLinks.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  isActive
                    ? "bg-ms-navy text-white"
                    : "text-ms-muted hover:bg-ms-cream hover:text-ms-navy"
                }`
              }
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <NavLink
        to="/"
        className="mt-8 flex items-center gap-3 rounded-2xl border border-ms-border px-4 py-3 text-sm font-bold text-ms-navy transition hover:bg-ms-cream"
      >
        <Home size={18} />
        View website
      </NavLink>
    </aside>
  );
}
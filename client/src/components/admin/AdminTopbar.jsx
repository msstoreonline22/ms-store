import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const mobileLinks = [
  { label: "Dashboard", to: "/admin", end: true },
  { label: "Products", to: "/admin/products" },
  { label: "Orders", to: "/admin/orders" },
  { label: "Offers", to: "/admin/offers" },
  { label: "Discount Codes", to: "/admin/discount-codes" },
  { label: "Customers", to: "/admin/customers" },
  { label: "Analytics", to: "/admin/analytics" },
  { label: "Settings", to: "/admin/settings" },
];

export default function AdminTopbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-ms-border bg-ms-cream/90 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-4 lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-ms-muted">
            Admin
          </p>
          <h1 className="text-xl font-black text-ms-navy">
            Welcome, {user?.name || "Admin"}
          </h1>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/"
            className="rounded-full border border-ms-border bg-white px-4 py-2 text-sm font-bold text-ms-navy transition hover:shadow-soft"
          >
            View website
          </Link>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full bg-ms-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-ms-blue"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-ms-navy lg:hidden"
          aria-label="Open admin menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-ms-border bg-white px-4 py-4 lg:hidden">
          <div className="grid gap-2">
            {mobileLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-bold ${
                    isActive
                      ? "bg-ms-navy text-white"
                      : "text-ms-muted hover:bg-ms-cream hover:text-ms-navy"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="rounded-2xl bg-ms-navy px-4 py-3 text-left text-sm font-bold text-white"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
import { Link, NavLink } from "react-router-dom";
import { Menu, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import api from "../../api/axios";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Track Order", to: "/track-order" },
  { label: "My Orders", to: "/my-orders" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await api.get("/settings");
      return res.data.settings;
    },
  });

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive ? "text-ms-navy" : "text-ms-muted hover:text-ms-navy"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-ms-border bg-ms-cream/90 backdrop-blur-xl">
      {settings?.announcementText && (
        <div className="bg-ms-navy px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-white">
          {settings.announcementText}
        </div>
      )}

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings?.brandName || "MS Store"}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ms-navy text-sm font-black text-white">
              MS
            </div>
          )}

          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-ms-navy">
              {settings?.brandName || "MS Store"}
            </p>
            <p className="text-xs text-ms-muted">Egyptian streetwear</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="inline-flex h-10 items-center justify-center rounded-full border border-ms-border bg-white px-4 text-sm font-bold text-ms-navy transition hover:shadow-soft"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-ms-navy transition hover:shadow-soft"
              aria-label="Login"
            >
              <User size={18} />
            </Link>
          )}

          <Link
            to="/cart"
            className="relative inline-flex h-10 items-center gap-2 rounded-full bg-ms-navy px-5 text-sm font-semibold text-white transition hover:bg-ms-blue"
          >
            <ShoppingBag size={18} />
            Cart
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ms-blue px-1 text-[11px] font-black text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ms-border bg-white text-ms-navy md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-ms-border bg-ms-cream px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={linkClass}
              >
                {link.label}
              </NavLink>
            ))}

            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setIsOpen(false)}
                className={linkClass}
              >
                Admin
              </NavLink>
            )}

            <div className="flex gap-3 pt-2">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex-1 rounded-full border border-ms-border bg-white px-4 py-3 text-center text-sm font-semibold text-ms-navy"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-full border border-ms-border bg-white px-4 py-3 text-center text-sm font-semibold text-ms-navy"
                >
                  Login
                </Link>
              )}

              <Link
                to="/cart"
                onClick={() => setIsOpen(false)}
                className="relative flex-1 rounded-full bg-ms-navy px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Cart
                {cartCount > 0 && (
                  <span className="ml-2 rounded-full bg-ms-blue px-2 py-0.5 text-xs font-black">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
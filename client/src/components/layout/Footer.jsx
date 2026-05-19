import { ExternalLink, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

export default function Footer() {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await api.get("/settings");
      return res.data.settings;
    },
  });

  const instagramUrl =
    settings?.instagramUrl || "https://www.instagram.com/ms.storeeonlinee/";

  return (
    <footer className="border-t border-ms-border bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-black uppercase tracking-[0.2em] text-ms-navy">
            {settings?.brandName || "MS Store"}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-ms-muted">
            Graphic cotton t-shirts made for clean everyday fits and bold
            streetwear energy.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ms-navy">Explore</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-ms-muted">
            <Link to="/shop" className="hover:text-ms-navy">
              Shop
            </Link>
            <Link to="/track-order" className="hover:text-ms-navy">
              Track Order
            </Link>
            <Link to="/my-orders" className="hover:text-ms-navy">
              My Orders
            </Link>
            <Link to="/cart" className="hover:text-ms-navy">
              Cart
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ms-navy">Contact</h3>
          <p className="mt-4 text-sm text-ms-muted">
            Cash on delivery and InstaPay available.
          </p>

          {settings?.phoneNumbers?.length > 0 && (
            <div className="mt-4 space-y-2">
              {settings.phoneNumbers.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone}`}
                  className="flex items-center gap-2 text-sm font-semibold text-ms-navy"
                >
                  <Phone size={15} />
                  {phone}
                </a>
              ))}
            </div>
          )}

          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-ms-border px-4 py-2 text-sm font-semibold text-ms-navy transition hover:bg-ms-cream"
          >
            <ExternalLink size={16} />
            Instagram
          </a>
        </div>
      </div>

      <div className="border-t border-ms-border px-4 py-4 text-center text-xs text-ms-muted">
        © {new Date().getFullYear()} {settings?.brandName || "MS Store Egypt"}.
        All rights reserved.
      </div>
    </footer>
  );
}
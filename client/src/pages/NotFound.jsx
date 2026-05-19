import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
      <h1 className="text-5xl font-black text-ms-navy">404</h1>
      <p className="mt-3 text-ms-muted">This page does not exist.</p>

      <Link
        to="/"
        className="mt-8 inline-flex rounded-full bg-ms-navy px-6 py-3 text-sm font-bold text-white"
      >
        Back home
      </Link>
    </section>
  );
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  email: "",
  password: "",
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) return "Email is required";
    if (!formData.password.trim()) return "Password is required";

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();

    if (error) {
      toast.error(error);
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await login(formData);

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto grid min-h-[70vh] max-w-7xl items-center px-4 py-12 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
          Welcome back
        </p>

        <h1 className="mt-2 text-3xl font-black text-ms-navy">
          Login to MS Store
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
            className="w-full rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy"
          />

          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-ms-navy px-6 py-4 text-sm font-black text-white transition hover:bg-ms-blue disabled:cursor-not-allowed disabled:bg-ms-muted"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ms-muted">
          New to MS Store?{" "}
          <Link to="/register" className="font-bold text-ms-navy">
            Create account
          </Link>
        </p>
      </div>
    </section>
  );
}
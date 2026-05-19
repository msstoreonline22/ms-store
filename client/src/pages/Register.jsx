import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

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
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.password.trim()) return "Password is required";
    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }

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
      await register(formData);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to register");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto grid min-h-[70vh] max-w-7xl items-center px-4 py-12 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
          Create account
        </p>

        <h1 className="mt-2 text-3xl font-black text-ms-navy">
          Join MS Store
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full name"
            className="w-full rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy"
          />

          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
            className="w-full rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy"
          />

          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone number optional"
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
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ms-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-ms-navy">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}
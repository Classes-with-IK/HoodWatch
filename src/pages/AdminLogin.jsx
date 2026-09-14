import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Radar, ArrowLeft } from "lucide-react";

import { apiFetch, extractUser, extractToken } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const userData = extractUser(response);

      if (userData?.role !== "admin") {
        await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});

        setError(
          "This portal is for administrators only. Residents and patrol officers should sign in from the main login page.",
        );
        setLoading(false);
        return;
      }

      login(userData, extractToken(response));
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b100e] px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition hover:text-white"
        >
          <ArrowLeft size={15} />
          Back to resident sign in
        </Link>

        <div className="mb-8 mt-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <Radar size={24} />
          </div>

          <h1 className="mt-4 font-display text-2xl font-semibold text-white">
            HoodWatch control room
          </h1>

          <p className="mt-2 text-sm text-white/60">
            Administrator access only.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-card"
        >
          {error && (
            <div className="mb-5 rounded-lg border border-critical/30 bg-critical/10 p-3 text-sm text-critical">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-white/80"
            >
              Admin email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@neighborhood.org"
              className="h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary"
              required
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-white/80"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Enter control room"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          New admin?{" "}
          <Link to="/register" className="font-semibold text-white/70 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;

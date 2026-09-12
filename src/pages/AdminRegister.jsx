import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Radar, ArrowLeft } from "lucide-react";

import { apiFetch, extractUser, extractToken } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

function AdminRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    zone: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: "admin",
          zone: form.zone || undefined,
          phone: form.phone || undefined,
        }),
      });

      const userData = extractUser(response);
      const token = extractToken(response);

      if (userData && token) {
        login(userData, token);
        navigate("/admin");
      } else {
        navigate("/admin/login");
      }
    } catch (err) {
      setError(err.message || "Unable to create this admin account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition hover:text-white"
        >
          <ArrowLeft size={15} />
          Back to control room sign in
        </Link>

        <div className="mb-8 mt-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <Radar size={24} />
          </div>

          <h1 className="mt-4 font-display text-2xl font-semibold text-white">
            Create an admin account
          </h1>

          <p className="mt-2 text-sm text-white/60">
            For staff who manage alerts and oversee incident response.
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
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-white/80">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Okafor"
              className="h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary"
              required
            />
          </div>

          <div className="mt-4">
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/80">
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
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/80">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary"
              required
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="zone" className="mb-1.5 block text-sm font-medium text-white/80">
                Zone
                <span className="ml-1 font-normal text-white/40">(optional)</span>
              </label>
              <input
                id="zone"
                name="zone"
                type="text"
                value={form.zone}
                onChange={handleChange}
                placeholder="All districts"
                className="h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-white/80">
                Phone
                <span className="ml-1 font-normal text-white/40">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create admin account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          Already have access?{" "}
          <Link to="/admin/login" className="font-semibold text-white/70 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminRegister;

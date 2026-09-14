import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, User, Footprints, Radar } from "lucide-react";

import { apiFetch, extractUser, extractToken } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const ROLE_OPTIONS = [
  { value: "resident", label: "Resident", icon: User },
  { value: "patrol_officer", label: "Patrol officer", icon: Footprints },
  { value: "admin", label: "Admin", icon: Radar },
];

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "resident",
    zone: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
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
          role: form.role,
          zone: form.zone || undefined,
          phone: form.phone || undefined,
        }),
      });

      const userData = extractUser(response);

      if (userData) {
        login(userData, extractToken(response));
        navigate(userData.role === "admin" ? "/admin" : "/dashboard");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex justify-end">
          <ThemeToggle />
        </div>

        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <ShieldCheck size={24} />
          </div>

          <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
            Join HoodWatch
          </h1>

          <p className="mt-2 text-sm text-muted">
            Create your account to get started.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-surface p-6 shadow-card"
        >
          {error && (
            <div className="mb-5 rounded-lg border border-border bg-critical-soft p-3 text-sm text-critical">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                I am a...
              </label>

              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = form.role === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({ ...current, role: option.value }))
                      }
                      className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-semibold transition ${
                        isActive
                          ? "border-primary bg-accent-soft text-primary"
                          : "border-border text-muted hover:border-primary/40"
                      }`}
                    >
                      <Icon size={17} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Full name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
                required
              />
            </div>

            <div>
              <label
                htmlFor="zone"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Community / Zone
              </label>

              <input
                id="zone"
                name="zone"
                type="text"
                value={form.zone}
                onChange={handleChange}
                placeholder="e.g. Oak Ridge"
                className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Phone number
                <span className="ml-1 font-normal text-muted">
                  (optional)
                </span>
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="080..."
                className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-5 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link
              to={form.role === "admin" ? "/admin/login" : "/login"}
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;

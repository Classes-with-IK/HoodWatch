import { useState } from "react";
import { Mail, MapPin, Phone, ShieldCheck, Save, BadgeCheck } from "lucide-react";

import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { initialsFromName } from "../lib/format";

const ROLE_LABELS = {
  resident: "Resident",
  patrol_officer: "Patrol officer",
  admin: "Admin",
};

function Profile() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    zone: user?.zone ?? "",
    phone: user?.phone ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setSaved(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSaved(false);
    setSaving(true);

    try {
      const response = await apiFetch("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(form),
      });

      setUser(response.user ?? { ...user, ...form });
      setSaved(true);
    } catch (err) {
      setError(err.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div>
        <p className="font-display text-sm font-medium text-primary">
          Your account
        </p>

        <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Profile
        </h1>

        <p className="mt-2 text-sm text-muted">
          This is what your neighbors and patrol see when you report or
          comment.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
            {initialsFromName(user.name)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-ink">
              {user.name}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={14} />
                {ROLE_LABELS[user.role] ?? user.role}
              </span>

              {user.badgeNumber && (
                <span className="inline-flex items-center gap-1">
                  <BadgeCheck size={14} />
                  {user.badgeNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-ink">
            <Mail size={15} className="text-muted" />
            {user.email}
          </div>

          {user.zone && (
            <div className="flex items-center gap-2 text-sm text-ink">
              <MapPin size={15} className="text-muted" />
              {user.zone}
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-2xl border border-border bg-surface p-6"
      >
        <h2 className="text-base font-semibold text-ink">Edit details</h2>
        <p className="mt-1 text-sm text-muted">
          Update the information other residents and patrol see.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-border bg-critical-soft p-3 text-sm text-critical">
            {error}
          </div>
        )}

        {saved && (
          <div className="mt-4 rounded-lg border border-border bg-accent-soft p-3 text-sm text-primary">
            Your profile has been updated.
          </div>
        )}

        <div className="mt-4 space-y-4">
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
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
              required
            />
          </div>

          <div>
            <label
              htmlFor="zone"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Community / zone
            </label>

            <input
              id="zone"
              name="zone"
              type="text"
              value={form.zone}
              onChange={handleChange}
              placeholder="e.g. Oak Ridge Sector B"
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Phone number
            </label>

            <div className="relative">
              <Phone
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="h-11 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none transition focus:border-primary"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}

export default Profile;

import { useState } from "react";

import { apiFetch } from "../lib/api";

const SEVERITY_OPTIONS = ["info", "warning", "critical", "emergency"];

const INITIAL_FORM = {
  title: "",
  message: "",
  severity: "warning",
  targetZone: "",
  expiresInHours: "",
};

function AlertBroadcastForm({ onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      setError("Title and message are required.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await apiFetch("/alerts", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          message: form.message.trim(),
          severity: form.severity,
          ...(form.targetZone.trim() ? { targetZone: form.targetZone.trim() } : {}),
          ...(form.expiresInHours
            ? { expiresInHours: Number(form.expiresInHours) }
            : {}),
        }),
      });

      setForm(INITIAL_FORM);
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Unable to broadcast this alert.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-lg border border-border bg-critical-soft p-3 text-sm text-critical">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Title
          </label>
          <input
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Water main break notice"
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Message
          </label>
          <textarea
            name="message"
            rows={3}
            value={form.message}
            onChange={handleChange}
            placeholder="What should residents know or do?"
            className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Severity
            </label>
            <select
              name="severity"
              value={form.severity}
              onChange={handleChange}
              className="h-11 w-full rounded-lg border border-border bg-surface px-2.5 text-sm outline-none focus:border-primary"
            >
              {SEVERITY_OPTIONS.map((severity) => (
                <option key={severity} value={severity}>
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Target zone
              <span className="ml-1 font-normal text-muted">(optional)</span>
            </label>
            <input
              name="targetZone"
              type="text"
              value={form.targetZone}
              onChange={handleChange}
              placeholder="All districts"
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Expires in (hours)
              <span className="ml-1 font-normal text-muted">(optional)</span>
            </label>
            <input
              name="expiresInHours"
              type="number"
              min="1"
              value={form.expiresInHours}
              onChange={handleChange}
              placeholder="24"
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Broadcasting..." : "Broadcast to zone"}
      </button>
    </form>
  );
}

export default AlertBroadcastForm;

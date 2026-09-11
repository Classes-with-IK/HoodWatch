import { useEffect, useState } from "react";
import { Bell, Megaphone, X } from "lucide-react";

import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import AlertCard from "../components/AlertCard";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const SEVERITY_OPTIONS = ["info", "warning", "critical", "emergency"];

const INITIAL_ALERT_FORM = {
  title: "",
  message: "",
  severity: "warning",
  targetZone: "",
  expiresInHours: "",
};

function Alerts() {
  const { user } = useAuth();
  const canBroadcast = user?.role === "admin" || user?.role === "patrol_officer";

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [zoneFilter, setZoneFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_ALERT_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAlerts() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (zoneFilter.trim()) params.set("zone", zoneFilter.trim());
      if (severityFilter) params.set("severity", severityFilter);

      const query = params.toString();

      try {
        const response = await apiFetch(
          `/alerts${query ? `?${query}` : ""}`,
          { signal: controller.signal },
        );

        setAlerts(response.alerts ?? response.data ?? []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load safety alerts.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
    return () => controller.abort();
  }, [zoneFilter, severityFilter, reloadKey]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleBroadcast(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      setFormError("Title and message are required.");
      return;
    }

    setFormError("");
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

      setForm(INITIAL_ALERT_FORM);
      setShowForm(false);
      setReloadKey((key) => key + 1);
    } catch (err) {
      setFormError(err.message || "Unable to broadcast this alert.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-sm font-medium text-primary">
            Safety alerts
          </p>

          <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
            Broadcasts for your zone
          </h1>

          <p className="mt-2 max-w-xl text-sm text-muted">
            Official notices from patrol and administration.
          </p>
        </div>

        {canBroadcast && (
          <button
            onClick={() => setShowForm((current) => !current)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            <Megaphone size={16} />
            {showForm ? "Close" : "Broadcast alert"}
          </button>
        )}
      </div>

      {showForm && canBroadcast && (
        <form
          onSubmit={handleBroadcast}
          className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-card"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">
              Broadcast a safety alert
            </h2>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-bg"
              aria-label="Close form"
            >
              <X size={16} />
            </button>
          </div>

          {formError && (
            <div className="mt-3 rounded-lg border border-border bg-critical-soft p-3 text-sm text-critical">
              {formError}
            </div>
          )}

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Title
              </label>
              <input
                name="title"
                type="text"
                value={form.title}
                onChange={handleFormChange}
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
                onChange={handleFormChange}
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
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
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
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={zoneFilter}
          onChange={(event) => setZoneFilter(event.target.value)}
          placeholder="Filter by zone..."
          className="h-10 flex-1 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary sm:max-w-xs"
        />

        <select
          value={severityFilter}
          onChange={(event) => setSeverityFilter(event.target.value)}
          className="h-10 rounded-lg border border-border bg-surface px-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="">All severities</option>
          {SEVERITY_OPTIONS.map((severity) => (
            <option key={severity} value={severity}>
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        {loading ? (
          <LoadingState rows={3} />
        ) : error ? (
          <ErrorState
            description={error}
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        ) : alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title="No active alerts"
            description="There are no safety alerts for this zone right now."
          />
        )}
      </div>
    </div>
  );
}

export default Alerts;

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import { apiFetch } from "../lib/api";
import { formatCategory } from "../lib/format";

const CATEGORY_OPTIONS = [
  "theft",
  "vandalism",
  "suspicious_activity",
  "hazard",
  "lost_and_found",
  "noise_complaint",
  "emergency",
  "other",
];

const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"];

const INITIAL_FORM = {
  title: "",
  description: "",
  category: "",
  priority: "medium",
  address: "",
  zone: "",
};

function ReportIncident() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }

  function validate() {
    const errors = {};
    if (!form.title.trim()) errors.title = "Give the report a short title.";
    if (!form.description.trim())
      errors.description = "Describe what happened.";
    if (!form.category) errors.category = "Choose a category.";
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitError("");
    setSubmitting(true);

    try {
      const location =
        form.address.trim() || form.zone.trim()
          ? {
              ...(form.address.trim() ? { address: form.address.trim() } : {}),
              ...(form.zone.trim() ? { zone: form.zone.trim() } : {}),
            }
          : undefined;

      const response = await apiFetch("/incidents", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          priority: form.priority,
          ...(location ? { location } : {}),
        }),
      });

      const created = response.incident ?? response.data;
      navigate(created?.id ? `/incidents/${created.id}` : "/incidents");
    } catch (err) {
      setSubmitError(err.message || "Unable to submit your report.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <Link
        to="/incidents"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-primary"
      >
        <ArrowLeft size={15} />
        Back to incidents
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-primary">
          <ShieldAlert size={20} />
        </div>

        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Report an incident
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            A few clear details help your neighbors and patrol respond well.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5 rounded-2xl border border-border bg-surface p-6"
      >
        {submitError && (
          <div className="rounded-lg border border-border bg-critical-soft p-3 text-sm text-critical">
            {submitError}
          </div>
        )}

        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-ink">
            Title
          </label>

          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Suspicious vehicle near playground"
            className={`h-11 w-full rounded-lg border bg-surface px-3 text-sm outline-none transition focus:border-primary ${
              fieldErrors.title ? "border-critical" : "border-border"
            }`}
          />

          {fieldErrors.title && (
            <p className="mt-1.5 text-xs text-critical">{fieldErrors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="What did you see or notice? Include time and any details that would help."
            className={`w-full resize-none rounded-lg border bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-primary ${
              fieldErrors.description ? "border-critical" : "border-border"
            }`}
          />

          {fieldErrors.description && (
            <p className="mt-1.5 text-xs text-critical">
              {fieldErrors.description}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="category"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Category
            </label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`h-11 w-full rounded-lg border bg-surface px-2.5 text-sm outline-none transition focus:border-primary ${
                fieldErrors.category ? "border-critical" : "border-border"
              }`}
            >
              <option value="">Select a category</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {formatCategory(category)}
                </option>
              ))}
            </select>

            {fieldErrors.category && (
              <p className="mt-1.5 text-xs text-critical">
                {fieldErrors.category}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="priority"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Priority
            </label>

            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="h-11 w-full rounded-lg border border-border bg-surface px-2.5 text-sm outline-none transition focus:border-primary"
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-ink">
              Address
              <span className="ml-1 font-normal text-muted">(optional)</span>
            </label>

            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              placeholder="e.g. Corner of 5th Ave & Elm St"
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="zone" className="mb-1.5 block text-sm font-medium text-ink">
              Zone
              <span className="ml-1 font-normal text-muted">(optional)</span>
            </label>

            <input
              id="zone"
              name="zone"
              type="text"
              value={form.zone}
              onChange={handleChange}
              placeholder="e.g. North Maple District"
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit report"}
          </button>

          <Link
            to="/incidents"
            className="text-sm font-medium text-muted hover:text-ink"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ReportIncident;

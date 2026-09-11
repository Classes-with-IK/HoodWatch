import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ShieldAlert, Plus } from "lucide-react";

import { apiFetch } from "../lib/api";
import IncidentCard from "../components/IncidentCard";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { formatCategory } from "../lib/format";

const STATUS_OPTIONS = [
  "reported",
  "under_review",
  "in_progress",
  "resolved",
  "dismissed",
];

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

const EMPTY_FILTERS = { status: "", category: "", priority: "", zone: "" };

function Incidents() {
  const [searchParams] = useSearchParams();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [filters, setFilters] = useState({
    status: searchParams.get("status") ?? "",
    category: searchParams.get("category") ?? "",
    priority: searchParams.get("priority") ?? "",
    zone: searchParams.get("zone") ?? "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  useEffect(() => {
    const controller = new AbortController();

    async function loadIncidents() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (filters.status) params.set("status", filters.status);
      if (filters.category) params.set("category", filters.category);
      if (filters.priority) params.set("priority", filters.priority);
      if (filters.zone.trim()) params.set("zone", filters.zone.trim());

      const query = params.toString();

      try {
        const response = await apiFetch(
          `/incidents${query ? `?${query}` : ""}`,
          { signal: controller.signal },
        );

        setIncidents(response.incidents ?? response.data ?? []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load incidents.");
        }
      } finally {
        setLoading(false);
      }
    }

    const debounce = setTimeout(loadIncidents, search ? 350 : 0);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [search, filters, reloadKey]);

  const hasResults = incidents.length > 0;

  const filterChips = useMemo(() => {
    const chips = [];
    if (filters.status)
      chips.push({ key: "status", label: filters.status.replace(/_/g, " ") });
    if (filters.category)
      chips.push({ key: "category", label: formatCategory(filters.category) });
    if (filters.priority)
      chips.push({ key: "priority", label: `${filters.priority} priority` });
    if (filters.zone) chips.push({ key: "zone", label: filters.zone });
    return chips;
  }, [filters]);

  function clearFilter(key) {
    setFilters((current) => ({ ...current, [key]: "" }));
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-sm font-medium text-primary">
            Incident feed
          </p>

          <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
            What&apos;s happening nearby
          </h1>

          <p className="mt-2 max-w-xl text-sm text-muted">
            Structured safety reports from residents in your community.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          <Plus size={16} />
          Report incident
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, description, or location..."
              className="h-10 w-full rounded-lg border border-border bg-bg pl-9 pr-3 text-sm outline-none transition focus:border-primary"
            />
          </div>

          <button
            onClick={() => setShowFilters((current) => !current)}
            className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${
              showFilters || activeFilterCount > 0
                ? "border-primary bg-accent-soft text-primary"
                : "border-border text-ink hover:border-primary/40"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, status: event.target.value }))
                }
                className="h-10 w-full rounded-lg border border-border bg-surface px-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, category: event.target.value }))
                }
                className="h-10 w-full rounded-lg border border-border bg-surface px-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">All categories</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {formatCategory(category)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, priority: event.target.value }))
                }
                className="h-10 w-full rounded-lg border border-border bg-surface px-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">All priorities</option>
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Zone
              </label>
              <input
                type="text"
                value={filters.zone}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, zone: event.target.value }))
                }
                placeholder="e.g. Oak Ridge"
                className="h-10 w-full rounded-lg border border-border bg-surface px-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {filterChips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {filterChips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => clearFilter(chip.key)}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-primary"
              >
                {chip.label}
                <X size={12} />
              </button>
            ))}

            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-xs font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="mt-5">
        {loading ? (
          <LoadingState rows={4} />
        ) : error ? (
          <ErrorState
            description={error}
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        ) : hasResults ? (
          <div className="space-y-3">
            {incidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ShieldAlert}
            title={
              activeFilterCount > 0 || search
                ? "No incidents match these filters"
                : "No incidents reported yet"
            }
            description={
              activeFilterCount > 0 || search
                ? "Try adjusting your filters or search terms."
                : "When something is reported in your community, it will show up here."
            }
          />
        )}
      </div>
    </div>
  );
}

export default Incidents;

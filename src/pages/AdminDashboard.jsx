import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Radar,
  ShieldAlert,
  Footprints,
  Bell,
  ArrowRight,
  Megaphone,
  X,
} from "lucide-react";

import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import AlertBroadcastForm from "../components/AlertBroadcastForm";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import { formatCategory, formatRelativeTime } from "../lib/format";

function AdminDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [needsAttention, setNeedsAttention] = useState([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);

  const [activePatrols, setActivePatrols] = useState([]);
  const [patrolsLoading, setPatrolsLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await apiFetch("/public/stats");
        setStats(response.data);
      } catch {
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    }

    loadStats();
  }, [reloadKey]);

  useEffect(() => {
    async function loadIncidents() {
      setIncidentsLoading(true);

      try {
        const response = await apiFetch("/incidents?status=reported");
        setNeedsAttention(response.incidents ?? response.data ?? []);
      } catch {
        setNeedsAttention([]);
      } finally {
        setIncidentsLoading(false);
      }
    }

    loadIncidents();
  }, [reloadKey]);

  useEffect(() => {
    async function loadPatrols() {
      setPatrolsLoading(true);

      try {
        const response = await apiFetch("/patrols?status=active");
        setActivePatrols(response.patrols ?? response.data ?? []);
      } catch {
        setActivePatrols([]);
      } finally {
        setPatrolsLoading(false);
      }
    }

    loadPatrols();
  }, [reloadKey]);

  const overview = stats?.overview;

  const cards = [
    { label: "Total incidents", value: overview?.totalIncidentsReported ?? 0, icon: ShieldAlert },
    { label: "Active patrol shifts", value: overview?.activePatrolShifts ?? 0, icon: Footprints },
    { label: "Active alerts", value: overview?.activeSafetyAlerts ?? 0, icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-bg p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
            <Radar size={20} />
          </div>

          <div>
            <p className="font-display text-sm font-medium text-primary">
              Control room
            </p>

            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              {user?.name ? `Welcome, ${user.name.split(" ")[0]}` : "Admin overview"}
            </h1>
          </div>
        </div>

        <button
          onClick={() => setShowForm((current) => !current)}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          <Megaphone size={16} />
          {showForm ? "Close" : "Broadcast alert"}
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
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

          <AlertBroadcastForm
            onSuccess={() => {
              setShowForm(false);
              setReloadKey((key) => key + 1);
            }}
          />
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-surface p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted">{card.label}</p>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-primary">
                  <Icon size={18} />
                </div>
              </div>

              <p className="mt-4 text-3xl font-semibold text-ink">
                {statsLoading ? "—" : card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">
                Needs attention
              </h2>
              <p className="mt-1 text-sm text-muted">
                Newly reported incidents that haven&apos;t been triaged yet.
              </p>
            </div>

            <Link
              to="/incidents?status=reported"
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-4">
            {incidentsLoading ? (
              <LoadingState rows={3} />
            ) : needsAttention.length === 0 ? (
              <EmptyState
                icon={ShieldAlert}
                title="Nothing waiting on you"
                description="All incoming reports have been triaged."
              />
            ) : (
              <div className="space-y-3">
                {needsAttention.slice(0, 6).map((incident) => (
                  <Link
                    key={incident.id}
                    to={`/incidents/${incident.id}`}
                    className="block rounded-xl border border-border bg-surface p-4 shadow-card transition hover:border-primary/40 hover:shadow-card-hover"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {incident.title}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {formatCategory(incident.category)} ·{" "}
                          {formatRelativeTime(incident.createdAt)}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-1.5">
                        <PriorityBadge priority={incident.priority} />
                        <StatusBadge status={incident.status} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Active patrols</h2>

            <Link to="/patrols" className="text-xs font-semibold text-primary">
              View all
            </Link>
          </div>

          <div className="mt-3 space-y-3">
            {patrolsLoading ? (
              <LoadingState rows={2} />
            ) : activePatrols.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
                <p className="text-sm text-muted">No patrols active right now.</p>
              </div>
            ) : (
              activePatrols.map((patrol) => (
                <div
                  key={patrol.id}
                  className="rounded-xl border border-border bg-surface p-4 shadow-card"
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    <p className="text-sm font-semibold text-ink">
                      {patrol.zone || "Unassigned zone"}
                    </p>
                  </div>

                  <p className="mt-1.5 text-xs text-muted">
                    {patrol.officerName || "Officer"} · started{" "}
                    {formatRelativeTime(patrol.startTime)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  Bell,
  Footprints,
} from "lucide-react";

import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import IncidentCard from "../components/IncidentCard";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import SeverityBadge from "../components/SeverityBadge";
import { formatRelativeTime } from "../lib/format";

function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [incidents, setIncidents] = useState([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [incidentsError, setIncidentsError] = useState("");

  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

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
  }, []);

  useEffect(() => {
    async function loadIncidents() {
      try {
        const zone = user?.role === "admin" ? null : user?.zone;
        const path = zone ? `/incidents?zone=${encodeURIComponent(zone)}` : "/incidents";
        const response = await apiFetch(path);

        setIncidents(response.incidents ?? response.data ?? []);
      } catch (err) {
        setIncidentsError(err.message || "Unable to load recent incidents.");
      } finally {
        setIncidentsLoading(false);
      }
    }

    loadIncidents();
  }, [user?.zone, user?.role]);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const zone = user?.role === "admin" ? null : user?.zone;
        const path = zone ? `/alerts?zone=${encodeURIComponent(zone)}` : "/alerts";
        const response = await apiFetch(path);

        setAlerts(response.alerts ?? response.data ?? []);
      } catch {
        setAlerts([]);
      } finally {
        setAlertsLoading(false);
      }
    }

    loadAlerts();
  }, [user?.zone, user?.role]);

  const overview = stats?.overview;
  const topAlert = alerts.find((alert) => alert.severity === "emergency") ?? alerts[0];
  const firstName = user?.name?.split(" ")[0];

  const cards = [
    {
      label: "Total incidents",
      value: overview?.totalIncidentsReported ?? 0,
      icon: ShieldAlert,
    },
    {
      label: "In progress",
      value: overview?.inProgressIncidents ?? 0,
      icon: Clock,
    },
    {
      label: "Resolved",
      value: overview?.resolvedIncidents ?? 0,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-sm font-medium text-primary">
            {user?.role === "admin" ? "All zones" : user?.zone || "Your community"}
          </p>

          <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
            {firstName ? `Welcome back, ${firstName}` : "Community overview"}
          </h1>

          <p className="mt-2 max-w-xl text-sm text-muted">
            Here&apos;s what&apos;s happening around you right now.
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

      {!alertsLoading && topAlert && (
        <Link
          to="/alerts"
          className={`mt-6 flex items-start gap-3 rounded-xl border p-4 transition hover:shadow-sm ${
            topAlert.severity === "emergency"
              ? "border-emergency/50 bg-emergency-soft"
              : "border-warning/40 bg-warning-soft"
          }`}
        >
          <Bell size={18} className="mt-0.5 shrink-0 text-ink" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-ink">
                {topAlert.title}
              </p>
              <SeverityBadge severity={topAlert.severity} />
            </div>
            <p className="mt-1 truncate text-sm text-ink/80">{topAlert.message}</p>
          </div>

          <ArrowRight size={16} className="mt-1 shrink-0 text-muted" />
        </Link>
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
                Recent incidents
              </h2>
              <p className="mt-1 text-sm text-muted">
                Recent safety reports in your community.
              </p>
            </div>

            <Link
              to="/incidents"
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-4">
            {incidentsLoading ? (
              <LoadingState rows={3} />
            ) : incidentsError ? (
              <div className="rounded-xl border border-border bg-surface p-5 text-sm text-critical">
                {incidentsError}
              </div>
            ) : incidents.length === 0 ? (
              <EmptyState
                icon={ShieldAlert}
                title="No recent incidents"
                description="There are no incident reports to display right now."
              />
            ) : (
              <div className="space-y-3">
                {incidents.slice(0, 4).map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2">
              <Footprints size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-ink">
                Patrol coverage
              </h3>
            </div>

            <p className="mt-2 text-lg font-semibold text-ink">
              {statsLoading
                ? "Loading..."
                : `${overview?.activePatrolShifts ?? 0} active ${
                    overview?.activePatrolShifts === 1 ? "shift" : "shifts"
                  }`}
            </p>

            <Link
              to="/patrols"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary"
            >
              View patrols
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-primary" />
                <h3 className="text-sm font-semibold text-ink">
                  Safety alerts
                </h3>
              </div>

              <Link
                to="/alerts"
                className="text-xs font-semibold text-primary"
              >
                View all
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {alertsLoading ? (
                <p className="text-sm text-muted">Loading...</p>
              ) : alerts.length === 0 ? (
                <p className="text-sm text-muted">No active alerts.</p>
              ) : (
                alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={alert.severity} />
                      <span className="truncate text-xs text-muted">
                        {formatRelativeTime(alert.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-medium text-ink">
                      {alert.title}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

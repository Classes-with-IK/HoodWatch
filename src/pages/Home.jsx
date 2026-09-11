import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

function Home() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await apiFetch("/public/stats");
        setStats(data.data);
      } catch {
        setError("Unable to load community statistics.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const overview = stats?.overview;

  const cards = [
    { label: "Total incidents", value: overview?.totalIncidentsReported ?? 0, icon: ShieldAlert },
    { label: "In progress", value: overview?.inProgressIncidents ?? 0, icon: AlertTriangle },
    { label: "Safety alerts", value: overview?.activeSafetyAlerts ?? 0, icon: Bell },
    { label: "Resolved", value: overview?.resolvedIncidents ?? 0, icon: CheckCircle },
  ];

  return (
    <div>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <p className="font-display text-sm font-medium italic text-primary">
              A safety coordination system, not a social network
            </p>

            <h1 className="mt-3 font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Something happens. Your neighbors know, and it gets handled.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-muted">
              HoodWatch turns scattered concern into a clear record — reported,
              understood, assigned, and resolved — so your community always
              knows where things stand.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                  Go to dashboard
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
                  >
                    Join your community
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    to="/login"
                    className="inline-flex h-11 items-center rounded-lg border border-border px-5 text-sm font-semibold text-ink transition hover:border-primary/40"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {error && (
          <div className="mb-6 rounded-xl border border-border bg-surface p-4 text-sm text-critical">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div key={card.label} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted">{card.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-ink">
                      {loading ? "—" : card.value}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-primary">
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">Resolution rate</p>
              <CheckCircle size={20} className="text-primary" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {loading ? "—" : (overview?.resolutionRatePercentage ?? "0%")}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">Active patrol shifts</p>
              <ShieldAlert size={20} className="text-primary" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {loading ? "—" : (overview?.activePatrolShifts ?? 0)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

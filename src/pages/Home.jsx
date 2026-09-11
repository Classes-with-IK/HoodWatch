import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  FileText,
  Search,
  UserCheck,
  BadgeCheck,
  Footprints,
  Megaphone,
  Users,
} from "lucide-react";

import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

const STEPS = [
  {
    icon: FileText,
    title: "Reported",
    description: "A resident notices something and files a structured report in under a minute.",
  },
  {
    icon: Search,
    title: "Understood",
    description: "Neighbors confirm, comment, and add context patrol and admins can act on.",
  },
  {
    icon: UserCheck,
    title: "Assigned",
    description: "Patrol officers pick it up, log checkpoints, and move it into progress.",
  },
  {
    icon: CheckCircle,
    title: "Resolved",
    description: "Status updates visibly, so everyone knows it's handled — no guessing.",
  },
];

const ROLE_CARDS = [
  {
    icon: Users,
    role: "Residents",
    description:
      "Report incidents, confirm what's already known, and get zone-specific safety alerts.",
  },
  {
    icon: Footprints,
    role: "Patrol officers",
    description:
      "Start and log shifts with checkpoints, and move incidents through their lifecycle.",
  },
  {
    icon: Megaphone,
    role: "Admins",
    description:
      "Broadcast severity-ranked alerts to a zone, with expiry built in.",
  },
];

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
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
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

      {/* Live stats */}
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

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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

      {/* How it works */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-xl">
            <p className="font-display text-sm font-medium italic text-primary">
              How it works
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">
              From first report to resolution
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="relative rounded-xl border border-border bg-bg/60 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-primary">
                      <Icon size={17} />
                    </div>
                    <span className="font-display text-lg text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-xl">
          <p className="font-display text-sm font-medium italic text-primary">
            Built for every role
          </p>
          <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">
            One system, three responsibilities
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {ROLE_CARDS.map((card) => {
            const Icon = card.icon;

            return (
              <div key={card.role} className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-primary">
                  <Icon size={20} />
                </div>

                <h3 className="mt-4 font-display text-lg font-medium text-ink">
                  {card.role}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted">{card.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Closing CTA */}
      {!user && (
        <section className="border-t border-border bg-ink">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-2 text-white/70">
                <BadgeCheck size={16} />
                <span className="text-sm font-medium">Free to join your zone</span>
              </div>

              <h2 className="mt-2 font-display text-2xl font-medium text-white sm:text-3xl">
                Your community is already watching out for you.
              </h2>
            </div>

            <Link
              to="/register"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-ink transition hover:bg-white/90"
            >
              Create your account
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;

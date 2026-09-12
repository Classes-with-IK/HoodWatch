import { useEffect, useState } from "react";
import { Footprints, MapPin, Play, Square, Flag, Clock } from "lucide-react";

import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { formatDateTime, formatRelativeTime } from "../lib/format";

const CHECKPOINT_STATUS = ["clear", "issue_noted", "hazard_resolved"];

function Patrols() {
  const { user } = useAuth();
  const isOfficer = user?.role === "patrol_officer" || user?.role === "admin";

  const [patrols, setPatrols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [startForm, setStartForm] = useState({ zone: "", initialNotes: "" });
  const [starting, setStarting] = useState(false);
  const [actionError, setActionError] = useState("");

  const [checkpointForm, setCheckpointForm] = useState({
    name: "",
    status: "clear",
    notes: "",
  });
  const [loggingCheckpoint, setLoggingCheckpoint] = useState(false);

  const [summary, setSummary] = useState("");
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    async function loadPatrols() {
      setLoading(true);
      setError("");

      try {
        const response = await apiFetch("/patrols");
        setPatrols(response.patrols ?? response.data ?? []);
      } catch (err) {
        setError(err.message || "Unable to load patrol shifts.");
      } finally {
        setLoading(false);
      }
    }

    loadPatrols();
  }, [reloadKey]);

  const activeShift = patrols.find(
    (patrol) => patrol.status === "active" && patrol.officerId === user?.id,
  );
  const pastShifts = patrols.filter((patrol) => patrol.id !== activeShift?.id);

  async function handleStart(event) {
    event.preventDefault();
    setActionError("");
    setStarting(true);

    try {
      await apiFetch("/patrols/start", {
        method: "POST",
        body: JSON.stringify({
          zone: startForm.zone || undefined,
          initialNotes: startForm.initialNotes || undefined,
        }),
      });

      setStartForm({ zone: "", initialNotes: "" });
      setReloadKey((key) => key + 1);
    } catch (err) {
      setActionError(err.message || "Unable to start patrol.");
    } finally {
      setStarting(false);
    }
  }

  async function handleCheckpoint(event) {
    event.preventDefault();
    if (!activeShift || !checkpointForm.name.trim()) return;

    setActionError("");
    setLoggingCheckpoint(true);

    try {
      await apiFetch(`/patrols/${activeShift.id}/checkpoint`, {
        method: "POST",
        body: JSON.stringify(checkpointForm),
      });

      setCheckpointForm({ name: "", status: "clear", notes: "" });
      setReloadKey((key) => key + 1);
    } catch (err) {
      setActionError(err.message || "Unable to log checkpoint.");
    } finally {
      setLoggingCheckpoint(false);
    }
  }

  async function handleEnd(event) {
    event.preventDefault();
    if (!activeShift) return;

    setActionError("");
    setEnding(true);

    try {
      await apiFetch(`/patrols/${activeShift.id}/end`, {
        method: "POST",
        body: JSON.stringify({ summary: summary || undefined }),
      });

      setSummary("");
      setReloadKey((key) => key + 1);
    } catch (err) {
      setActionError(err.message || "Unable to end patrol.");
    } finally {
      setEnding(false);
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div>
        <p className="font-display text-sm font-medium text-primary">
          {isOfficer ? "Operations" : "Community"}
        </p>

        <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Patrol shifts
        </h1>

        <p className="mt-2 max-w-xl text-sm text-muted">
          {isOfficer
            ? "Start a shift, log checkpoints, and close out when you're done."
            : "See when and where patrol has been active in your community."}
        </p>
      </div>

      {actionError && (
        <div className="mt-4 rounded-lg border border-border bg-critical-soft p-3 text-sm text-critical">
          {actionError}
        </div>
      )}

      {isOfficer && !activeShift && (
        <form
          onSubmit={handleStart}
          className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-primary">
              <Play size={18} />
            </div>
            <h2 className="text-base font-semibold text-ink">Start a patrol</h2>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              value={startForm.zone}
              onChange={(event) =>
                setStartForm((current) => ({ ...current, zone: event.target.value }))
              }
              placeholder="Zone (e.g. Oak Ridge Sector B)"
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
            />

            <input
              type="text"
              value={startForm.initialNotes}
              onChange={(event) =>
                setStartForm((current) => ({
                  ...current,
                  initialNotes: event.target.value,
                }))
              }
              placeholder="Initial notes (optional)"
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={starting}
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play size={16} />
            {starting ? "Starting..." : "Start patrol"}
          </button>
        </form>
      )}

      {isOfficer && activeShift && (
        <div className="mt-6 rounded-2xl border border-primary/30 bg-accent-soft/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
              <h2 className="text-base font-semibold text-ink">
                Active shift · {activeShift.zone || "Unassigned zone"}
              </h2>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <Clock size={12} />
              Started {formatDateTime(activeShift.startTime)}
            </span>
          </div>

          {activeShift.checkpoints?.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              {activeShift.checkpoints.map((checkpoint, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3.5 py-2.5 text-sm"
                >
                  <span className="font-medium text-ink">{checkpoint.name}</span>
                  <span className="text-xs text-muted">
                    {checkpoint.status?.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={handleCheckpoint}
            className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_160px_auto]"
          >
            <input
              type="text"
              value={checkpointForm.name}
              onChange={(event) =>
                setCheckpointForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Checkpoint name"
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
            />

            <select
              value={checkpointForm.status}
              onChange={(event) =>
                setCheckpointForm((current) => ({ ...current, status: event.target.value }))
              }
              className="h-10 rounded-lg border border-border bg-surface px-2.5 text-sm outline-none focus:border-primary"
            >
              {CHECKPOINT_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={loggingCheckpoint || !checkpointForm.name.trim()}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-primary px-4 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Flag size={14} />
              Log
            </button>
          </form>

          <form
            onSubmit={handleEnd}
            className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]"
          >
            <input
              type="text"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Closing summary (optional)"
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
            />

            <button
              type="submit"
              disabled={ending}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-critical px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Square size={14} />
              {ending ? "Ending..." : "End patrol"}
            </button>
          </form>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-base font-semibold text-ink">
          {isOfficer ? "Past shifts" : "Recent patrol activity"}
        </h2>

        <div className="mt-3">
          {loading ? (
            <LoadingState rows={3} />
          ) : error ? (
            <ErrorState
              description={error}
              onRetry={() => setReloadKey((key) => key + 1)}
            />
          ) : pastShifts.length > 0 ? (
            <div className="space-y-3">
              {pastShifts.map((patrol) => (
                <div
                  key={patrol.id}
                  className="rounded-xl border border-border bg-surface p-5 shadow-card"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">
                        {patrol.zone || "Unassigned zone"}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                        <MapPin size={12} />
                        {patrol.officerName || "Officer"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        patrol.status === "active"
                          ? "bg-accent-soft text-primary"
                          : "bg-bg text-muted"
                      }`}
                    >
                      {patrol.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted">
                    <span>Started {formatRelativeTime(patrol.startTime)}</span>
                    {patrol.endTime && (
                      <span>Ended {formatRelativeTime(patrol.endTime)}</span>
                    )}
                    {patrol.checkpoints?.length > 0 && (
                      <span>{patrol.checkpoints.length} checkpoints logged</span>
                    )}
                  </div>

                  {patrol.summary && (
                    <p className="mt-2 text-sm text-ink">{patrol.summary}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Footprints}
              title="No patrol shifts yet"
              description="Shift history will show up here once patrol activity begins."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Patrols;

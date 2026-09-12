import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Tag,
  Clock,
  User,
  ShieldCheck,
  ArrowBigUp,
  Trash2,
  Send,
} from "lucide-react";

import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import StatusTimeline from "../components/StatusTimeline";
import CommentList from "../components/CommentList";
import Modal from "../components/Modal";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { formatCategory, formatDateTime } from "../lib/format";

const STATUS_OPTIONS = [
  "reported",
  "under_review",
  "in_progress",
  "resolved",
  "dismissed",
];

function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [upvoting, setUpvoting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [statusForm, setStatusForm] = useState({ status: "", notes: "", assignedOfficerId: "" });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [officers, setOfficers] = useState([]);

  const canManageStatus =
    user && (user.role === "patrol_officer" || user.role === "admin");

  const isOwner =
    user && incident?.reportedBy?.userId === user.id;
  const canDelete = isOwner || user?.role === "admin";

  useEffect(() => {
    loadIncident();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!canManageStatus) return;

    async function loadOfficers() {
      try {
        const response = await apiFetch("/patrols");
        const patrols = response.patrols ?? response.data ?? [];

        const unique = new Map();
        patrols.forEach((patrol) => {
          if (patrol.officerId && patrol.officerName) {
            unique.set(patrol.officerId, patrol.officerName);
          }
        });

        setOfficers(
          Array.from(unique, ([id, name]) => ({ id, name })),
        );
      } catch {
        setOfficers([]);
      }
    }

    loadOfficers();
  }, [canManageStatus]);

  async function loadIncident() {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch(`/incidents/${id}`);
      const data = response.incident ?? response.data ?? response;

      setIncident(data);
      setHasUpvoted(Boolean(data.upvotes?.includes(user?.id)));
      setStatusForm({
        status: data.status ?? "",
        notes: "",
        assignedOfficerId: data.assignedTo?.userId ?? "",
      });
    } catch (err) {
      setError(err.message || "Unable to load this incident.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpvote() {
    setUpvoting(true);

    try {
      const response = await apiFetch(`/incidents/${id}/upvote`, {
        method: "POST",
      });

      const updated = response.incident ?? response.data;

      if (updated) {
        setIncident(updated);
        setHasUpvoted(Boolean(updated.upvotes?.includes(user?.id)));
      } else {
        setHasUpvoted((current) => !current);
        setIncident((current) => {
          if (!current) return current;
          const upvotes = current.upvotes ?? [];
          const nextUpvotes = hasUpvoted
            ? upvotes.filter((entry) => entry !== user?.id)
            : [...upvotes, user?.id];
          return { ...current, upvotes: nextUpvotes };
        });
      }
    } catch (err) {
      setError(err.message || "Unable to record your confirmation.");
    } finally {
      setUpvoting(false);
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();

    if (!commentText.trim()) return;

    setCommentError("");
    setPostingComment(true);

    try {
      const response = await apiFetch(`/incidents/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ message: commentText.trim() }),
      });

      const updated = response.incident ?? response.data;

      if (updated) {
        setIncident(updated);
      } else {
        setIncident((current) => ({
          ...current,
          comments: [
            ...(current.comments ?? []),
            {
              id: response.id ?? `temp-${Date.now()}`,
              userId: user?.id,
              userName: user?.name,
              userRole: user?.role,
              message: commentText.trim(),
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      }

      setCommentText("");
    } catch (err) {
      setCommentError(err.message || "Unable to post your comment.");
    } finally {
      setPostingComment(false);
    }
  }

  async function handleDelete() {
    setDeleteError("");
    setDeleting(true);

    try {
      await apiFetch(`/incidents/${id}`, { method: "DELETE" });
      navigate("/incidents");
    } catch (err) {
      setDeleteError(err.message || "Unable to delete this incident.");
      setDeleting(false);
    }
  }

  async function handleStatusSubmit(event) {
    event.preventDefault();

    setStatusError("");
    setUpdatingStatus(true);

    try {
      const response = await apiFetch(`/incidents/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: statusForm.status,
          notes: statusForm.notes || undefined,
          assignedOfficerId: statusForm.assignedOfficerId || undefined,
        }),
      });

      const updated = response.incident ?? response.data;
      setIncident((current) => updated ?? { ...current, status: statusForm.status });
      setStatusForm((current) => ({ ...current, notes: "" }));
    } catch (err) {
      setStatusError(err.message || "Unable to update the status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <LoadingState rows={3} />
      </div>
    );
  }

  if (error && !incident) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState description={error} onRetry={loadIncident} />
      </div>
    );
  }

  if (!incident) return null;

  const location =
    incident.location?.address || incident.location?.zone || "Location not provided";

  const upvoteCount = Array.isArray(incident.upvotes)
    ? incident.upvotes.length
    : (incident.confirmationsCount ?? 0);

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <Link
        to="/incidents"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-primary"
      >
        <ArrowLeft size={15} />
        Back to incidents
      </Link>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-semibold text-ink sm:text-2xl">
              {incident.title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} />
                {location}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Tag size={14} />
                {formatCategory(incident.category)}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} />
                Reported {formatDateTime(incident.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <StatusBadge status={incident.status} />
            <PriorityBadge priority={incident.priority} />
          </div>
        </div>

        <div className="mt-6">
          <StatusTimeline status={incident.status} />
        </div>

        <p className="mt-6 whitespace-pre-line text-sm leading-7 text-ink">
          {incident.description}
        </p>

        <div className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-ink">
            <User size={15} className="text-muted" />
            Reported by {incident.reportedBy?.name ?? "a community member"}
          </div>

          {incident.assignedTo?.name && (
            <div className="flex items-center gap-2 text-sm text-ink">
              <ShieldCheck size={15} className="text-muted" />
              Assigned to {incident.assignedTo.name}
            </div>
          )}

          {incident.updatedAt && (
            <div className="text-xs text-muted sm:col-span-2">
              Last updated {formatDateTime(incident.updatedAt)}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-border bg-critical-soft p-3 text-sm text-critical">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
          <button
            onClick={handleUpvote}
            disabled={upvoting}
            className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              hasUpvoted
                ? "border-primary bg-accent-soft text-primary"
                : "border-border text-ink hover:border-primary/40"
            }`}
          >
            <ArrowBigUp size={16} />
            {hasUpvoted ? "Confirmed" : "Confirm this"} · {upvoteCount}
          </button>

          {canDelete && (
            <button
              onClick={() => setDeleteOpen(true)}
              className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-critical transition hover:border-critical"
            >
              <Trash2 size={15} />
              Delete
            </button>
          )}
        </div>
      </div>

      {canManageStatus && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h2 className="text-base font-semibold text-ink">Update status</h2>
          <p className="mt-1 text-sm text-muted">
            Visible only to patrol officers and admins.
          </p>

          {statusError && (
            <div className="mt-3 rounded-lg border border-border bg-critical-soft p-3 text-sm text-critical">
              {statusError}
            </div>
          )}

          <form onSubmit={handleStatusSubmit} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  Status
                </label>
                <select
                  value={statusForm.status}
                  onChange={(event) =>
                    setStatusForm((current) => ({ ...current, status: event.target.value }))
                  }
                  className="h-10 w-full rounded-lg border border-border bg-surface px-2.5 text-sm outline-none focus:border-primary"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  Assign officer
                  <span className="ml-1 font-normal text-muted">(optional)</span>
                </label>
                <select
                  value={statusForm.assignedOfficerId}
                  onChange={(event) =>
                    setStatusForm((current) => ({
                      ...current,
                      assignedOfficerId: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-lg border border-border bg-surface px-2.5 text-sm outline-none focus:border-primary"
                >
                  <option value="">Unassigned</option>
                  {officers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={statusForm.notes}
                onChange={(event) =>
                  setStatusForm((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Notes (optional)"
                className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
              />

              <button
                type="submit"
                disabled={updatingStatus}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingStatus ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h2 className="text-base font-semibold text-ink">
          Comments {incident.comments?.length ? `(${incident.comments.length})` : ""}
        </h2>

        <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Add an update or observation..."
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
          />

          <button
            type="submit"
            disabled={postingComment || !commentText.trim()}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={14} />
            Post
          </button>
        </form>

        {commentError && (
          <p className="mt-2 text-sm text-critical">{commentError}</p>
        )}

        <div className="mt-5">
          <CommentList comments={incident.comments} />
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this incident?"
      >
        <p className="text-sm text-muted">
          This removes the report for everyone in your community. This
          cannot be undone.
        </p>

        {deleteError && (
          <p className="mt-3 text-sm text-critical">{deleteError}</p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={() => setDeleteOpen(false)}
            className="h-10 rounded-lg border border-border px-4 text-sm font-semibold text-ink transition hover:bg-bg"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="h-10 rounded-lg bg-critical px-4 text-sm font-semibold text-white transition hover:bg-critical/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete incident"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default IncidentDetail;

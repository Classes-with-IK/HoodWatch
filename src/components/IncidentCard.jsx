import { Link } from "react-router-dom";
import { MapPin, MessageSquare, ArrowBigUp, Tag } from "lucide-react";

import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import { formatCategory, formatRelativeTime } from "../lib/format";

function IncidentCard({ incident }) {
  const location =
    incident.location?.address || incident.location?.zone || "Location not provided";

  const upvoteCount = Array.isArray(incident.upvotes)
    ? incident.upvotes.length
    : (incident.confirmationsCount ?? 0);

  const commentCount = Array.isArray(incident.comments)
    ? incident.comments.length
    : 0;

  return (
    <Link
      to={`/incidents/${incident.id}`}
      className="block rounded-xl border border-border bg-surface p-5 shadow-card transition hover:border-primary/40 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-ink">
            {incident.title}
          </h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} />
              {location}
            </span>

            <span className="inline-flex items-center gap-1">
              <Tag size={12} />
              {formatCategory(incident.category)}
            </span>

            {incident.createdAt && (
              <span>{formatRelativeTime(incident.createdAt)}</span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge status={incident.status} />
          <PriorityBadge priority={incident.priority} />
        </div>
      </div>

      {incident.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
          {incident.description}
        </p>
      )}

      <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <ArrowBigUp size={14} />
          {upvoteCount} {upvoteCount === 1 ? "confirmation" : "confirmations"}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <MessageSquare size={14} />
          {commentCount} {commentCount === 1 ? "comment" : "comments"}
        </span>

        {incident.assignedTo?.name && (
          <span className="ml-auto truncate text-primary">
            Assigned to {incident.assignedTo.name}
          </span>
        )}
      </div>
    </Link>
  );
}

export default IncidentCard;

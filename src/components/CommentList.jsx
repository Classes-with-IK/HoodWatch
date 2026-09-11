import { MessageSquare } from "lucide-react";

import EmptyState from "./EmptyState";
import { formatRelativeTime, initialsFromName } from "../lib/format";

const ROLE_LABELS = {
  resident: "Resident",
  patrol_officer: "Patrol officer",
  admin: "Admin",
};

function CommentList({ comments }) {
  if (!comments || comments.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No comments yet"
        description="Updates and neighbor confirmations will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment, index) => (
        <div key={comment.id ?? index} className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-primary">
            {initialsFromName(comment.userName)}
          </div>

          <div className="min-w-0 flex-1 rounded-xl border border-border bg-bg/60 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="text-sm font-semibold text-ink">
                {comment.userName || "Community member"}
                {comment.userRole && (
                  <span className="ml-2 text-xs font-normal text-muted">
                    {ROLE_LABELS[comment.userRole] ?? comment.userRole}
                  </span>
                )}
              </p>

              {comment.createdAt && (
                <span className="text-xs text-muted">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              )}
            </div>

            <p className="mt-1.5 text-sm leading-6 text-ink">
              {comment.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CommentList;

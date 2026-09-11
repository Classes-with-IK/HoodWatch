import { Check, X } from "lucide-react";

const LIFECYCLE = ["reported", "under_review", "in_progress", "resolved"];

const LABELS = {
  reported: "Reported",
  under_review: "Under review",
  in_progress: "In progress",
  resolved: "Resolved",
};

function StatusTimeline({ status }) {
  if (status === "dismissed") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-bg/60 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-border text-muted">
          <X size={15} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Dismissed</p>
          <p className="text-xs text-muted">
            This report was reviewed and closed without further action.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = LIFECYCLE.indexOf(status);

  return (
    <div className="flex items-center">
      {LIFECYCLE.map((step, index) => {
        const isComplete = index <= currentIndex;
        const isLast = index === LIFECYCLE.length - 1;

        return (
          <div key={step} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                  isComplete
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface text-muted"
                }`}
              >
                {isComplete ? <Check size={13} strokeWidth={3} /> : index + 1}
              </div>

              <span
                className={`whitespace-nowrap text-[11px] font-medium ${
                  isComplete ? "text-ink" : "text-muted"
                }`}
              >
                {LABELS[step]}
              </span>
            </div>

            {!isLast && (
              <div
                className={`mx-2 mb-4 h-0.5 flex-1 rounded ${
                  index < currentIndex ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StatusTimeline;

import { AlertTriangle, RotateCw } from "lucide-react";

function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-surface px-6 py-10 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-critical-soft text-critical">
        <AlertTriangle size={20} strokeWidth={1.8} />
      </div>

      <p className="text-sm font-semibold text-ink">{title}</p>

      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted">
          {description}
        </p>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary"
        >
          <RotateCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorState;

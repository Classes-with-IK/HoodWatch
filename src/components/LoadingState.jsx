function LoadingState({ rows = 3, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-border bg-surface p-5"
        >
          <div className="h-3.5 w-2/5 rounded bg-bg" />
          <div className="mt-3 h-3 w-4/5 rounded bg-bg" />
          <div className="mt-2 h-3 w-1/3 rounded bg-bg" />
        </div>
      ))}
    </div>
  );
}

export default LoadingState;

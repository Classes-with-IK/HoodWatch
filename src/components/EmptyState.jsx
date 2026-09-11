function EmptyState({ icon: Icon, title, description, action = null }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
      {Icon && (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-primary">
          <Icon size={20} strokeWidth={1.8} />
        </div>
      )}

      <p className="text-sm font-semibold text-ink">{title}</p>

      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;

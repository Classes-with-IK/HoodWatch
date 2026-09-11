import { CircleDot, Eye, Loader2, CheckCircle2, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  reported: {
    label: "Reported",
    icon: CircleDot,
    text: "text-info",
    bg: "bg-info-soft",
  },
  under_review: {
    label: "Under review",
    icon: Eye,
    text: "text-warning",
    bg: "bg-warning-soft",
  },
  in_progress: {
    label: "In progress",
    icon: Loader2,
    text: "text-primary",
    bg: "bg-accent-soft",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    text: "text-primary",
    bg: "bg-accent-soft",
  },
  dismissed: {
    label: "Dismissed",
    icon: XCircle,
    text: "text-muted",
    bg: "bg-bg",
  },
};

function StatusBadge({ status, className = "" }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status || "Unknown",
    icon: CircleDot,
    text: "text-muted",
    bg: "bg-bg",
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${config.bg} ${config.text} px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      <Icon size={12} strokeWidth={2.5} />
      {config.label}
    </span>
  );
}

export default StatusBadge;

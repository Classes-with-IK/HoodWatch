import { ArrowDown, ArrowRight, ArrowUp, AlertOctagon } from "lucide-react";

const PRIORITY_CONFIG = {
  low: {
    label: "Low priority",
    icon: ArrowDown,
    text: "text-muted",
    bg: "bg-bg",
  },
  medium: {
    label: "Medium priority",
    icon: ArrowRight,
    text: "text-info",
    bg: "bg-info-soft",
  },
  high: {
    label: "High priority",
    icon: ArrowUp,
    text: "text-warning",
    bg: "bg-warning-soft",
  },
  critical: {
    label: "Critical priority",
    icon: AlertOctagon,
    text: "text-critical",
    bg: "bg-critical-soft",
  },
};

function PriorityBadge({ priority, className = "" }) {
  const config = PRIORITY_CONFIG[priority] ?? {
    label: priority || "Unknown",
    icon: ArrowRight,
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

export default PriorityBadge;

import { Info, TriangleAlert, OctagonAlert, Siren } from "lucide-react";

const SEVERITY_CONFIG = {
  info: {
    label: "Info",
    icon: Info,
    text: "text-info",
    bg: "bg-info-soft",
  },
  warning: {
    label: "Warning",
    icon: TriangleAlert,
    text: "text-warning",
    bg: "bg-warning-soft",
  },
  critical: {
    label: "Critical",
    icon: OctagonAlert,
    text: "text-critical",
    bg: "bg-critical-soft",
  },
  emergency: {
    label: "Emergency",
    icon: Siren,
    text: "text-emergency",
    bg: "bg-emergency-soft",
  },
};

function SeverityBadge({ severity, className = "" }) {
  const config = SEVERITY_CONFIG[severity] ?? {
    label: severity || "Unknown",
    icon: Info,
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

export default SeverityBadge;

import { MapPin, Clock, Radio } from "lucide-react";

import SeverityBadge from "./SeverityBadge";
import { formatDateTime, formatRelativeTime } from "../lib/format";

const SEVERITY_BORDER = {
  info: "border-border",
  warning: "border-warning/40",
  critical: "border-critical/40",
  emergency: "border-emergency",
};

function AlertCard({ alert }) {
  const isExpired = alert.expiresAt && new Date(alert.expiresAt) < new Date();
  const isEmergency = alert.severity === "emergency";

  return (
    <div
      className={`rounded-xl border bg-surface p-5 ${
        SEVERITY_BORDER[alert.severity] ?? "border-border"
      } ${isEmergency ? "ring-1 ring-emergency/20" : ""} ${
        isExpired ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-ink">{alert.title}</h3>
            {isExpired && (
              <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-medium text-muted">
                Expired
              </span>
            )}
          </div>

          <p className="mt-1.5 text-sm leading-6 text-muted">
            {alert.message}
          </p>
        </div>

        <SeverityBadge severity={alert.severity} className="shrink-0" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-xs text-muted">
        {alert.targetZone && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={12} />
            {alert.targetZone}
          </span>
        )}

        {alert.createdAt && (
          <span className="inline-flex items-center gap-1.5">
            <Clock size={12} />
            {formatRelativeTime(alert.createdAt)}
          </span>
        )}

        {alert.broadcastBy?.name && (
          <span className="inline-flex items-center gap-1.5">
            <Radio size={12} />
            {alert.broadcastBy.name}
          </span>
        )}

        {alert.expiresAt && (
          <span className="ml-auto">
            {isExpired ? "Expired" : "Expires"} {formatDateTime(alert.expiresAt)}
          </span>
        )}
      </div>
    </div>
  );
}

export default AlertCard;

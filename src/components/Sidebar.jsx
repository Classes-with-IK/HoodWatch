import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  FilePlus,
  Footprints,
  Home,
  LogOut,
  Radar,
  Settings as SettingsIcon,
  ShieldAlert,
  User,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { initialsFromName } from "../lib/format";

const baseNavigation = [
  { label: "Incidents", icon: ShieldAlert, path: "/incidents" },
  { label: "Report", icon: FilePlus, path: "/report" },
  { label: "Alerts", icon: Bell, path: "/alerts" },
  { label: "Patrols", icon: Footprints, path: "/patrols" },
];

function Sidebar({ collapsible = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const navigation = [
    {
      label: "Home",
      icon: isAdmin ? Radar : Home,
      path: isAdmin ? "/admin" : "/dashboard",
      end: true,
    },
    ...baseNavigation,
  ];

  const labelClass = collapsible
    ? "min-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100"
    : "min-w-0 whitespace-nowrap";

  return (
    <aside
      className={
        collapsible
          ? "group/sidebar fixed inset-y-0 left-0 z-40 flex h-screen w-[76px] flex-col overflow-hidden border-r border-border bg-surface transition-[width] duration-200 ease-out hover:w-64 hover:shadow-2xl"
          : "flex h-full w-64 flex-col border-r border-border bg-surface"
      }
    >
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-border px-[19px]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-base font-semibold text-white">
          H
        </div>

        <div className={labelClass}>
          <h1 className="font-display text-xl font-semibold tracking-tight text-primary">
            HoodWatch
          </h1>
          <p className="text-[10px] text-muted">
            Safer communities. Stronger together.
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-hidden px-3 py-6">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-accent-soft text-primary"
                      : "text-muted hover:bg-bg hover:text-primary"
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.8} className="shrink-0" />
                <span className={labelClass}>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="my-6 border-t border-border" />

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-accent-soft text-primary"
                : "text-muted hover:bg-bg hover:text-primary"
            }`
          }
        >
          <User size={18} strokeWidth={1.8} className="shrink-0" />
          <span className={labelClass}>Profile</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `mt-1 flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-accent-soft text-primary"
                : "text-muted hover:bg-bg hover:text-primary"
            }`
          }
        >
          <SettingsIcon size={18} strokeWidth={1.8} className="shrink-0" />
          <span className={labelClass}>Settings</span>
        </NavLink>
      </nav>

      <div className="shrink-0 overflow-hidden border-t border-border p-3">
        <button
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          className="group w-full rounded-xl border border-transparent p-2 text-left transition hover:border-border hover:bg-bg"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-xs font-semibold text-primary transition group-hover:bg-surface">
              {user ? initialsFromName(user.name) : <LogOut size={18} strokeWidth={1.8} />}
            </div>

            <div className={labelClass}>
              <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-ink">
                {user ? user.name : "Sign out"}
                {isAdmin && (
                  <span className="shrink-0 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Admin
                  </span>
                )}
              </p>

              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                <LogOut size={11} className="shrink-0" />
                Sign out
              </p>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

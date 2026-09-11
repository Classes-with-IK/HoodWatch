import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  FilePlus,
  Footprints,
  Home,
  LogOut,
  Settings as SettingsIcon,
  ShieldAlert,
  User,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { initialsFromName } from "../lib/format";

const navigation = [
  { label: "Home", icon: Home, path: "/dashboard", end: true },
  { label: "Incidents", icon: ShieldAlert, path: "/incidents" },
  { label: "Report", icon: FilePlus, path: "/report" },
  { label: "Alerts", icon: Bell, path: "/alerts" },
  { label: "Patrols", icon: Footprints, path: "/patrols" },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="flex w-64 min-h-screen flex-col border-r border-border bg-surface">
      <div className="flex h-20 items-center border-b border-border px-6">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-primary">
            HoodWatch
          </h1>
          <p className="text-[10px] text-muted">
            Safer communities. Stronger together.
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-accent-soft text-primary"
                      : "text-muted hover:bg-bg hover:text-primary"
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="my-6 border-t border-border" />

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-accent-soft text-primary"
                : "text-muted hover:bg-bg hover:text-primary"
            }`
          }
        >
          <User size={18} strokeWidth={1.8} />
          <span>Profile</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-accent-soft text-primary"
                : "text-muted hover:bg-bg hover:text-primary"
            }`
          }
        >
          <SettingsIcon size={18} strokeWidth={1.8} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="border-t border-border p-4">
        <button
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          className="group w-full rounded-xl border border-transparent p-2.5 text-left transition hover:border-border hover:bg-bg"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-xs font-semibold text-primary transition group-hover:bg-surface">
              {user ? initialsFromName(user.name) : <LogOut size={18} strokeWidth={1.8} />}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                {user ? user.name : "Sign out"}
              </p>

              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                <LogOut size={11} />
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

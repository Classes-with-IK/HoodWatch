import { useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck, Mail } from "lucide-react";

import { useAuth } from "../auth/AuthContext";

function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <div>
        <p className="font-display text-sm font-medium text-primary">
          Account
        </p>

        <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Settings
        </h1>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold text-ink">Account details</h2>

        <div className="mt-3 space-y-2.5 text-sm">
          <div className="flex items-center gap-2 text-ink">
            <Mail size={15} className="text-muted" />
            {user.email}
          </div>

          <div className="flex items-center gap-2 text-ink">
            <ShieldCheck size={15} className="text-muted" />
            Signed in as{" "}
            {user.role === "patrol_officer"
              ? "patrol officer"
              : user.role}
          </div>
        </div>

        <p className="mt-4 text-xs text-muted">
          To update your name, zone, or phone number, head to your profile.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold text-ink">Session</h2>

        <p className="mt-1 text-sm text-muted">
          Sign out of HoodWatch on this device.
        </p>

        <button
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-critical transition hover:border-critical"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default Settings;

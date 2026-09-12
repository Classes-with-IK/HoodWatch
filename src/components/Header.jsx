import { useState } from "react";
import { Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { initialsFromName } from "../lib/format";
import ThemeToggle from "./ThemeToggle";

function Header({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSearchSubmit(event) {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/incidents?search=${encodeURIComponent(trimmed)}` : "/incidents");
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-accent-soft hover:text-primary"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <h1 className="font-display text-lg font-semibold text-primary">HoodWatch</h1>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="relative hidden w-full max-w-md lg:block"
      >
        <Search
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />

        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search incidents, locations, or keywords..."
          className="h-10 w-full rounded-lg border border-border bg-bg pl-10 pr-4 text-sm outline-none transition focus:border-primary"
        />
      </form>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {user && (
          <>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-ink">
                {user.name}
              </p>
              {user.role === "admin" ? (
                <span className="mt-0.5 inline-flex items-center rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Admin
                </span>
              ) : (
                <p className="text-xs capitalize leading-tight text-muted">
                  {user.role?.replace(/_/g, " ")}
                </p>
              )}
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {initialsFromName(user.name)}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;

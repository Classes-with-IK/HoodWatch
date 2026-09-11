import { Link } from "react-router-dom";
import { CompassIcon, ArrowLeft } from "lucide-react";

function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-primary">
        <CompassIcon size={26} strokeWidth={1.8} />
      </div>

      <h1 className="mt-5 font-display text-2xl font-semibold text-ink">
        This page isn&apos;t on the map
      </h1>

      <p className="mt-2 max-w-sm text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>

      <Link
        to="/"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
      >
        <ArrowLeft size={15} />
        Back to home
      </Link>
    </div>
  );
}

export default NotFound;

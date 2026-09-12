import { X } from "lucide-react";
import Sidebar from "./Sidebar";

function MobileSidebar({ isOpen, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
        aria-label="Close navigation"
      />

      <div className="relative h-full w-72 bg-surface shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-bg"
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>

        <Sidebar />
      </div>
    </div>
  );
}

export default MobileSidebar;
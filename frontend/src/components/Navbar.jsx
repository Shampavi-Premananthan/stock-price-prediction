import { NavLink } from "react-router-dom";
import { LineChart } from "lucide-react";

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
    isActive ? "text-accent bg-accent-soft" : "text-muted hover:text-white"
  }`;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <LineChart size={18} strokeWidth={2.25} />
          </span>
          Quantis
        </NavLink>
        <nav className="flex items-center gap-1">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/predict" className={linkClass}>
            Predict
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

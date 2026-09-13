import { Users, LogOut } from "lucide-react";

/**
 * Reusable recruiter sidebar.
 *
 * Props:
 *   items       — [{ label, icon, path, active, badge? }]
 *   onNavigate  — (path) => void
 *   onLogout    — () => void
 *   variant     — "desktop" | "mobile"
 */

const RecruiterSidebar = ({
  items = [],
  onNavigate,
  onLogout,
  variant = "desktop",
}) => {
  const isMobile = variant === "mobile";

  const handleClick = (path) => {
    if (typeof onNavigate === "function") {
      onNavigate(path);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* BRAND */}
      <div className="flex h-[90px] items-center gap-3 px-7">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
          <Users size={22} />
        </div>

        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-white">
            TalentHub
          </h1>
          <p className="text-[10px] text-slate-300">Recruiter</p>
        </div>
      </div>

      {/* NAV */}
      <nav className="mt-4 flex-1 space-y-1.5 overflow-y-auto px-3 pb-24">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleClick(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {Icon ? <Icon size={19} /> : null}

              <span className="flex-1">{item.label}</span>

              {item.badge !== null &&
                item.badge !== undefined &&
                item.badge !== 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
            </button>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div
        className={`border-t border-white/10 p-4 ${
          isMobile ? "" : ""
        }`}
      >
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default RecruiterSidebar;
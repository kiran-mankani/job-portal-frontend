import { Briefcase, LogOut } from "lucide-react";

/**
 * Reusable sidebar for candidate pages.
 *
 * Usage (desktop):
 *   <CandidateSidebar
 *     items={sidebarItems}
 *     activePath="/candidate/dashboard"
 *     onNavigate={(path) => navigate(path)}
 *     onLogout={handleLogout}
 *   />
 *
 * Usage (mobile drawer):
 *   <CandidateSidebar
 *     variant="mobile"
 *     items={sidebarItems}
 *     activePath={activePath}
 *     onNavigate={closeAndNavigate}
 *     onLogout={handleLogout}
 *   />
 */

const CandidateSidebar = ({
  items = [],
  activePath = "",
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
      {/* =====================================================
          BRAND
      ===================================================== */}

      <div className="flex h-[84px] items-center gap-3 px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
          <Briefcase size={23} />
        </div>

        <div>
          <h1 className="text-[19px] font-bold tracking-tight text-white">
            JobPortal
          </h1>

          <p className="text-[10px] text-slate-300">
            Connecting Talent with the Right Opportunity
          </p>
        </div>
      </div>

      {/* =====================================================
          NAV ITEMS
      ===================================================== */}

      <nav className="mt-3 flex-1 space-y-1.5 overflow-y-auto px-4 pb-24">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleClick(item.path)}
              className={`flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-sm transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={20} />

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

      {/* =====================================================
          LOGOUT
      ===================================================== */}

      <div
        className={`${
          isMobile
            ? "border-t border-white/10 p-4"
            : "border-t border-white/10 p-4"
        }`}
      >
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default CandidateSidebar;
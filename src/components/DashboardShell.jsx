import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  BriefcaseBusiness,
  Search,
  FileText,
  CalendarDays,
  Upload,
  MessageCircle,
  UserRound,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

import { logout } from "../store/authSlice";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/candidate/dashboard",
    icon: BriefcaseBusiness,
  },
  {
    label: "Browse Jobs",
    path: "/jobs",
    icon: Search,
  },
  {
    label: "My Applications",
    path: "/candidate/applications",
    icon: FileText,
  },
  {
    label: "My Interviews",
    path: "/candidate/interviews",
    icon: CalendarDays,
  },
  {
    label: "My CV / Resume",
    path: "/candidate/resume",
    icon: Upload,
  },
  {
    label: "Messages",
    path: "/candidate/messages",
    icon: MessageCircle,
  },
  {
    label: "Profile",
    path: "/candidate/profile",
    icon: UserRound,
  },
  {
    label: "Settings",
    path: "/candidate/settings",
    icon: Settings,
  },
];

function DashboardShell({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [mobileOpen, setMobileOpen] = useState(false);

  const user = useSelector((state) => state.auth?.user);

  const userName = user?.name || user?.fullName || "Candidate";

  const getInitial = () => {
    if (!userName) return "C";

    return userName
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  const handleLogout = () => {
    dispatch(logout());
    setMobileOpen(false);
    navigate("/login", { replace: true });
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-slate-900">
      {/* =========================================================
          MOBILE OVERLAY
      ========================================================= */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-[285px] flex-col
          bg-[#0d1f3c]
          text-white
          shadow-2xl
          transition-transform duration-300
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-[120px] items-center border-b border-white/10 px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
              <BriefcaseBusiness size={25} strokeWidth={2.2} />
            </div>

            <div>
              <div className="text-[23px] font-extrabold tracking-tight">
                Job<span className="text-blue-400">Portal</span>
              </div>

              <p className="text-[11px] font-medium text-slate-300">
                Find Your Next Opportunity
              </p>
            </div>
          </div>

          {/* Mobile close */}
          <button
            type="button"
            onClick={closeMobileMenu}
            className="ml-auto rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-7">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `
                    group flex min-h-[52px] items-center gap-4
                    rounded-xl px-4
                    text-[15px] font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    }
                    `
                  }
                >
                  <Icon
                    size={21}
                    strokeWidth={2}
                    className="shrink-0"
                  />

                  <span>{item.label}</span>

                  {item.label === "My Applications" && (
                    <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
                      0
                    </span>
                  )}

                  {item.label === "Messages" && (
                    <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
                      0
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="
              flex w-full items-center gap-4 rounded-xl
              px-4 py-3.5
              text-[15px] font-medium text-slate-200
              transition
              hover:bg-white/10 hover:text-white
            "
          >
            <LogOut size={21} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* =========================================================
          MAIN AREA
      ========================================================= */}
      <div className="min-h-screen lg:pl-[285px]">
        {/* =======================================================
            TOP HEADER
        ======================================================= */}
        <header
          className="
            sticky top-0 z-30
            flex h-[88px] items-center
            border-b border-slate-200
            bg-white/95
            px-4 shadow-sm
            backdrop-blur-xl
            sm:px-6
            lg:px-8
          "
        >
          <div className="flex w-full items-center gap-4">
            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="
                flex h-11 w-11 items-center justify-center
                rounded-xl border border-slate-200
                text-slate-700
                hover:bg-slate-50
                lg:hidden
              "
            >
              <Menu size={22} />
            </button>

            {/* Search */}
            <div className="relative max-w-[725px] flex-1">
              <Search
                size={21}
                className="
                  pointer-events-none
                  absolute left-4 top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                placeholder="Search for jobs, companies, or skills..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = e.target.value.trim();

                    if (value) {
                      navigate(`/jobs?search=${encodeURIComponent(value)}`);
                    }
                  }
                }}
                className="
                  h-[52px] w-full
                  rounded-xl
                  border border-slate-200
                  bg-white
                  pl-12 pr-4
                  text-[15px]
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                "
              />
            </div>

            <div className="ml-auto flex items-center gap-3 sm:gap-5">
              {/* Notification */}
              <button
                type="button"
                onClick={() => navigate("/candidate/notifications")}
                className="
                  relative
                  flex h-11 w-11
                  items-center justify-center
                  rounded-full
                  text-slate-500
                  transition
                  hover:bg-slate-100
                  hover:text-blue-600
                "
                aria-label="Notifications"
              >
                <Bell size={22} />

                <span
                  className="
                    absolute right-0.5 top-0.5
                    flex h-5 min-w-5
                    items-center justify-center
                    rounded-full
                    bg-rose-500
                    px-1
                    text-[10px]
                    font-bold
                    text-white
                  "
                >
                  0
                </span>
              </button>

              {/* User */}
              <button
                type="button"
                onClick={() => navigate("/candidate/profile")}
                className="
                  hidden items-center gap-3
                  rounded-xl px-2 py-1.5
                  transition
                  hover:bg-slate-50
                  sm:flex
                "
              >
                <div
                  className="
                    flex h-11 w-11
                    items-center justify-center
                    rounded-full
                    bg-blue-50
                    text-blue-600
                    ring-1 ring-blue-100
                  "
                >
                  {user?.avatar || user?.profileImage ? (
                    <img
                      src={user.avatar || user.profileImage}
                      alt={userName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold">
                      {getInitial()}
                    </span>
                  )}
                </div>

                <div className="hidden text-left md:block">
                  <p className="max-w-[150px] truncate text-[14px] font-semibold text-slate-900">
                    {userName}
                  </p>

                  <p className="text-[12px] text-slate-500">
                    Candidate
                  </p>
                </div>

                <ChevronDown
                  size={17}
                  className="ml-1 text-slate-500"
                />
              </button>
            </div>
          </div>
        </header>

        {/* =======================================================
            PAGE CONTENT
        ======================================================= */}
        <main className="min-h-[calc(100vh-88px)] px-4 py-5 sm:px-6 lg:px-7 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardShell;
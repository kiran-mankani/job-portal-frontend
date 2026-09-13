import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  Briefcase,
  CalendarDays,
  ChevronDown,
  FileText,
  LogOut,
  Menu,
  Search,
  Settings,
  Upload,
  User,
  X,
} from "lucide-react";

import CandidateSidebar from "./CandidateSidebar";
import { apiRequest } from "../../services/api";

const CandidateLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationUnreadCount, setNotificationUnreadCount] =
    useState(0);

  // NEW: profile dropdown state
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // =========================================================
  // AUTH
  // =========================================================

  const auth = useSelector((state) => state.auth || {});
  const user = auth.user || {};
  const token =
    auth.token || localStorage.getItem("token") || null;

  const userName =
    user.name || user.fullName || user.username || "Candidate";

  // =========================================================
  // CLOSE DRAWER ON ROUTE CHANGE
  // =========================================================

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false); // also close dropdown on navigation
  }, [location.pathname]);

  // =========================================================
  // CLOSE PROFILE DROPDOWN ON OUTSIDE CLICK / ESC
  // =========================================================

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileMenuOpen]);

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const load = async () => {
      try {
        const res = await apiRequest(
          "/notifications?limit=10",
          "GET",
          null,
          token
        );

        if (cancelled) return;

        if (res && Array.isArray(res.notifications)) {
          setNotifications(res.notifications);
          setNotificationUnreadCount(
            Number(res.unreadCount || 0)
          );
        }
      } catch (err) {
        console.error("Load Notifications Error:", err);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // =========================================================
  // NAVIGATION
  // =========================================================

  const goTo = useCallback(
    (path) => {
      if (!path) return;
      navigate(path);
      setMobileMenuOpen(false);
      setProfileMenuOpen(false);
    },
    [navigate]
  );

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getInitials = (name) => {
    if (!name) return "C";

    return (
      String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((item) => item.charAt(0).toUpperCase())
        .join("") || "C"
    );
  };

  // IMPORTANT: profile image may live at user.profileImage OR
  // user.profile.profileImage — check both.
  const profileImage =
    user.profileImage ||
    user.profile?.profileImage ||
    user.avatar ||
    user.photo ||
    user.profilePhoto ||
    user.image ||
    null;

  // =========================================================
  // SIDEBAR ITEMS
  // =========================================================

  const sidebarItems = [
    {
      label: "Dashboard",
      icon: Briefcase,
      path: "/candidate/dashboard",
      active: location.pathname === "/candidate/dashboard",
    },
    {
      label: "Browse Jobs",
      icon: Search,
      path: "/jobs",
      active: location.pathname.startsWith("/jobs"),
    },
    {
      label: "My Applications",
      icon: FileText,
      path: "/candidate/applications",
      active: location.pathname.startsWith("/candidate/applications"),
    },
    {
      label: "My Interviews",
      icon: CalendarDays,
      path: "/candidate/interviews",
      active: location.pathname.startsWith("/candidate/interviews"),
    },
    {
      label: "My CV / Resume",
      icon: Upload,
      path: "/candidate/cv",
      active: location.pathname.startsWith("/candidate/cv"),
    },
    {
      label: "Profile",
      icon: User,
      path: "/candidate/profile",
      active: location.pathname.startsWith("/candidate/profile"),
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/candidate/settings",
      active: location.pathname.startsWith("/candidate/settings"),
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f8fc] text-[#152b4d]">
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[255px] bg-[#0c1d36] text-white lg:block">
        <CandidateSidebar
          items={sidebarItems}
          activePath={location.pathname}
          onNavigate={goTo}
          onLogout={handleLogout}
          variant="desktop"
        />
      </aside>

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex min-h-[44px] items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((cur) => !cur)
              }
              className="shrink-0 rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-[#10284b]">
                JobPortal
              </h1>

              <p className="truncate text-[9px] text-slate-500">
                Find Your Next Opportunity
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() =>
                goTo("/candidate/notifications")
              }
              className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell size={21} />

              {notificationUnreadCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {notificationUnreadCount}
                </span>
              )}
            </button>

            {/* MOBILE PROFILE AVATAR — opens drawer on small screens,
                not a dropdown (to keep mobile UX simple) */}
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(true)
              }
              className="shrink-0"
              aria-label="Open menu"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={userName}
                  className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {getInitials(userName)}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mt-3 w-full">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search jobs, companies, or skills..."
              onKeyDown={(event) => {
                if (event.key === "Enter") goTo("/jobs");
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </header>

      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 h-full w-full cursor-default bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="relative h-full w-[275px] max-w-[85vw] overflow-hidden bg-[#0c1d36] text-white shadow-2xl">
            <CandidateSidebar
              items={sidebarItems}
              activePath={location.pathname}
              onNavigate={goTo}
              onLogout={handleLogout}
              variant="mobile"
            />
          </aside>
        </div>
      )}

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="min-h-screen lg:ml-[255px]">
        {/* =====================================================
            DESKTOP TOP BAR
        ===================================================== */}

        <header className="hidden h-[72px] items-center justify-end border-b border-slate-200 bg-white px-6 lg:flex xl:px-8">
          <div className="flex items-center gap-6">
            {/* NOTIFICATIONS */}
            <button
              type="button"
              onClick={() =>
                goTo("/candidate/notifications")
              }
              className="relative text-slate-500 hover:text-blue-600"
              aria-label="Notifications"
            >
              <Bell size={22} />

              {notificationUnreadCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {notificationUnreadCount}
                </span>
              )}
            </button>

            <div className="h-9 w-px bg-slate-200" />

            {/* =====================================================
                PROFILE DROPDOWN
            ===================================================== */}

            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() =>
                  setProfileMenuOpen((cur) => !cur)
                }
                className="flex items-center gap-3 rounded-lg px-1 py-1 transition hover:bg-slate-50"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={userName}
                    className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                    {getInitials(userName)}
                  </div>
                )}

                <div className="text-left">
                  <p className="text-sm font-semibold text-[#10284b]">
                    {userName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Candidate
                  </p>
                </div>

                <ChevronDown
                  size={17}
                  className={`ml-2 text-slate-500 transition-transform ${
                    profileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* DROPDOWN MENU */}
              {profileMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-[230px] overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-lg"
                >
                  {/* Header inside dropdown */}
                  <div className="border-b border-slate-100 px-4 pb-3 pt-2">
                    <p className="truncate text-[13px] font-bold text-[#172b4d]">
                      {userName}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                      {user.email || "No email"}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() =>
                      goTo("/candidate/profile")
                    }
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <User size={16} className="text-slate-500" />
                    My Profile
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() =>
                      goTo("/candidate/settings")
                    }
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Settings
                      size={16}
                      className="text-slate-500"
                    />
                    Settings
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[12px] font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="px-3 py-4 sm:px-5 sm:py-5 md:px-6 lg:px-7 xl:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CandidateLayout;
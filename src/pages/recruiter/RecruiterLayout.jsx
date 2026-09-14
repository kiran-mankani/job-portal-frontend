import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  UserRound,
  Users,
  X,
} from "lucide-react";

import RecruiterSidebar from "./RecruiterSidebar";
import { logout } from "../../store/authSlice";

const RecruiterLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // NEW: dropdown state
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // =========================================================
  // AUTH
  // =========================================================

  const auth = useSelector((state) => state.auth || {});
  const user = auth.user || {};

  const recruiterName =
    user.name ||
    user.fullName ||
    user.username ||
    user.email ||
    "Recruiter";

  // =========================================================
  // CLOSE DRAWER + DROPDOWN ON ROUTE CHANGE
  // =========================================================

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
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
    // Clear Redux auth state (this also clears localStorage) so
    // no stale session data remains in memory after logout.
    dispatch(logout());
    localStorage.removeItem("accessToken");
    navigate("/login", { replace: true });
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getInitials = (name = "") => {
    const value = String(name).trim();

    if (!value) return "R";

    return (
      value
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((item) => item.charAt(0).toUpperCase())
        .join("") || "R"
    );
  };

  const profileImage =
    user.profileImage ||
    user.profile?.profileImage ||
    user.avatar ||
    user.photo ||
    null;

  // =========================================================
  // SIDEBAR ITEMS
  // =========================================================

  const sidebarItems = [
    {
      label: "Dashboard",
      icon: BarChart3,
      path: "/recruiter/dashboard",
      active: location.pathname === "/recruiter/dashboard",
    },
    {
      label: "Jobs",
      icon: BriefcaseBusiness,
      path: "/jobs/my-jobs",
      active:
        location.pathname.startsWith("/jobs/my-jobs") ||
        location.pathname.startsWith("/jobs/post") ||
        location.pathname.endsWith("/edit"),
    },
    {
      label: "Candidates",
      icon: Users,
      path: "/recruiter/applications",
      active: location.pathname.startsWith("/recruiter/applications"),
    },
    {
      label: "Interviews",
      icon: CalendarDays,
      path: "/recruiter/interviews",
      active: location.pathname.startsWith("/recruiter/interviews"),
    },
    {
      label: "Reports",
      icon: BarChart3,
      path: "/recruiter/reports",
      active: location.pathname.startsWith("/recruiter/reports"),
    },
    {
      label: "Profile",
      icon: UserRound,
      path: "/recruiter/profile",
      active: location.pathname.startsWith("/recruiter/profile"),
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/recruiter/settings",
      active: location.pathname.startsWith("/recruiter/settings"),
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f8fc] text-[#172b4d]">
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] bg-[#0d203d] text-white lg:block">
        <RecruiterSidebar
          items={sidebarItems}
          onNavigate={goTo}
          onLogout={handleLogout}
          variant="desktop"
        />
      </aside>

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((cur) => !cur)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div>
            <h1 className="text-lg font-bold">TalentHub</h1>
            <p className="text-[9px] text-slate-500">Recruiter</p>
          </div>
        </div>

        {/* Mobile: avatar opens the drawer (already has settings/logout inside) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt={recruiterName}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
              {getInitials(recruiterName)}
            </div>
          )}
        </button>
      </header>

      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          />

          <aside className="relative h-full w-[270px] overflow-hidden bg-[#0d203d] text-white shadow-2xl">
            <RecruiterSidebar
              items={sidebarItems}
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

      <div className="min-h-screen lg:ml-[250px]">
        {/* DESKTOP TOP BAR */}
        <header className="hidden h-[78px] items-center justify-end border-b border-slate-200 bg-white px-6 lg:flex xl:px-8">
          <div className="flex items-center gap-5">
            {/* PROFILE DROPDOWN */}
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
                    alt={recruiterName}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                    {getInitials(recruiterName)}
                  </div>
                )}

                <div className="text-left">
                  <p className="text-[13px] font-semibold text-[#172b4d]">
                    {recruiterName}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Recruiter
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={`text-slate-500 transition-transform ${
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
                  <div className="border-b border-slate-100 px-4 pb-3 pt-2">
                    <p className="truncate text-[13px] font-bold text-[#172b4d]">
                      {recruiterName}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                      {user.email || "No email"}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => goTo("/recruiter/profile")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <UserRound size={16} className="text-slate-500" />
                    My Profile
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => goTo("/recruiter/settings")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Settings size={16} className="text-slate-500" />
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
        <main className="px-4 ">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RecruiterLayout;
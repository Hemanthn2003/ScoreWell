import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  X,
  Home,
  ClipboardPlus,
  ClipboardCheck,
  UserPlus,
  User,
  LogOut,
  BookOpenCheck,
  BarChart3,
  Loader2,
} from "lucide-react";

import scoreWellLogo from "../assets/scoreWellLogo.png";

type UserRole = "STUDENT" | "INSTRUCTOR";

interface LoggedInUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string | null;
  isActive?: boolean;
  isPermitted?: boolean;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  route: string;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/* =========================================================
   INSTRUCTOR MENU
========================================================= */

const instructorMenu: MenuItem[] = [
  {
    label: "Home",
    icon: <Home size={19} />,
    route: "/instructor",
  },
  {
    label: "Create Question Set",
    icon: <ClipboardPlus size={19} />,
    route: "/instructor/create-question-set",
  },
  {
    label: "Students Examination Status",
    icon: <ClipboardCheck size={19} />,
    route: "/instructor/students-examination-status",
  },
  {
    label: "Create Exam",
    icon: <BookOpenCheck size={19} />,
    route: "/instructor/create-exam",
  },
  {
    label: "Newly Requested Student",
    icon: <UserPlus size={19} />,
    route: "/instructor/newly-requested-student",
  },
];

/* =========================================================
   STUDENT MENU
========================================================= */

const studentMenu: MenuItem[] = [
  {
    label: "Home",
    icon: <Home size={19} />,
    route: "/student",
  },
  {
    label: "New Exams",
    icon: <ClipboardCheck size={19} />,
    route: "/student/new-exams",
  },
  {
    label: "My Performance",
    icon: <BarChart3 size={19} />,
    route: "/student/my-performance",
  },
];

const Header = () => {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const [user, setUser] =
    useState<LoggedInUser | null>(null);

  const [isLoadingUser, setIsLoadingUser] =
    useState(true);

  /* =======================================================
     FETCH LOGGED-IN USER
  ======================================================= */

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to fetch user details."
          );
        }

        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error(
          "Failed to fetch logged-in user:",
          error
        );
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchLoggedInUser();
  }, []);

  /* =======================================================
     ROLE BASED MENU
  ======================================================= */

  const menuItems =
    user?.role === "INSTRUCTOR"
      ? instructorMenu
      : studentMenu;

  const roleLabel =
    user?.role === "INSTRUCTOR"
      ? "Instructor"
      : "Student";

  /* =======================================================
     MENU NAVIGATION
  ======================================================= */

  const handleNavigation = (
    route: string
  ) => {
    setIsSidebarOpen(false);
    navigate(route);
  };

  /* =======================================================
     PROFILE
  ======================================================= */

  const handleProfileClick = () => {
    setIsSidebarOpen(false);
    navigate("/profile");
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error(
        "Logout request failed:",
        error
      );
    } finally {
      setIsSidebarOpen(false);

      // Always return to login
      navigate("/", {
        replace: true,
      });
    }
  };

  return (
    <>
      {/* ===================================================
          GLOBAL HEADER
      =================================================== */}

      <header className="sticky top-0 z-50 w-full border-b border-purple-100 bg-white shadow-sm">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* =================================================
              LEFT MENU BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              setIsSidebarOpen(true)
            }
            className="group flex h-10 w-10 items-center justify-center rounded-xl text-purple-800 transition-all duration-200 hover:bg-purple-50 hover:text-purple-700 active:scale-95"
            aria-label="Open navigation menu"
          >
            <span className="flex flex-col gap-[5px]">

              <span className="flex items-center gap-[5px]">
                <span className="h-[4px] w-[4px] rounded-full bg-purple-700" />

                <span className="h-[4px] w-5 rounded-full bg-purple-700 transition-all duration-200 group-hover:w-6" />
              </span>

              <span className="flex items-center gap-[5px]">
                <span className="h-[4px] w-[4px] rounded-full bg-orange-500" />

                <span className="h-[4px] w-5 rounded-full bg-orange-500 transition-all duration-200 group-hover:w-6" />
              </span>

            </span>
          </button>

          {/* =================================================
              RIGHT LOGO
          ================================================= */}

          <div className="flex h-full items-center">
            <img
              src={scoreWellLogo}
              alt="ScoreWell"
              className="h-10 w-auto object-contain sm:h-11"
            />
          </div>

        </div>
      </header>

      {/* ===================================================
          OVERLAY
      =================================================== */}

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
          onClick={() =>
            setIsSidebarOpen(false)
          }
          aria-hidden="true"
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`fixed left-0 top-0 z-[70] flex h-full w-[300px] max-w-[88vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* =================================================
            SIDEBAR HEADER
        ================================================= */}

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-purple-100 bg-white px-5">

          <img
            src={scoreWellLogo}
            alt="ScoreWell"
            className="h-9 w-auto object-contain"
          />

          <button
            type="button"
            onClick={() =>
              setIsSidebarOpen(false)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-all hover:bg-purple-50 hover:text-purple-700 active:scale-95"
            aria-label="Close menu"
          >
            <X size={21} />
          </button>

        </div>

        {/* =================================================
            USER INFORMATION
        ================================================= */}

        <div className="border-b border-purple-100 bg-gradient-to-r from-purple-50 via-white to-orange-50 px-5 py-5">

          {isLoadingUser ? (
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-100">
                <Loader2
                  size={20}
                  className="animate-spin text-purple-700"
                />
              </div>

              <div>
                <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />

                <div className="mt-2 h-2.5 w-20 animate-pulse rounded bg-gray-100" />
              </div>

            </div>
          ) : user ? (
            <div className="flex items-center gap-3">

              {/* Avatar */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-700 text-white shadow-md shadow-purple-200">
                <User size={20} />
              </div>

              {/* Details */}
              <div className="min-w-0">

                <p className="truncate text-sm font-bold text-gray-900">
                  {user.name}
                </p>

                <p className="truncate text-xs text-gray-500">
                  {user.email}
                </p>

                <div className="mt-1.5">

                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700">
                    {roleLabel}
                  </span>

                </div>

              </div>

            </div>
          ) : (
            <div className="text-sm text-gray-500">
              User details unavailable
            </div>
          )}

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
            Navigation
          </p>

          <div className="space-y-1.5">

            {menuItems.map((item) => (
              <button
                key={item.route}
                type="button"
                onClick={() =>
                  handleNavigation(item.route)
                }
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-purple-50 hover:text-purple-700"
              >

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-all duration-200 group-hover:bg-purple-100 group-hover:text-purple-700">
                  {item.icon}
                </span>

                <span className="flex-1">
                  {item.label}
                </span>

                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

              </button>
            ))}

          </div>

          {/* =================================================
              PROFILE
          ================================================= */}

          <div className="mt-6 border-t border-gray-100 pt-5">

            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
              Account
            </p>

            <button
              type="button"
              onClick={handleProfileClick}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-purple-50 hover:text-purple-700"
            >

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-all duration-200 group-hover:bg-purple-100 group-hover:text-purple-700">
                <User size={19} />
              </span>

              <span>
                Profile Details
              </span>

            </button>

          </div>

        </nav>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <div className="shrink-0 border-t border-purple-100 bg-white px-4 py-4">

          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-gray-600 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600"
          >

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-all duration-200 group-hover:bg-orange-100 group-hover:text-orange-600">
              <LogOut size={19} />
            </span>

            <span>
              Logout
            </span>

          </button>

          <p className="mt-3 text-center text-[10px] text-gray-400">
            ScoreWell • Examination Platform
          </p>

        </div>

      </aside>
    </>
  );
};

export default Header;
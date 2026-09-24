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
  ChevronRight,
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

/* =========================================================
   HEADER
========================================================= */

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
     NAVIGATION
  ======================================================= */

  const handleNavigation = (route: string) => {
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

      <header className="sticky top-0 z-50 w-full">

        <div
          className="
            relative
            overflow-hidden
            border-b
            border-purple-200
            bg-gradient-to-r
            from-purple-100
            via-white
            to-orange-100
            shadow-[0_8px_25px_rgba(91,33,182,0.16),0_3px_8px_rgba(249,115,22,0.08)]
          "
        >

          {/* Purple glow */}
          <div
            className="
              pointer-events-none
              absolute
              -left-16
              -top-24
              h-48
              w-48
              rounded-full
              bg-purple-400/20
              blur-3xl
            "
          />

          {/* Orange glow */}
          <div
            className="
              pointer-events-none
              absolute
              -right-16
              -top-24
              h-48
              w-48
              rounded-full
              bg-orange-400/20
              blur-3xl
            "
          />

          {/* Main Header */}
          <div className="relative flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">

            {/* =================================================
                MENU BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                setIsSidebarOpen(true)
              }
              className="
                group
                relative
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                border
                border-purple-200
                bg-white
                shadow-[0_4px_12px_rgba(91,33,182,0.12)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-purple-300
                hover:bg-purple-50
                hover:shadow-[0_8px_20px_rgba(91,33,182,0.20)]
                active:scale-95
              "
              aria-label="Open navigation menu"
            >

              <span className="flex flex-col gap-[5px]">

                <span className="flex items-center gap-[5px]">
                  <span
                    className="
                      h-[5px]
                      w-[5px]
                      rounded-full
                      bg-purple-700
                      transition-all
                      duration-300
                      group-hover:scale-125
                    "
                  />

                  <span
                    className="
                      h-[4px]
                      w-5
                      rounded-full
                      bg-purple-700
                      transition-all
                      duration-300
                      group-hover:w-6
                    "
                  />
                </span>

                <span className="flex items-center gap-[5px]">
                  <span
                    className="
                      h-[5px]
                      w-[5px]
                      rounded-full
                      bg-orange-500
                      transition-all
                      duration-300
                      group-hover:scale-125
                    "
                  />

                  <span
                    className="
                      h-[4px]
                      w-5
                      rounded-full
                      bg-orange-500
                      transition-all
                      duration-300
                      group-hover:w-6
                    "
                  />
                </span>

              </span>

            </button>

            {/* =================================================
                LOGO
            ================================================= */}

            <div
              className="
                flex
                h-12
                items-center
                rounded-xl
                border
                border-gray-100
                bg-white
                px-3
                shadow-[0_4px_14px_rgba(0,0,0,0.07)]
                transition-all
                duration-300
                hover:shadow-[0_7px_18px_rgba(91,33,182,0.12)]
                sm:px-4
              "
            >

              <img
                src={scoreWellLogo}
                alt="ScoreWell"
                className="h-9 w-auto object-contain sm:h-10"
              />

            </div>

          </div>

          {/* =================================================
              GRADIENT BOTTOM ACCENT
          ================================================= */}

          <div
            className="
              absolute
              bottom-0
              left-0
              h-[3px]
              w-full
              bg-gradient-to-r
              from-purple-700
              via-purple-500
              via-60%
              to-orange-500
            "
          />

        </div>
      </header>

      {/* =====================================================
          OVERLAY
      ===================================================== */}

      {isSidebarOpen && (
        <div
          className="
            fixed
            inset-0
            z-[60]
            bg-purple-950/30
            backdrop-blur-[4px]
          "
          onClick={() =>
            setIsSidebarOpen(false)
          }
          aria-hidden="true"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-[70]
          flex
          h-full
          w-[310px]
          max-w-[88vw]
          flex-col
          overflow-hidden
          bg-gradient-to-b
          from-white
          via-white
          to-purple-50/60
          shadow-[15px_0_45px_rgba(45,20,90,0.22)]
          transition-transform
          duration-300
          ease-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* =================================================
            SIDEBAR HEADER
        ================================================= */}

        <div
          className="
            relative
            flex
            h-[72px]
            shrink-0
            items-center
            justify-between
            border-b
            border-purple-100
            bg-gradient-to-r
            from-white
            via-purple-50
            to-orange-50
            px-5
          "
        >

          {/* Logo */}
          <div
            className="
              flex
              h-11
              items-center
              rounded-xl
              border
              border-gray-100
              bg-white
              px-3
              shadow-sm
            "
          >
            <img
              src={scoreWellLogo}
              alt="ScoreWell"
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={() =>
              setIsSidebarOpen(false)
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              border
              border-gray-100
              bg-white
              text-gray-500
              shadow-sm
              transition-all
              duration-200
              hover:-rotate-3
              hover:border-purple-200
              hover:bg-purple-50
              hover:text-purple-700
              hover:shadow-md
              active:scale-95
            "
            aria-label="Close menu"
          >
            <X size={20} />
          </button>

          {/* Gradient line */}
          <div
            className="
              absolute
              bottom-0
              left-0
              h-[3px]
              w-full
              bg-gradient-to-r
              from-purple-700
              via-purple-500
              to-orange-500
            "
          />

        </div>

        {/* =================================================
            USER INFORMATION
        ================================================= */}

        <div
          className="
            border-b
            border-purple-100
            bg-gradient-to-br
            from-purple-100/70
            via-white
            to-orange-100/60
            px-5
            py-5
          "
        >

          {isLoadingUser ? (
            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Loader2
                  size={20}
                  className="animate-spin text-purple-700"
                />
              </div>

              <div>
                <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />

                <div className="mt-2 h-2.5 w-36 animate-pulse rounded bg-gray-100" />
              </div>

            </div>
          ) : user ? (
            <div className="flex items-center gap-3">

              {/* Avatar */}
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-purple-600
                  via-purple-700
                  to-purple-900
                  text-white
                  shadow-[0_6px_16px_rgba(91,33,182,0.25)]
                "
              >
                <User size={21} />
              </div>

              {/* User Details */}
              <div className="min-w-0">

                <p className="truncate text-sm font-bold text-gray-900">
                  {user.name}
                </p>

                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {user.email}
                </p>

                <div className="mt-1.5 flex items-center gap-2">

                  <span
                    className="
                      rounded-full
                      bg-gradient-to-r
                      from-purple-100
                      to-purple-200
                      px-2.5
                      py-0.5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-purple-700
                    "
                  >
                    {roleLabel}
                  </span>

                </div>

              </div>

            </div>
          ) : (
            <p className="text-sm text-gray-500">
              User details unavailable
            </p>
          )}

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="flex-1 overflow-y-auto px-4 py-5">

          <p
            className="
              mb-4
              px-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.2em]
              text-gray-400
            "
          >
            Navigation
          </p>

          <div className="space-y-3">

            {menuItems.map((item) => (
              <button
                key={item.route}
                type="button"
                onClick={() =>
                  handleNavigation(item.route)
                }
                className="
                  group
                  relative
                  flex
                  min-h-[58px]
                  w-full
                  items-center
                  gap-3
                  overflow-hidden
                  rounded-2xl
                  border
                  border-purple-100
                  bg-white
                  px-3
                  text-left
                  text-sm
                  font-semibold
                  text-gray-700
                  shadow-[0_3px_10px_rgba(91,33,182,0.07)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-purple-200
                  hover:bg-gradient-to-r
                  hover:from-purple-50
                  hover:via-white
                  hover:to-orange-50
                  hover:text-purple-800
                  hover:shadow-[0_9px_22px_rgba(91,33,182,0.16)]
                  active:translate-y-0
                  active:scale-[0.98]
                "
              >

                {/* Left gradient indicator */}
                <span
                  className="
                    absolute
                    left-0
                    top-0
                    h-full
                    w-1
                    -translate-x-full
                    bg-gradient-to-b
                    from-purple-700
                    to-orange-500
                    transition-transform
                    duration-300
                    group-hover:translate-x-0
                  "
                />

                {/* Icon */}
                <span
                  className="
                    relative
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-purple-50
                    to-orange-50
                    text-purple-600
                    shadow-sm
                    transition-all
                    duration-300
                    group-hover:scale-110
                    group-hover:from-purple-100
                    group-hover:to-orange-100
                    group-hover:text-purple-700
                    group-hover:shadow-md
                  "
                >
                  {item.icon}
                </span>

                {/* Label */}
                <span className="flex-1 leading-5">
                  {item.label}
                </span>

                {/* Arrow */}
                <ChevronRight
                  size={17}
                  className="
                    text-gray-300
                    transition-all
                    duration-300
                    group-hover:translate-x-1
                    group-hover:text-orange-500
                  "
                />

              </button>
            ))}

          </div>

          {/* =================================================
              PROFILE
          ================================================= */}

          <div className="mt-7 border-t border-purple-100 pt-5">

            <p
              className="
                mb-4
                px-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-gray-400
              "
            >
              Account
            </p>

            <button
              type="button"
              onClick={handleProfileClick}
              className="
                group
                relative
                flex
                min-h-[58px]
                w-full
                items-center
                gap-3
                overflow-hidden
                rounded-2xl
                border
                border-purple-100
                bg-white
                px-3
                text-left
                text-sm
                font-semibold
                text-gray-700
                shadow-[0_3px_10px_rgba(91,33,182,0.07)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-purple-200
                hover:bg-gradient-to-r
                hover:from-purple-50
                hover:to-orange-50
                hover:text-purple-800
                hover:shadow-[0_9px_22px_rgba(91,33,182,0.16)]
              "
            >

              <span
                className="
                  absolute
                  left-0
                  top-0
                  h-full
                  w-1
                  -translate-x-full
                  bg-gradient-to-b
                  from-purple-700
                  to-orange-500
                  transition-transform
                  duration-300
                  group-hover:translate-x-0
                "
              />

              <span
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-gradient-to-br
                  from-purple-50
                  to-orange-50
                  text-purple-600
                  shadow-sm
                  transition-all
                  duration-300
                  group-hover:scale-110
                  group-hover:from-purple-100
                  group-hover:to-orange-100
                  group-hover:text-purple-700
                "
              >
                <User size={19} />
              </span>

              <span className="flex-1">
                Profile Details
              </span>

              <ChevronRight
                size={17}
                className="
                  text-gray-300
                  transition-all
                  duration-300
                  group-hover:translate-x-1
                  group-hover:text-orange-500
                "
              />

            </button>

          </div>

        </nav>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <div
          className="
            shrink-0
            border-t
            border-purple-100
            bg-gradient-to-r
            from-white
            via-purple-50/50
            to-orange-50/50
            px-4
            py-4
          "
        >

          <button
            type="button"
            onClick={handleLogout}
            className="
              group
              relative
              flex
              min-h-[58px]
              w-full
              items-center
              gap-3
              overflow-hidden
              rounded-2xl
              border
              border-orange-100
              bg-white
              px-3
              text-left
              text-sm
              font-semibold
              text-gray-600
              shadow-[0_3px_10px_rgba(249,115,22,0.07)]
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-orange-200
              hover:bg-gradient-to-r
              hover:from-orange-50
              hover:to-white
              hover:text-orange-600
              hover:shadow-[0_9px_22px_rgba(249,115,22,0.16)]
              active:translate-y-0
            "
          >

            <span
              className="
                absolute
                left-0
                top-0
                h-full
                w-1
                -translate-x-full
                bg-gradient-to-b
                from-orange-400
                to-orange-600
                transition-transform
                duration-300
                group-hover:translate-x-0
              "
            />

            <span
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-orange-50
                text-orange-500
                shadow-sm
                transition-all
                duration-300
                group-hover:scale-110
                group-hover:bg-orange-100
              "
            >
              <LogOut size={19} />
            </span>

            <span className="flex-1">
              Logout
            </span>

            <ChevronRight
              size={17}
              className="
                text-gray-300
                transition-all
                duration-300
                group-hover:translate-x-1
                group-hover:text-orange-500
              "
            />

          </button>

          <p className="mt-3 text-center text-[10px] font-medium text-gray-400">
            ScoreWell • Examination Platform
          </p>

        </div>

      </aside>
    </>
  );
};

export default Header;
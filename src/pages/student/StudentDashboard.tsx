import { useState } from "react";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const menuItems = [
    {
      name: "Dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <rect
            width="18"
            height="18"
            x="3"
            y="3"
            rx="2"
          />
          <path d="M9 3v18" />
          <path d="M3 9h6" />
          <path d="M3 15h6" />
          <path d="M15 9h3" />
          <path d="M15 13h3" />
          <path d="M15 17h3" />
        </svg>
      ),
    },
    {
      name: "Examinations",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8" />
          <path d="M8 17h6" />
          <path d="M8 9h2" />
        </svg>
      ),
    },
    {
      name: "My Attempts",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <path d="M3 3v18h18" />
          <path d="m7 16 4-5 3 3 5-7" />
        </svg>
      ),
    },
    {
      name: "Profile",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      ),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#faf9ff] text-[#171329]">
      <div className="flex min-h-screen">
        {/* =========================
            SIDEBAR
        ========================== */}

        <aside className="hidden w-72 shrink-0 border-r border-purple-100 bg-white lg:flex lg:flex-col">
          {/* Logo */}

          <div className="flex h-20 items-center border-b border-purple-100 px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-700 text-white shadow-lg shadow-purple-200">
                <span className="text-lg font-black">
                  S
                </span>
              </div>

              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-purple-800">
                  ScoreWell
                </h1>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Student Portal
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}

          <nav className="flex-1 space-y-2 px-4 py-6">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Main Menu
            </p>

            {menuItems.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setActiveMenu(item.name)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activeMenu === item.name
                    ? "bg-purple-50 text-purple-700 shadow-sm"
                    : "text-slate-500 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                {item.icon}

                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Bottom */}

          <div className="border-t border-purple-100 p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>

              Sign Out
            </button>
          </div>
        </aside>

        {/* =========================
            MAIN AREA
        ========================== */}

        <main className="min-w-0 flex-1">
          {/* Top Bar */}

          <header className="flex h-20 items-center justify-between border-b border-purple-100 bg-white px-5 sm:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-600">
                Student Dashboard
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                Welcome back!
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-purple-100 bg-white text-slate-500 transition hover:bg-purple-50 hover:text-purple-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>

                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
                S
              </div>
            </div>
          </header>

          {/* Content */}

          <div className="p-5 sm:p-8">
            {/* Welcome Banner */}

            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-700 via-purple-800 to-purple-950 p-6 text-white shadow-xl shadow-purple-100 sm:p-8">
              <div className="relative z-10 max-w-2xl">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
                  Keep Learning
                </p>

                <h3 className="text-2xl font-bold sm:text-3xl">
                  Ready for your next examination?
                </h3>

                <p className="mt-3 text-sm leading-6 text-purple-100">
                  View your available examinations, continue
                  your assessments and track your academic
                  performance.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setActiveMenu("Examinations")
                  }
                  className="mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-900/20 transition hover:bg-orange-400"
                >
                  View Examinations
                </button>
              </div>

              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />

              <div className="absolute -bottom-32 right-20 h-72 w-72 rounded-full border border-white/10" />
            </section>

            {/* Stats */}

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Available Exams",
                  value: "—",
                  icon: "E",
                },
                {
                  label: "Completed Exams",
                  value: "—",
                  icon: "C",
                },
                {
                  label: "Average Score",
                  value: "—",
                  icon: "A",
                },
                {
                  label: "Pending Exams",
                  value: "—",
                  icon: "P",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        {stat.label}
                      </p>

                      <p className="mt-2 text-2xl font-extrabold text-slate-900">
                        {stat.value}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 font-bold text-purple-700">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Main Cards */}

            <section className="mt-6 grid gap-6 xl:grid-cols-2">
              {/* Available Exams */}

              <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Available Examinations
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Exams available for your department.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveMenu("Examinations")
                    }
                    className="text-sm font-bold text-purple-700 hover:text-orange-500"
                  >
                    View All
                  </button>
                </div>

                <div className="mt-6 rounded-xl border border-dashed border-purple-200 bg-purple-50/50 p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 font-bold text-purple-700">
                    E
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Examination data will appear here
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    This section will be connected to the
                    backend.
                  </p>
                </div>
              </div>

              {/* Recent Attempts */}

              <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Recent Attempts
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Your latest examination activity.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveMenu("My Attempts")
                    }
                    className="text-sm font-bold text-purple-700 hover:text-orange-500"
                  >
                    View All
                  </button>
                </div>

                <div className="mt-6 rounded-xl border border-dashed border-purple-200 bg-purple-50/50 p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 font-bold text-purple-700">
                    A
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Attempt history will appear here
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Real attempt data will come from MongoDB.
                  </p>
                </div>
              </div>
            </section>

            {/* Mobile Navigation */}

            <nav className="mt-6 grid grid-cols-4 gap-2 rounded-2xl border border-purple-100 bg-white p-2 lg:hidden">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setActiveMenu(item.name)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-[10px] font-semibold ${
                    activeMenu === item.name
                      ? "bg-purple-50 text-purple-700"
                      : "text-slate-400"
                  }`}
                >
                  {item.icon}

                  <span className="truncate">
                    {item.name}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
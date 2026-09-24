import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

type MenuItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      path: "/student",
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
      path: "/student/new-exams",
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
      path: "/student/my-performance",
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
      path: "/profile",
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

  const handleMenuClick = (item: MenuItem) => {
    setActiveMenu(item.name);
    navigate(item.path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 text-slate-900">
      <Header />

      <main className="min-h-[calc(100vh-80px)]">
        {/* =========================
            CONTENT
        ========================== */}

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Welcome Banner */}
          <section className="relative overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-700 via-purple-800 to-purple-950 p-6 text-white shadow-[0_18px_50px_rgba(91,33,182,0.20)] sm:p-8 lg:p-10">
            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />

            <div className="absolute -bottom-32 right-20 h-72 w-72 rounded-full border border-white/10" />

            <div className="absolute right-10 top-10 h-20 w-20 rounded-full bg-orange-500/10 blur-2xl" />

            <div className="relative z-10 max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-300/30 bg-orange-400/10 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-orange-400" />

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
                  Keep Learning
                </p>
              </div>

              <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
                Ready for your next examination?
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-purple-100 sm:text-base">
                View your available examinations, continue your
                assessments and track your academic performance.
              </p>

              <button
                type="button"
                onClick={() => handleMenuClick(menuItems[1])}
                className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-950/20 transition-all duration-300 hover:-translate-y-1 hover:bg-orange-400 hover:shadow-xl"
              >
                View Examinations

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </button>
            </div>
          </section>

          {/* Stats */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Available Exams",
                value: "—",
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
                  </svg>
                ),
              },
              {
                label: "Completed Exams",
                value: "—",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="m5 12 4 4L19 6" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                ),
              },
              {
                label: "Average Score",
                value: "—",
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
                label: "Pending Exams",
                value: "—",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                ),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-[0_15px_35px_rgba(91,33,182,0.12)]"
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

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-orange-50 font-bold text-purple-700 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Main Cards */}
          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            {/* Available Exams */}
            <div className="group rounded-2xl border border-purple-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-[0_18px_40px_rgba(91,33,182,0.10)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Available Examinations
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Exams available for your department.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleMenuClick(menuItems[1])}
                  className="whitespace-nowrap text-sm font-bold text-purple-700 transition-colors hover:text-orange-500"
                >
                  View All
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-purple-200 bg-gradient-to-br from-purple-50/80 via-white to-orange-50/60 p-8 text-center transition-all duration-300 group-hover:border-purple-300">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-orange-100 text-purple-700 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M8 13h8" />
                    <path d="M8 17h6" />
                  </svg>
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Examination data will appear here
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  This section will be connected to the backend.
                </p>

                <button
                  type="button"
                  onClick={() => handleMenuClick(menuItems[1])}
                  className="mt-5 rounded-xl border border-purple-200 bg-white px-4 py-2 text-xs font-bold text-purple-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-500"
                >
                  Explore Examinations
                </button>
              </div>
            </div>

            {/* Recent Attempts */}
            <div className="group rounded-2xl border border-purple-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-[0_18px_40px_rgba(91,33,182,0.10)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Recent Attempts
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your latest examination activity.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleMenuClick(menuItems[2])}
                  className="whitespace-nowrap text-sm font-bold text-purple-700 transition-colors hover:text-orange-500"
                >
                  View All
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-purple-200 bg-gradient-to-br from-purple-50/80 via-white to-orange-50/60 p-8 text-center transition-all duration-300 group-hover:border-purple-300">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-orange-100 text-purple-700 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m7 16 4-5 3 3 5-7" />
                  </svg>
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Attempt history will appear here
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Real attempt data will come from MongoDB.
                </p>

                <button
                  type="button"
                  onClick={() => handleMenuClick(menuItems[2])}
                  className="mt-5 rounded-xl border border-purple-200 bg-white px-4 py-2 text-xs font-bold text-purple-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-500"
                >
                  View Performance
                </button>
              </div>
            </div>
          </section>

          {/* Quick Navigation */}
          <section className="mt-6">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-600">
                Quick Navigation
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                Student Portal
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleMenuClick(item)}
                  className={`group relative overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(91,33,182,0.12)] ${
                    activeMenu === item.name
                      ? "border-purple-300 ring-2 ring-purple-100"
                      : "border-purple-100 hover:border-purple-200"
                  }`}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-700 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-orange-50 text-purple-700 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      {item.icon}
                    </div>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-orange-500"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </div>

                  <p className="mt-4 text-sm font-bold text-slate-800">
                    {item.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Open {item.name.toLowerCase()}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
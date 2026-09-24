import { Outlet } from "react-router-dom";

import Header from "../../components/Header";
import Footer from "../../components/Footer";


// =========================================================
// INSTRUCTOR DASHBOARD
// =========================================================

const InstructorDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 text-slate-900">

      {/* =====================================================
          GLOBAL HEADER
      ===================================================== */}

      <Header />


      {/* =====================================================
          MAIN CONTENT
          CHILD ROUTES RENDER THROUGH OUTLET
      ===================================================== */}

      <main className="min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>


      {/* =====================================================
          GLOBAL FOOTER
      ===================================================== */}

      <Footer />

    </div>
  );
};


// =========================================================
// INSTRUCTOR HOME
// =========================================================

export const InstructorHome = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

      {/* =====================================================
          WELCOME BANNER
      ====================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-purple-800 to-purple-950 p-6 text-white shadow-xl shadow-purple-200/60 sm:p-8 lg:p-10">

        <div className="relative z-10 max-w-3xl">

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
            Instructor Workspace
          </p>

          <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
            Manage your examinations.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-purple-100 sm:text-base">
            Create examinations, manage question sets,
            monitor student attempts and review
            examination performance from one place.
          </p>

          <a
            href="/instructor/create-exam"
            className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-900/20 transition-all duration-200 hover:bg-orange-400 hover:shadow-xl active:scale-95"
          >
            Create Examination
          </a>

        </div>


        {/* Decorative circles */}

        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />

        <div className="pointer-events-none absolute -bottom-32 right-20 h-72 w-72 rounded-full border border-white/10" />

        <div className="pointer-events-none absolute right-10 top-10 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl" />

      </section>


      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {[
          {
            label: "Total Exams",
            value: "—",
            icon: "E",
          },
          {
            label: "Question Sets",
            value: "—",
            icon: "Q",
          },
          {
            label: "Student Attempts",
            value: "—",
            icon: "A",
          },
          {
            label: "Students",
            value: "—",
            icon: "S",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
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


      {/* =====================================================
          MAIN CARDS
      ====================================================== */}

      <section className="mt-6 grid gap-6 xl:grid-cols-2">

        {/* YOUR EXAMINATIONS */}

        <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">

          <div className="flex items-start justify-between gap-4">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Your Examinations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Examinations created by you.
              </p>

            </div>

            <a
              href="/instructor/create-exam"
              className="shrink-0 text-sm font-bold text-purple-700 transition-colors hover:text-orange-500"
            >
              Create
            </a>

          </div>


          <div className="mt-6 rounded-xl border border-dashed border-purple-200 bg-purple-50/50 p-8 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 font-bold text-purple-700">
              E
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700">
              Examination data will appear here
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Your examinations will be loaded from
              MongoDB.
            </p>

          </div>

        </div>


        {/* RECENT ATTEMPTS */}

        <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">

          <div className="flex items-start justify-between gap-4">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Recent Student Attempts
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest examination submissions.
              </p>

            </div>

            <a
              href="/instructor/students-examination-status"
              className="shrink-0 text-sm font-bold text-purple-700 transition-colors hover:text-orange-500"
            >
              View Status
            </a>

          </div>


          <div className="mt-6 rounded-xl border border-dashed border-purple-200 bg-purple-50/50 p-8 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 font-bold text-purple-700">
              A
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700">
              Student attempt data will appear here
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Real attempt data will come from MongoDB.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          QUICK ACTIONS
      ====================================================== */}

      <section className="mt-6 rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-bold text-slate-900">
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Frequently used instructor actions.
        </p>


        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          {/* CREATE EXAM */}

          <a
            href="/instructor/create-exam"
            className="rounded-xl border border-purple-100 bg-purple-50 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:bg-purple-100 hover:shadow-sm"
          >

            <p className="text-sm font-bold text-purple-800">
              Create Examination
            </p>

            <p className="mt-1 text-xs leading-5 text-purple-600">
              Create and publish an examination.
            </p>

          </a>


          {/* QUESTION SET */}

          <a
            href="/instructor/create-question-set"
            className="rounded-xl border border-purple-100 bg-purple-50 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:bg-purple-100 hover:shadow-sm"
          >

            <p className="text-sm font-bold text-purple-800">
              Create Question Set
            </p>

            <p className="mt-1 text-xs leading-5 text-purple-600">
              Create and manage question sets.
            </p>

          </a>


          {/* STUDENT STATUS */}

          <a
            href="/instructor/students-examination-status"
            className="rounded-xl border border-orange-100 bg-orange-50 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-100 hover:shadow-sm"
          >

            <p className="text-sm font-bold text-orange-800">
              Student Examination Status
            </p>

            <p className="mt-1 text-xs leading-5 text-orange-600">
              Monitor student examination activity.
            </p>

          </a>

        </div>

      </section>


      {/* =====================================================
          ADDITIONAL INFORMATION
      ====================================================== */}

      <section className="mt-6 grid gap-6 lg:grid-cols-2">

        {/* REQUESTED STUDENTS */}

        <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Newly Requested Students
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review newly registered students.
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 font-bold text-orange-600">
              R
            </div>

          </div>


          <div className="mt-5 rounded-xl border border-dashed border-orange-200 bg-orange-50/40 p-6 text-center">

            <p className="text-sm font-semibold text-slate-700">
              No pending requests loaded
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Student registration requests will appear here.
            </p>

          </div>


          <a
            href="/instructor/newly-requested-student"
            className="mt-4 block w-full rounded-xl border border-orange-200 px-4 py-2.5 text-center text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            View Student Requests
          </a>

        </div>


        {/* QUESTION SETS */}

        <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Question Sets
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage your examination question sets.
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 font-bold text-purple-700">
              Q
            </div>

          </div>


          <div className="mt-5 rounded-xl border border-dashed border-purple-200 bg-purple-50/40 p-6 text-center">

            <p className="text-sm font-semibold text-slate-700">
              Question sets will appear here
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Question sets will be loaded from MongoDB.
            </p>

          </div>


          <a
            href="/instructor/create-question-set"
            className="mt-4 block w-full rounded-xl border border-purple-200 px-4 py-2.5 text-center text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
          >
            Create Question Set
          </a>

        </div>

      </section>

    </div>
  );
};


export default InstructorDashboard;
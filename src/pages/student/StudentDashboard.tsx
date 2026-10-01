import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  Outlet,
} from "react-router-dom";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

import type {
  StudentDashboardResponse,
} from "./StudentDashboardComponents/types";

import {
  ArrowRightIcon,
  AttemptsIcon,
  CheckIcon,
  DashboardIcon,
  ExamIcon,
  MissedIcon,
  ProfileIcon,
  ClockIcon,
} from "./StudentDashboardComponents/Icons";

import {
  CardScroller,
} from "./StudentDashboardComponents/CardScroller";

import {
  AvailableExamCard,
} from "./StudentDashboardComponents/AvailableExamCard";

import {
  RecentAttemptCard,
} from "./StudentDashboardComponents/RecentAttemptCard";

import {
  EmptyCard,
} from "./StudentDashboardComponents/EmptyCard";

import {
  AverageScore,
  StatCard,
} from "./StudentDashboardComponents/DashboardStats";

/* =========================================================
   STUDENT DASHBOARD LAYOUT
========================================================= */

const StudentDashboard = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-purple-50 via-white to-orange-50 text-slate-900">
      <Header />

      <main className="min-h-[calc(100vh-80px)]">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

/* =========================================================
   STUDENT HOME
========================================================= */

export const StudentHome = () => {
  const [dashboard, setDashboard] =
    useState<StudentDashboardResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchDashboard =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              "/api/student-dashboard",
              {
                method: "GET",
                credentials: "include",
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const contentType =
            response.headers.get(
              "content-type"
            );

          if (
            !contentType?.includes(
              "application/json"
            )
          ) {
            throw new Error(
              "The dashboard server returned an invalid response."
            );
          }

          const data =
            (await response.json()) as StudentDashboardResponse;

          if (!response.ok) {
            throw new Error(
              data.message ??
                "Unable to load student dashboard."
            );
          }

          setDashboard(data);
        } catch (requestError) {
          console.error(
            "Student dashboard error:",
            requestError
          );

          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "Unable to load dashboard."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const statistics =
    dashboard?.statistics ?? {
      availableExams: 0,
      completedExams: 0,
      missedExams: 0,
      pendingExams: 0,
    };

  /*
    Backend returns averageScore at the
    top level of the dashboard response.
  */
  const averageScore = Number(
    dashboard?.averageScore?.percentage ??
      0
  );

  const availableExams =
    dashboard?.availableExams ??
    [];

  const recentAttempts =
    dashboard?.recentAttempts ??
    [];

  return (
    <div className="mx-auto w-full max-w-7xl overflow-x-hidden px-3 py-5 sm:px-5 sm:py-6 lg:px-8">

      {/* ===================================================
          HERO
      ==================================================== */}

      <section className="relative overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-700 via-purple-800 to-purple-950 p-5 text-white shadow-[0_18px_50px_rgba(91,33,182,0.20)] sm:p-8 lg:p-10">

        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />

        <div className="absolute -bottom-32 right-20 h-72 w-72 rounded-full border border-white/10" />

        <div className="absolute right-10 top-10 h-20 w-20 rounded-full bg-orange-500/10 blur-2xl" />

        <div className="relative z-10 max-w-2xl">

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-300/30 bg-orange-400/10 px-3 py-1.5">

            <span className="h-2 w-2 rounded-full bg-orange-400" />

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300 sm:text-xs">
              Keep Learning
            </p>

          </div>

          <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
            Ready for your next examination?
          </h1>

          <p className="mt-3 max-w-xl text-xs leading-5 text-purple-100 sm:mt-4 sm:text-base sm:leading-6">
            View your available examinations,
            continue your assessments and track
            your academic performance.
          </p>

          <Link
            to="/student/new-exams"
            className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-950/20 transition-all duration-300 hover:-translate-y-1 hover:bg-orange-400 hover:shadow-xl sm:mt-7 sm:px-5 sm:py-3 sm:text-sm"
          >
            View Examinations

            <ArrowRightIcon />
          </Link>

        </div>
      </section>

      {/* ===================================================
          ERROR
      ==================================================== */}

      {error && (
        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 sm:text-sm">
          {error}
        </div>
      )}

      {/* ===================================================
          LOADING
      ==================================================== */}

      {loading ? (
        <>
          <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 xl:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-2xl bg-white shadow-sm sm:h-28"
              />
            ))}
          </section>

          <div className="mt-7 h-48 animate-pulse rounded-3xl bg-white shadow-sm" />

          <div className="mt-7 h-72 animate-pulse rounded-3xl bg-white shadow-sm" />
        </>
      ) : (
        <>
          {/* =================================================
              FOUR STAT BOXES
          ================================================== */}

          <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 xl:grid-cols-4">

            <StatCard
              label="Available Exams"
              value={
                statistics.availableExams
              }
              icon={<ExamIcon />}
            />

            <StatCard
              label="Completed Exams"
              value={
                statistics.completedExams
              }
              icon={<CheckIcon />}
            />

            <StatCard
              label="Missed Exams"
              value={
                statistics.missedExams
              }
              icon={<MissedIcon />}
            />

            <StatCard
              label="Pending Exams"
              value={
                statistics.pendingExams
              }
              icon={<ClockIcon />}
            />

          </section>

          {/* =================================================
              AVERAGE SCORE
          ================================================== */}

          <AverageScore
            score={averageScore}
          />

          {/* =================================================
              AVAILABLE EXAMS
          ================================================== */}

          <section className="mt-7">

            <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">

              <div className="min-w-0">

                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-purple-600 sm:text-xs">
                  Start Learning
                </p>

                <h2 className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">
                  Available Examinations
                </h2>

                <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                  Examinations currently available
                  for you.
                </p>

              </div>

              <Link
                to="/student/new-exams"
                className="flex-shrink-0 text-[10px] font-bold text-purple-700 transition-colors hover:text-orange-500 sm:text-xs"
              >
                View All
              </Link>

            </div>

            <CardScroller>

              {availableExams.length > 0 ? (
                availableExams.map(
                  (exam, index) => (
                    <AvailableExamCard
                      key={`${exam._id || "exam"}-${index}`}
                      exam={exam}
                    />
                  )
                )
              ) : (
                <EmptyCard
                  type="available"
                />
              )}

            </CardScroller>

          </section>

          {/* =================================================
              RECENT ATTEMPTS
          ================================================== */}

          <section className="mt-7">

            <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">

              <div className="min-w-0">

                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-orange-500 sm:text-xs">
                  Your Activity
                </p>

                <h2 className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">
                  Recent Attempts
                </h2>

                <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                  Your latest examination activity.
                </p>

              </div>

              <Link
                to="/student/my-performance"
                className="flex-shrink-0 text-[10px] font-bold text-purple-700 transition-colors hover:text-orange-500 sm:text-xs"
              >
                View All
              </Link>

            </div>

            <CardScroller>

              {recentAttempts.length > 0 ? (
                recentAttempts
                  .slice(0, 12)
                  .map(
                    (attempt, index) => (
                      <RecentAttemptCard
                        key={`${attempt._id || "attempt"}-${index}`}
                        attempt={attempt}
                      />
                    )
                  )
              ) : (
                <EmptyCard
                  type="attempts"
                />
              )}

            </CardScroller>

          </section>

          {/* =================================================
              QUICK NAVIGATION
          ================================================== */}

          <section className="mt-7">

            <div className="mb-3 sm:mb-4">

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-purple-600 sm:text-xs">
                Quick Navigation
              </p>

              <h2 className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">
                Student Portal
              </h2>

            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">

              <Link
                to="/student"
                className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-white p-3 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-[0_18px_40px_rgba(91,33,182,0.12)] sm:p-5"
              >

                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-700 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex items-center justify-between gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-orange-50 text-purple-700 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 sm:h-11 sm:w-11">
                    <DashboardIcon />
                  </div>

                  <ArrowRightIcon />

                </div>

                <p className="mt-3 text-[10px] font-bold text-slate-800 sm:mt-4 sm:text-sm">
                  Dashboard
                </p>

                <p className="mt-1 text-[8px] text-slate-400 sm:text-xs">
                  Open student dashboard
                </p>

              </Link>

              <Link
                to="/student/new-exams"
                className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-white p-3 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-[0_18px_40px_rgba(91,33,182,0.12)] sm:p-5"
              >

                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-700 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex items-center justify-between gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-orange-50 text-purple-700 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 sm:h-11 sm:w-11">
                    <ExamIcon />
                  </div>

                  <ArrowRightIcon />

                </div>

                <p className="mt-3 text-[10px] font-bold text-slate-800 sm:mt-4 sm:text-sm">
                  Examinations
                </p>

                <p className="mt-1 text-[8px] text-slate-400 sm:text-xs">
                  View available examinations
                </p>

              </Link>

              <Link
                to="/student/my-performance"
                className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-white p-3 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-[0_18px_40px_rgba(91,33,182,0.12)] sm:p-5"
              >

                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-700 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex items-center justify-between gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-orange-50 text-purple-700 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 sm:h-11 sm:w-11">
                    <AttemptsIcon />
                  </div>

                  <ArrowRightIcon />

                </div>

                <p className="mt-3 text-[10px] font-bold text-slate-800 sm:mt-4 sm:text-sm">
                  My Attempts
                </p>

                <p className="mt-1 text-[8px] text-slate-400 sm:text-xs">
                  View examination performance
                </p>

              </Link>

              <Link
                to="/student/profile"
                className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-white p-3 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-[0_18px_40px_rgba(91,33,182,0.12)] sm:p-5"
              >

                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-700 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex items-center justify-between gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-orange-50 text-purple-700 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 sm:h-11 sm:w-11">
                    <ProfileIcon />
                  </div>

                  <ArrowRightIcon />

                </div>

                <p className="mt-3 text-[10px] font-bold text-slate-800 sm:mt-4 sm:text-sm">
                  Profile
                </p>

                <p className="mt-1 text-[8px] text-slate-400 sm:text-xs">
                  View profile details
                </p>

              </Link>

            </div>
          </section>
        </>
      )}
    </div>
  );
};

/* =========================================================
   EXPORTS
========================================================= */

export {
  StudentDashboard,
};

export default StudentDashboard;
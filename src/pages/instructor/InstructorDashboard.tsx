import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  Outlet,
} from "react-router-dom";

import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileQuestion,
  GraduationCap,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

type DashboardStatistics = {
  totalExams: number;
  publishedExams: number;
  unpublishedExams: number;
  closedExams: number;
  commonExams: number;
  specialExams: number;
  totalQuestionSets: number;
  totalQuestions: number;
  totalStudents: number;
  permittedStudents: number;
  pendingStudentCount: number;
  totalAttempts: number;
  submittedAttempts: number;
  inProgressAttempts: number;
  averageScore: number;
};

type Instructor = {
  _id: string;
  name: string;
  email: string;
  role: "INSTRUCTOR";
  department?: string | null;
  isActive: boolean;
};

type DashboardExam = {
  _id: string;
  title: string;
  description: string;
  department: string;
  instructorId: string;
  durationMinutes: number;
  questionCount: number;
  marksPerQuestion: number;
  mode: "COMMON" | "SPECIAL";
  maxAttempts: number;
  status:
    | "UNPUBLISHED"
    | "PUBLISHED"
    | "CLOSED";
};

type DashboardQuestionSet = {
  _id: string;
  questionSetName: string;
  department: string;
  questions: unknown[];
  createdBy: string;
  isActive: boolean;
};

type DashboardStudent = {
  _id: string;
  name: string;
  email: string;
  role: "STUDENT";
  department?: string | null;
  isActive: boolean;
  isPermitted?: boolean;
};

type DashboardAttempt = {
  _id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  examId: string;
  examName: string;
  examDepartment: string;
  mode: "COMMON" | "SPECIAL";
  attemptNo: number;
  startTime: string;
  submittedAt?: string | null;
  status:
    | "IN_PROGRESS"
    | "SUBMITTED"
    | "AUTO_SUBMITTED";
  score: number;
  totalMarks: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  timeTakenSeconds: number;
};

type DashboardResponse = {
  success: boolean;
  message?: string;

  instructor: Instructor;

  statistics: DashboardStatistics;

  exams: DashboardExam[];

  questionSets: DashboardQuestionSet[];

  students: DashboardStudent[];

  pendingStudents: DashboardStudent[];

  recentAttempts: DashboardAttempt[];
};

/* =====================================================
   HELPERS
===================================================== */

const formatDate = (
  value: string | Date
): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatTime = (
  value: string | Date
): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

/* =====================================================
   DASHBOARD SHELL
===================================================== */

function InstructorDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />

      <main className="min-h-[calc(100vh-160px)]">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

/* =====================================================
   INSTRUCTOR HOME
===================================================== */

export function InstructorHome() {
  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const fetchDashboard =
    useCallback(
      async (
        isRefresh = false
      ) => {
        try {
          if (isRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const response =
            await fetch(
              "/api/instructor/dashboard",
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
              "The dashboard server returned an invalid response. Make sure the backend is running on port 5000 and the Vite API proxy is configured."
            );
          }

          const data =
            (await response.json()) as DashboardResponse;

          if (!response.ok) {
            throw new Error(
              data.message ??
                "Unable to load dashboard."
            );
          }

          if (!data.success) {
            throw new Error(
              data.message ??
                "Unable to load dashboard."
            );
          }

          setDashboard(data);
        } catch (err) {
          console.error(
            "Dashboard fetch error:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-200">
            <Loader2
              size={28}
              className="animate-spin"
            />
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">
              Loading dashboard
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Fetching your latest ScoreWell data...
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error || !dashboard) {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-100 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle size={28} />
          </div>

          <div className="mt-5 text-center">
            <h1 className="text-2xl font-black text-slate-900">
              Dashboard could not be loaded
            </h1>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {error ||
                "No dashboard data was returned."}
            </p>

            <button
              type="button"
              onClick={() =>
                void fetchDashboard(true)
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-700"
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  const {
    instructor,
    statistics,
    exams,
    questionSets,
    students,
    recentAttempts,
  } = dashboard;

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* =================================================
            WELCOME BANNER
        ================================================= */}

        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-purple-700 via-purple-600 to-orange-500 p-6 text-white shadow-xl shadow-purple-200/60 sm:p-8">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

          <div className="absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-orange-300/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                <BarChart3 size={14} />
                Instructor Dashboard
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Welcome back,{" "}
                {instructor.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-purple-50 sm:text-base">
                Manage examinations, question
                sets, students and performance
                from one place.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                  {instructor.email}
                </span>

                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                  {instructor.department ??
                    "Department not set"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void fetchDashboard(true)
              }
              disabled={refreshing}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-purple-700 shadow-lg transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
              {refreshing
                ? "Refreshing..."
                : "Refresh Data"}
            </button>
          </div>
        </div>

        {/* =================================================
            PRIMARY STATISTICS
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            title="Total Exams"
            value={statistics.totalExams}
            subtitle="Created by you"
            icon={
              <BookOpen size={22} />
            }
            href="/instructor/create-exam"
            iconClass="bg-purple-50 text-purple-600"
          />

          <DashboardStatCard
            title="Question Sets"
            value={
              statistics.totalQuestionSets
            }
            subtitle={`${statistics.totalQuestions} total questions`}
            icon={
              <FileQuestion size={22} />
            }
            href="/instructor/create-question-set"
            iconClass="bg-orange-50 text-orange-600"
          />

          <DashboardStatCard
            title="Students"
            value={
              statistics.totalStudents
            }
            subtitle={`${statistics.permittedStudents} permitted`}
            icon={
              <GraduationCap size={22} />
            }
            href="/instructor/students-examination-status"
            iconClass="bg-purple-50 text-purple-600"
          />

          <DashboardStatCard
            title="Total Attempts"
            value={
              statistics.totalAttempts
            }
            subtitle={`${statistics.submittedAttempts} submitted`}
            icon={
              <BarChart3 size={22} />
            }
            href="/instructor/students-examination-status"
            iconClass="bg-orange-50 text-orange-600"
          />
        </div>

        {/* =================================================
            SECONDARY STATISTICS
        ================================================= */}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <MiniStat
            label="Published"
            value={
              statistics.publishedExams
            }
            href="/instructor/create-exam"
          />

          <MiniStat
            label="Unpublished"
            value={
              statistics.unpublishedExams
            }
            href="/instructor/create-exam"
          />

          <MiniStat
            label="Closed"
            value={
              statistics.closedExams
            }
            href="/instructor/create-exam"
          />

          <MiniStat
            label="Common"
            value={
              statistics.commonExams
            }
            href="/instructor/create-exam"
          />

          <MiniStat
            label="Special"
            value={
              statistics.specialExams
            }
            href="/instructor/create-exam"
          />

          <MiniStat
            label="In Progress"
            value={
              statistics.inProgressAttempts
            }
            href="/instructor/students-examination-status"
          />
        </div>

        {/* =================================================
            PERFORMANCE + PENDING STUDENTS
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Link
            to="/instructor/students-examination-status"
            className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/60 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-purple-100 hover:shadow-2xl hover:shadow-purple-200/60"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Average Score
                </p>

                <p className="mt-3 text-4xl font-black text-slate-900">
                  {statistics.averageScore}
                  <span className="text-2xl text-slate-400">
                    %
                  </span>
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white">
                <BarChart3 size={23} />
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-orange-500 transition-all"
                style={{
                  width: `${Math.min(
                    Math.max(
                      statistics.averageScore,
                      0
                    ),
                    100
                  )}%`,
                }}
              />
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-400">
              Based on submitted attempts
            </p>
          </Link>

          <Link
            to="/instructor/students-examination-status"
            className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/60 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-orange-100 hover:shadow-2xl hover:shadow-orange-200/60"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Submitted Attempts
                </p>

                <p className="mt-3 text-4xl font-black text-slate-900">
                  {
                    statistics.submittedAttempts
                  }
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
                <CheckCircle2 size={23} />
              </div>
            </div>

            <p className="mt-5 text-xs font-semibold text-slate-400">
              Completed and auto-submitted examinations
            </p>
          </Link>

          <Link
            to="/instructor/newly-requested-student"
            className="group rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-6 shadow-lg shadow-orange-100/50 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-200/60"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Pending Student Requests
                </p>

                <p className="mt-3 text-4xl font-black text-orange-600">
                  {
                    statistics.pendingStudentCount
                  }
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm transition group-hover:bg-orange-500 group-hover:text-white">
                <Users size={23} />
              </div>
            </div>

            <p className="mt-5 text-xs font-semibold text-slate-400">
              Students waiting for permission
            </p>
          </Link>
        </div>

        {/* =================================================
            EXAMS
        ================================================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-200/60 transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-200/70">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Your Examinations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Exams created and managed by you.
              </p>
            </div>

            <Link
              to="/instructor/create-exam"
              className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-purple-700"
            >
              Manage Exams
            </Link>
          </div>

          {exams.length === 0 ? (
            <EmptyState
              title="No examinations yet"
              description="Create your first examination to see it here."
              href="/instructor/create-exam"
              action="Create Examination"
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {exams
                .slice(0, 6)
                .map((exam) => (
                  <Link
                    key={exam._id}
                    to="/instructor/create-exam"
                    className="block rounded-2xl border border-transparent p-5 shadow-sm shadow-slate-100/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-purple-100 hover:bg-purple-50/40 hover:shadow-lg hover:shadow-purple-100/70 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-bold text-slate-900">
                            {exam.title}
                          </h3>

                          <StatusBadge
                            status={
                              exam.status
                            }
                          />

                          <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700">
                            {exam.mode}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-1 text-sm text-slate-500">
                          {exam.description ||
                            "No description provided."}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-5 text-center sm:text-left">
                        <ExamInfo
                          label="Questions"
                          value={
                            exam.questionCount
                          }
                        />

                        <ExamInfo
                          label="Duration"
                          value={`${exam.durationMinutes}m`}
                        />

                        <ExamInfo
                          label="Attempts"
                          value={
                            exam.maxAttempts
                          }
                        />
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </section>

        {/* =================================================
            RECENT ATTEMPTS
        ================================================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-200/60 transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-200/70">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Recent Student Attempts
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest examination activity from your students.
              </p>
            </div>

            <Link
              to="/instructor/students-examination-status"
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              View All Attempts
            </Link>
          </div>

          {recentAttempts.length ===
          0 ? (
            <EmptyState
              title="No attempts yet"
              description="Student examination attempts will appear here."
              href="/instructor/students-examination-status"
              action="Open Examination Status"
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAttempts.map(
                (attempt) => (
                  <Link
                    key={attempt._id}
                    to="/instructor/students-examination-status"
                    className="block rounded-2xl border border-transparent p-5 shadow-sm shadow-slate-100/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-orange-100 hover:bg-orange-50/40 hover:shadow-lg hover:shadow-orange-100/70 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                          <GraduationCap
                            size={20}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {
                              attempt.studentName
                            }
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {
                              attempt.studentEmail
                            }
                          </p>

                          <p className="mt-1 truncate text-xs font-semibold text-purple-600">
                            {
                              attempt.examName
                            }
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                        <AttemptInfo
                          label="Status"
                          value={
                            attempt.status
                          }
                        />

                        <AttemptInfo
                          label="Score"
                          value={`${attempt.score}/${attempt.totalMarks}`}
                        />

                        <AttemptInfo
                          label="Mode"
                          value={
                            attempt.mode
                          }
                        />

                        <AttemptInfo
                          label="Started"
                          value={`${formatDate(
                            attempt.startTime
                          )} ${formatTime(
                            attempt.startTime
                          )}`}
                        />
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </section>

        {/* =================================================
            QUESTION SETS + STUDENTS
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-200/60 transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-200/70">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Question Sets
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your created question sets.
                </p>
              </div>

              <Link
                to="/instructor/create-question-set"
                className="rounded-xl bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-100"
              >
                Manage
              </Link>
            </div>

            {questionSets.length ===
            0 ? (
              <EmptyState
                title="No question sets"
                description="Create a question set to begin building exams."
                href="/instructor/create-question-set"
                action="Create Question Set"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {questionSets
                  .slice(0, 5)
                  .map(
                    (questionSet) => (
                      <Link
                        key={
                          questionSet._id
                        }
                        to="/instructor/create-question-set"
                        className="block rounded-2xl border border-transparent p-5 shadow-sm shadow-slate-100/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-purple-100 hover:bg-purple-50/40 hover:shadow-lg hover:shadow-purple-100/70"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {
                                questionSet.questionSetName
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                questionSet.department
                              }
                            </p>
                          </div>

                          <div className="shrink-0 rounded-xl bg-orange-50 px-3 py-2 text-center">
                            <p className="text-lg font-black text-orange-600">
                              {
                                questionSet.questions
                                  .length
                              }
                            </p>

                            <p className="text-[10px] font-bold uppercase tracking-wide text-orange-500">
                              Questions
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                  )}
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-200/60 transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-200/70">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Students
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Students in your department.
                </p>
              </div>

              <Link
                to="/instructor/students-examination-status"
                className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 transition hover:bg-orange-100"
              >
                View
              </Link>
            </div>

            {students.length ===
            0 ? (
              <EmptyState
                title="No students found"
                description="Students belonging to your department will appear here."
                href="/instructor/students-examination-status"
                action="Open Students"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {students
                  .slice(0, 5)
                  .map(
                    (student) => (
                      <Link
                        key={
                          student._id
                        }
                        to="/instructor/students-examination-status"
                        className="block rounded-2xl border border-transparent p-5 shadow-sm shadow-slate-100/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-orange-100 hover:bg-orange-50/40 hover:shadow-lg hover:shadow-orange-100/70"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-sm font-black text-purple-600">
                              {student.name
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {
                                  student.name
                                }
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {
                                  student.email
                                }
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              student.isPermitted
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-orange-50 text-orange-600"
                            }`}
                          >
                            {student.isPermitted
                              ? "Permitted"
                              : "Pending"}
                          </span>
                        </div>
                      </Link>
                    )
                  )}
              </div>
            )}
          </section>
        </div>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/60 transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-200/70">
          <div className="mb-5">
            <h2 className="text-lg font-black text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Jump directly to the existing management sections.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction
              href="/instructor/create-exam"
              icon={
                <BookOpen size={21} />
              }
              title="Create Exam"
              description="Build and publish examinations"
            />

            <QuickAction
              href="/instructor/create-question-set"
              icon={
                <FileQuestion size={21} />
              }
              title="Question Sets"
              description="Create and manage questions"
            />

            <QuickAction
              href="/instructor/students-examination-status"
              icon={
                <BarChart3 size={21} />
              }
              title="Exam Status"
              description="Track student examination activity"
            />

            <QuickAction
              href="/instructor/newly-requested-student"
              icon={
                <Users size={21} />
              }
              title="Student Requests"
              description={`${statistics.pendingStudentCount} pending request${
                statistics.pendingStudentCount ===
                1
                  ? ""
                  : "s"
              }`}
            />
          </div>
        </section>

        {/* =================================================
            FOOTNOTE
        ================================================= */}

        <div className="flex flex-col gap-2 rounded-2xl border border-purple-100 bg-purple-50/60 px-5 py-4 text-xs text-purple-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Clock3 size={15} />

            <span>
              Dashboard data is loaded directly from
              your ScoreWell backend.
            </span>
          </div>

          <span className="font-bold">
            Department:{" "}
            {instructor.department ??
              "Not configured"}
          </span>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function DashboardStatCard({
  title,
  value,
  subtitle,
  icon,
  href,
  iconClass,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
  iconClass: string;
}) {
  return (
    <Link
      to={href}
      className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/60 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-purple-100 hover:shadow-2xl hover:shadow-purple-200/60"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition duration-300 group-hover:scale-110 ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </Link>
  );
}

/* =====================================================
   MINI STAT
===================================================== */

function MiniStat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-md shadow-slate-200/50 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-100 hover:shadow-xl hover:shadow-purple-200/50"
    >
      <p className="text-2xl font-black text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </Link>
  );
}

/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({
  status,
}: {
  status:
    | "UNPUBLISHED"
    | "PUBLISHED"
    | "CLOSED";
}) {
  const classes =
    status === "PUBLISHED"
      ? "bg-emerald-50 text-emerald-600"
      : status === "CLOSED"
        ? "bg-slate-100 text-slate-600"
        : "bg-orange-50 text-orange-600";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${classes}`}
    >
      {status}
    </span>
  );
}

/* =====================================================
   EXAM INFO
===================================================== */

function ExamInfo({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div>
      <p className="text-sm font-black text-slate-800">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* =====================================================
   ATTEMPT INFO
===================================================== */

function AttemptInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="max-w-[130px] truncate text-xs font-bold text-slate-800">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* =====================================================
   QUICK ACTION
===================================================== */

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={href}
      className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-md shadow-slate-200/50 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-100 hover:bg-purple-50 hover:shadow-xl hover:shadow-purple-200/50"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-purple-600 shadow-sm transition group-hover:bg-purple-600 group-hover:text-white">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </Link>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
        <FileQuestion size={22} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
        {description}
      </p>

      <Link
        to={href}
        className="mt-4 inline-flex rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-purple-700"
      >
        {action}
      </Link>
    </div>
  );
}

export default InstructorDashboard;
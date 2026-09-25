import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Trash2,
  User,
  Users,
  BarChart3,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

interface PendingStudent {
  _id: string;
  name: string;
  email: string;
  role: "STUDENT";
  department?: string | null;
  isActive: boolean;
  isPermitted: boolean;
}

interface DepartmentStudent
  extends PendingStudent {
  attendedExams: number;
  totalScore: number;
  totalMarks: number;
  averagePercentage: number;
}

interface StudentsResponse {
  success: boolean;
  message?: string;
  students?: PendingStudent[];
}

interface DepartmentStudentsResponse {
  success: boolean;
  message?: string;
  department?: string;
  students?: DepartmentStudent[];
}

const NewlyRequestedStudent = () => {
  const navigate = useNavigate();

  const [pendingStudents, setPendingStudents] =
    useState<PendingStudent[]>([]);

  const [departmentStudents, setDepartmentStudents] =
    useState<DepartmentStudent[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [studentsLoading, setStudentsLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [studentsError, setStudentsError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const fetchPendingStudents =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/student-requests`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data: StudentsResponse =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load student requests."
          );
        }

        setPendingStudents(
          data.students ?? []
        );
      } catch (err) {
        console.error(
          "Pending student loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load student requests."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  const fetchDepartmentStudents =
    useCallback(async () => {
      try {
        setStudentsLoading(true);
        setStudentsError("");

        const response = await fetch(
          `${API_URL}/api/student-requests/students`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data: DepartmentStudentsResponse =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load department students."
          );
        }

        setDepartmentStudents(
          data.students ?? []
        );
      } catch (err) {
        console.error(
          "Department students loading error:",
          err
        );

        setStudentsError(
          err instanceof Error
            ? err.message
            : "Unable to load department students."
        );
      } finally {
        setStudentsLoading(false);
      }
    }, []);

  const refreshAll = useCallback(async () => {
    setSuccessMessage("");

    await Promise.all([
      fetchPendingStudents(),
      fetchDepartmentStudents(),
    ]);
  }, [
    fetchPendingStudents,
    fetchDepartmentStudents,
  ]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const handleStudentAction = async (
    student: PendingStudent,
    action: "accept" | "deny"
  ) => {
    if (action === "deny") {
      const confirmed = window.confirm(
        `Deny and permanently delete ${student.name}'s student account?`
      );

      if (!confirmed) return;
    }

    try {
      setActionLoading(
        `${action}-${student._id}`
      );

      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_URL}/api/student-requests/${student._id}/${action}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            `Unable to ${action} student.`
        );
      }

      setPendingStudents((previous) =>
        previous.filter(
          (item) =>
            item._id !== student._id
        )
      );

      if (action === "accept") {
        setDepartmentStudents(
          (previous) =>
            previous.map((item) =>
              item._id === student._id
                ? {
                    ...item,
                    isPermitted: true,
                  }
                : item
            )
        );
      } else {
        setDepartmentStudents(
          (previous) =>
            previous.filter(
              (item) =>
                item._id !== student._id
            )
        );
      }

      setSuccessMessage(
        action === "accept"
          ? `${student.name} has been accepted successfully.`
          : `${student.name}'s request has been denied and the account has been deleted.`
      );
    } catch (err) {
      console.error(
        `Student ${action} error:`,
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : `Unable to ${action} student.`
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-xl shadow-purple-100/40">
        {/* HERO */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-800 via-purple-700 to-orange-500 p-6 text-white sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-orange-300/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-purple-100">
                <User size={17} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">
                  Student Management
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                Students
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                Review new student requests and
                monitor the overall academic performance
                of students in your department.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void refreshAll()}
                disabled={
                  loading || studentsLoading
                }
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={
                    loading || studentsLoading
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh
              </button>

              <Link
                to="/instructor"
                className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-purple-700 transition hover:bg-purple-50"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          {/* MESSAGES */}
          {error && (
            <MessageBox
              type="error"
              message={error}
            />
          )}

          {successMessage && (
            <MessageBox
              type="success"
              message={successMessage}
            />
          )}

          {/* =================================================
              SECTION 1 — NEWLY REQUESTED STUDENTS
          ================================================= */}
          <section>
            <SectionHeader
              icon={<Clock3 size={21} />}
              eyebrow="Requires Action"
              title="Newly Requested Students"
              description="Students from your department waiting for instructor permission."
              count={pendingStudents.length}
            />

            <div className="mt-5">
              {loading ? (
                <LoadingBox
                  title="Loading student requests"
                  description="Checking for newly registered students..."
                />
              ) : pendingStudents.length === 0 ? (
                <EmptyBox
                  icon={
                    <CheckCircle2 size={30} />
                  }
                  title="No pending student requests"
                  description="There are currently no student accounts waiting for permission."
                />
              ) : (
                <div className="space-y-4">
                  {pendingStudents.map(
                    (student) => {
                      const accepting =
                        actionLoading ===
                        `accept-${student._id}`;

                      const denying =
                        actionLoading ===
                        `deny-${student._id}`;

                      const busy =
                        accepting || denying;

                      return (
                        <div
                          key={student._id}
                          className="group overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-md shadow-purple-100/50 transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-200/60"
                        >
                          <div className="h-1.5 bg-gradient-to-r from-purple-700 via-purple-500 to-orange-400" />

                          <div className="p-5 sm:p-6">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                              <div className="flex min-w-0 items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 shadow-sm">
                                  <User size={25} />
                                </div>

                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-extrabold text-slate-900">
                                      {student.name}
                                    </h2>

                                    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-orange-600">
                                      Pending
                                    </span>
                                  </div>

                                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                    <Mail
                                      size={15}
                                      className="shrink-0 text-purple-500"
                                    />
                                    <span className="truncate">
                                      {student.email}
                                    </span>
                                  </div>

                                  <div className="mt-4 flex flex-wrap gap-2">
                                    <InfoPill
                                      label="Department"
                                      value={
                                        student.department ||
                                        "Not specified"
                                      }
                                    />

                                    <InfoPill
                                      label="Role"
                                      value="Student"
                                    />

                                    <InfoPill
                                      label="Permission"
                                      value="Not Permitted"
                                      danger
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:shrink-0">
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    void handleStudentAction(
                                      student,
                                      "deny"
                                    )
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-extrabold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {denying ? (
                                    <Loader2
                                      size={17}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2 size={17} />
                                  )}
                                  {denying
                                    ? "Denying..."
                                    : "Deny"}
                                </button>

                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    void handleStudentAction(
                                      student,
                                      "accept"
                                    )
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 to-purple-600 px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-purple-200 transition hover:-translate-y-0.5 hover:from-purple-800 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {accepting ? (
                                    <Loader2
                                      size={17}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <CheckCircle2
                                      size={17}
                                    />
                                  )}
                                  {accepting
                                    ? "Accepting..."
                                    : "Accept"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              SECTION 2 — ALL DEPARTMENT STUDENTS
          ================================================= */}
          <section className="mt-10 border-t border-slate-100 pt-10">
            <SectionHeader
              icon={<GraduationCap size={21} />}
              eyebrow="Department Students"
              title="All Students"
              description="Overall academic performance of every student in your department."
              count={departmentStudents.length}
            />

            {studentsError && (
              <div className="mt-5">
                <MessageBox
                  type="error"
                  message={studentsError}
                />
              </div>
            )}

            <div className="mt-5">
              {studentsLoading ? (
                <LoadingBox
                  title="Loading department students"
                  description="Calculating student examination performance..."
                />
              ) : departmentStudents.length ===
                0 ? (
                <EmptyBox
                  icon={
                    <Users size={30} />
                  }
                  title="No students found"
                  description="There are no students currently registered in your department."
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {departmentStudents.map(
                    (student) => (
                      <button
                        key={student._id}
                        type="button"
                        onClick={() =>
                          navigate(
                            `/instructor/student/${student._id}/performance`
                          )
                        }
                        className="group text-left"
                      >
                        <div className="h-full overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-md shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-200/50">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 shadow-sm transition duration-300 group-hover:bg-purple-600 group-hover:text-white">
                                <User size={21} />
                              </div>

                              <div className="min-w-0">
                                <h3 className="truncate text-base font-extrabold text-slate-900">
                                  {student.name}
                                </h3>

                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                  {student.email}
                                </p>
                              </div>
                            </div>

                            <ArrowRight
                              size={18}
                              className="shrink-0 text-slate-300 transition duration-300 group-hover:translate-x-1 group-hover:text-purple-600"
                            />
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <PerformanceMini
                              icon={
                                <BarChart3
                                  size={15}
                                />
                              }
                              label="Exams"
                              value={
                                student.attendedExams
                              }
                              className="bg-purple-50 text-purple-700"
                            />

                            <PerformanceMini
                              icon={
                                <ShieldCheck
                                  size={15}
                                />
                              }
                              label="Score"
                              value={`${student.totalScore}/${student.totalMarks}`}
                              className="bg-orange-50 text-orange-600"
                            />
                          </div>

                          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Overall Performance
                              </span>

                              <span className="text-lg font-black text-purple-700">
                                {
                                  student.averagePercentage
                                }
                                %
                              </span>
                            </div>

                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-orange-500 transition-all duration-500"
                                style={{
                                  width: `${Math.min(
                                    Math.max(
                                      student.averagePercentage,
                                      0
                                    ),
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                                student.isPermitted
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-orange-50 text-orange-600"
                              }`}
                            >
                              {student.isPermitted
                                ? "Permitted"
                                : "Pending"}
                            </span>

                            <span className="text-xs font-bold text-purple-600 opacity-0 transition group-hover:opacity-100">
                              View Performance
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({
  icon,
  eyebrow,
  title,
  description,
  count,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  count: number;
}) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 shadow-sm">
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-orange-500">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>

    <div className="w-fit rounded-2xl bg-purple-50 px-4 py-2 text-center">
      <p className="text-2xl font-black text-purple-700">
        {count}
      </p>
      <p className="text-[9px] font-extrabold uppercase tracking-wider text-purple-400">
        Students
      </p>
    </div>
  </div>
);

const PerformanceMini = ({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className: string;
}) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-xl ${className}`}
    >
      {icon}
    </div>

    <p className="mt-2 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
      {label}
    </p>

    <p className="mt-0.5 truncate text-sm font-black text-slate-800">
      {value}
    </p>
  </div>
);

const LoadingBox = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="rounded-3xl border border-purple-100 bg-purple-50/40 px-6 py-16 text-center">
    <Loader2
      size={32}
      className="mx-auto animate-spin text-purple-700"
    />

    <h3 className="mt-4 text-lg font-extrabold text-slate-900">
      {title}
    </h3>

    <p className="mt-1 text-sm text-slate-500">
      {description}
    </p>
  </div>
);

const EmptyBox = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="rounded-3xl border border-dashed border-purple-200 bg-gradient-to-br from-purple-50/60 via-white to-orange-50/60 px-6 py-16 text-center">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-purple-600 shadow-sm ring-1 ring-purple-100">
      {icon}
    </div>

    <h3 className="mt-5 text-xl font-extrabold text-slate-900">
      {title}
    </h3>

    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
      {description}
    </p>
  </div>
);

const MessageBox = ({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) => (
  <div
    className={`flex items-start gap-3 rounded-2xl border p-4 ${
      type === "error"
        ? "border-red-100 bg-red-50 text-red-700"
        : "border-emerald-100 bg-emerald-50 text-emerald-700"
    }`}
  >
    {type === "error" ? (
      <AlertCircle
        size={20}
        className="mt-0.5 shrink-0"
      />
    ) : (
      <CheckCircle2
        size={20}
        className="mt-0.5 shrink-0"
      />
    )}

    <p className="text-sm font-semibold">
      {message}
    </p>
  </div>
);

const InfoPill = ({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) => (
  <span
    className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
      danger
        ? "bg-red-50 text-red-600"
        : "bg-slate-100 text-slate-600"
    }`}
  >
    {label}: {value}
  </span>
);

export default NewlyRequestedStudent;

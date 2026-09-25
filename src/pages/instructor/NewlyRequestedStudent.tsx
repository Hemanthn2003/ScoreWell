import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

interface StudentsResponse {
  success: boolean;
  message?: string;
  students?: PendingStudent[];
}

const NewlyRequestedStudent = () => {
  const [students, setStudents] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchPendingStudents = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

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

      setStudents(data.students ?? []);
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
  };

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const handleStudentAction = async (
    student: PendingStudent,
    action: "accept" | "deny"
  ) => {
    if (action === "deny") {
      const confirmed = window.confirm(
        `Deny and permanently delete ${student.name}'s student account?`
      );

      if (!confirmed) {
        return;
      }
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

      setStudents((previous) =>
        previous.filter(
          (item) =>
            item._id !== student._id
        )
      );

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
        {/* HEADER */}
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
                Newly Requested Students
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                Review student registration requests and
                approve or deny accounts before they can
                access ScoreWell.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={fetchPendingStudents}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={
                    loading
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
          {/* SUMMARY */}
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              icon={<Users size={20} />}
              label="Pending Requests"
              value={students.length}
              className="bg-purple-50 text-purple-700"
            />

            <SummaryCard
              icon={<Clock3 size={20} />}
              label="Awaiting Review"
              value={students.length}
              className="bg-orange-50 text-orange-600"
            />

            <SummaryCard
              icon={<ShieldCheck size={20} />}
              label="Approval Required"
              value={students.length > 0 ? "Yes" : "No"}
              className="bg-emerald-50 text-emerald-600"
            />
          </div>

          {/* MESSAGES */}
          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="text-sm font-extrabold">
                  Unable to complete request
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="text-sm font-extrabold">
                  Request processed
                </p>

                <p className="mt-1 text-sm">
                  {successMessage}
                </p>
              </div>
            </div>
          )}

          {/* CONTENT */}
          <div className="mt-7">
            {loading ? (
              <div className="rounded-3xl border border-purple-100 bg-purple-50/40 px-6 py-16 text-center">
                <Loader2
                  size={32}
                  className="mx-auto animate-spin text-purple-700"
                />

                <h2 className="mt-4 text-lg font-extrabold text-slate-900">
                  Loading student requests
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Scanning student accounts for pending
                  permission requests...
                </p>
              </div>
            ) : students.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-purple-200 bg-gradient-to-br from-purple-50/60 via-white to-orange-50/60 px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-purple-600 shadow-sm ring-1 ring-purple-100">
                  <CheckCircle2 size={30} />
                </div>

                <h2 className="mt-5 text-xl font-extrabold text-slate-900">
                  No pending student requests
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  There are currently no student accounts
                  waiting for instructor permission.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => {
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
                      className="group overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-lg"
                    >
                      <div className="h-1.5 bg-gradient-to-r from-purple-700 via-purple-500 to-orange-400" />

                      <div className="p-5 sm:p-6">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex min-w-0 items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
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
                                  value={
                                    student.isPermitted
                                      ? "Permitted"
                                      : "Not Permitted"
                                  }
                                  danger={
                                    !student.isPermitted
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:shrink-0">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                handleStudentAction(
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
                                <Trash2
                                  size={17}
                                />
                              )}
                              {denying
                                ? "Denying..."
                                : "Deny"}
                            </button>

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                handleStudentAction(
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
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className: string;
}) => {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${className}`}
      >
        {icon}
      </div>

      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-slate-900">
        {value}
      </p>
    </div>
  );
};

const InfoPill = ({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) => {
  return (
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
};

export default NewlyRequestedStudent;

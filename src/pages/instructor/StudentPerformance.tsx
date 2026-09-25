import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  GraduationCap,
  Loader2,
  Mail,
  ShieldCheck,
  Trophy,
  User,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

type Student = {
  _id: string;
  name: string;
  email: string;
  role: "STUDENT";
  department?: string | null;
  isActive: boolean;
  isPermitted: boolean;
};

type ExamPerformance = {
  _id: string;
  examId: string;
  examName: string;
  examDepartment: string;
  mode: "COMMON" | "SPECIAL";
  attemptNo: number;
  startTime: string;
  submittedAt?: string | null;
  status: "SUBMITTED" | "AUTO_SUBMITTED";
  score: number;
  totalMarks: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  timeTakenSeconds: number;
};

type PerformanceResponse = {
  success: boolean;
  message?: string;
  student?: Student;
  performance?: {
    attendedExams: number;
    overallScore: number;
    overallMarks: number;
    overallPercentage: number;
  };
  exams?: ExamPerformance[];
};

const formatDate = (
  value: string
) => {
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
  value: string
) => {
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

const formatDuration = (
  seconds: number
) => {
  if (!seconds || seconds < 1) {
    return "—";
  }

  const minutes = Math.floor(
    seconds / 60
  );

  const remainingSeconds =
    seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
};

const StudentPerformance = () => {
  const { id } = useParams<{
    id: string;
  }>();

  const [student, setStudent] =
    useState<Student | null>(null);

  const [exams, setExams] =
    useState<ExamPerformance[]>([]);

  const [performance, setPerformance] =
    useState<
      PerformanceResponse["performance"]
    >(undefined);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchPerformance =
    useCallback(async () => {
      if (!id) {
        setError("Student ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/student-requests/students/${id}/performance`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data: PerformanceResponse =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load student performance."
          );
        }

        setStudent(
          data.student ?? null
        );

        setPerformance(
          data.performance
        );

        setExams(
          data.exams ?? []
        );
      } catch (err) {
        console.error(
          "Student performance error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load student performance."
        );
      } finally {
        setLoading(false);
      }
    }, [id]);

  useEffect(() => {
    void fetchPerformance();
  }, [fetchPerformance]);

  if (loading) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-200">
            <Loader2
              size={28}
              className="animate-spin"
            />
          </div>

          <h1 className="mt-4 text-lg font-black text-slate-900">
            Loading student performance
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Fetching examination history and overall marks...
          </p>
        </div>
      </section>
    );
  }

  if (error || !student) {
    return (
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-900">
            Unable to load student
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "Student details were not found."}
          </p>

          <Link
            to="/instructor/newly-requested-student"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
          >
            <ArrowLeft size={17} />
            Back to Students
          </Link>
        </div>
      </section>
    );
  }

  const overall =
    performance ?? {
      attendedExams: 0,
      overallScore: 0,
      overallMarks: 0,
      overallPercentage: 0,
    };

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-purple-800 via-purple-700 to-orange-500 p-6 text-white shadow-xl shadow-purple-200/60 sm:p-8">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <Link
              to="/instructor/newly-requested-student"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur transition hover:bg-white/25"
            >
              <ArrowLeft size={16} />
              Back to Students
            </Link>

            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur">
                <User size={30} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                    {student.name}
                  </h1>

                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                    Student
                  </span>
                </div>

                <div className="mt-2 flex flex-col gap-1 text-sm text-purple-50 sm:flex-row sm:gap-5">
                  <span className="flex items-center gap-2">
                    <Mail size={14} />
                    {student.email}
                  </span>

                  <span>
                    {student.department ||
                      "Department not set"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OVERALL PERFORMANCE */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PerformanceCard
            icon={<GraduationCap size={22} />}
            label="Attended Exams"
            value={overall.attendedExams}
            className="bg-purple-50 text-purple-700"
          />

          <PerformanceCard
            icon={<BarChart3 size={22} />}
            label="Overall Score"
            value={`${overall.overallScore}/${overall.overallMarks}`}
            className="bg-orange-50 text-orange-600"
          />

          <PerformanceCard
            icon={<Trophy size={22} />}
            label="Overall Percentage"
            value={`${overall.overallPercentage}%`}
            className="bg-emerald-50 text-emerald-600"
          />

          <PerformanceCard
            icon={<ShieldCheck size={22} />}
            label="Account Status"
            value={
              student.isPermitted
                ? "Permitted"
                : "Pending"
            }
            className={
              student.isPermitted
                ? "bg-emerald-50 text-emerald-600"
                : "bg-orange-50 text-orange-600"
            }
          />
        </div>

        {/* OVERALL SCORE BAR */}
        <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-md shadow-purple-100/40">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-500">
                Overall Performance
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-900">
                {overall.overallPercentage}% Overall
              </h2>
            </div>

            <p className="text-sm font-bold text-slate-500">
              {overall.overallScore} marks earned out of{" "}
              {overall.overallMarks}
            </p>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-orange-500 transition-all duration-700"
              style={{
                width: `${Math.min(
                  Math.max(
                    overall.overallPercentage,
                    0
                  ),
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* ATTENDED EXAMS */}
        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-md shadow-slate-200/50">
          <div className="border-b border-slate-100 p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-500">
                  Examination History
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                  Attended Examinations
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest completed attempt for each examination.
                </p>
              </div>

              <div className="rounded-2xl bg-purple-50 px-4 py-2 text-center">
                <p className="text-xl font-black text-purple-700">
                  {exams.length}
                </p>

                <p className="text-[9px] font-extrabold uppercase tracking-wider text-purple-400">
                  Exams
                </p>
              </div>
            </div>
          </div>

          {exams.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <BarChart3 size={26} />
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-900">
                No completed examinations
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                This student has not completed an examination yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {exams.map((exam) => (
                <div
                  key={exam._id}
                  className="p-5 transition hover:bg-purple-50/30 sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                        <GraduationCap size={21} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900">
                            {exam.examName}
                          </h3>

                          <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-extrabold text-purple-700">
                            {exam.mode}
                          </span>

                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-600">
                            {exam.status ===
                            "AUTO_SUBMITTED"
                              ? "Auto Submitted"
                              : "Submitted"}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          Attempt {exam.attemptNo} ·{" "}
                          {formatDate(
                            exam.submittedAt ??
                              exam.startTime
                          )}{" "}
                          at{" "}
                          {formatTime(
                            exam.submittedAt ??
                              exam.startTime
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
                      <ExamMetric
                        label="Score"
                        value={`${exam.score}/${exam.totalMarks}`}
                      />

                      <ExamMetric
                        label="Percentage"
                        value={`${exam.percentage}%`}
                        highlight
                      />

                      <ExamMetric
                        label="Correct"
                        value={exam.correctAnswers}
                      />

                      <ExamMetric
                        label="Time"
                        value={formatDuration(
                          exam.timeTakenSeconds
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center sm:max-w-md">
                    <SmallMetric
                      label="Correct"
                      value={exam.correctAnswers}
                      className="text-emerald-600"
                    />

                    <SmallMetric
                      label="Wrong"
                      value={exam.wrongAnswers}
                      className="text-red-600"
                    />

                    <SmallMetric
                      label="Unanswered"
                      value={exam.unanswered}
                      className="text-slate-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

const PerformanceCard = ({
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
  <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-md shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${className}`}
    >
      {icon}
    </div>

    <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-2xl font-black text-slate-900">
      {value}
    </p>
  </div>
);

const ExamMetric = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) => (
  <div className="rounded-2xl bg-slate-50 p-3 text-center">
    <p
      className={`text-sm font-black ${
        highlight
          ? "text-purple-700"
          : "text-slate-800"
      }`}
    >
      {value}
    </p>

    <p className="mt-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
      {label}
    </p>
  </div>
);

const SmallMetric = ({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) => (
  <div className="rounded-xl bg-slate-50 px-3 py-2">
    <p
      className={`text-sm font-black ${className}`}
    >
      {value}
    </p>

    <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
      {label}
    </p>
  </div>
);

export default StudentPerformance;

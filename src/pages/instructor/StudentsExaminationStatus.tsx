import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Loader2,
  Mail,
  Percent,
  ShieldCheck,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/* =========================================================
   TYPES
========================================================= */

type ExamMode =
  | "COMMON"
  | "SPECIAL";

type AttemptStatus =
  | "NOT_ATTEMPTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "AUTO_SUBMITTED";

type StatusTab =
  | "UNATTEMPTED"
  | "SPECIAL"
  | "COMMON";

interface StatusStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;

  examId: string;
  examName: string;
  examMode: ExamMode;

  attemptId?: string;
  attemptNo?: number;

  status: AttemptStatus;

  questionCount: number;
  answeredCount: number;

  totalMarks: number;
  securedMarks: number;
  percentage: number;

  startTime?: string;
  submittedAt?: string | null;

  timeTakenSeconds: number;
}

interface ExaminationStatusData {
  incomplete: StatusStudent[];
  privateResults: StatusStudent[];
  commonResults: StatusStudent[];
}

interface AttemptQuestion {
  questionId: string;
  question: string;
  options: string[];
  questionType:
    | "SINGLE"
    | "MULTI";

  selectedAnswers: string[];
  correctAnswers: string[];

  isCorrect: boolean;
  marksAwarded: number;
}

interface AttemptDetails {
  attemptId: string;

  student: {
    id: string;
    name: string;
    email: string;
    department: string;
  };

  exam: {
    id: string;
    name: string;
    mode: ExamMode;
    department: string;
    durationMinutes: number;
    questionCount: number;
    marksPerQuestion: number;

    negativeMarking: {
      enabled: boolean;
      penalty: number;
    };
  };

  attempt: {
    attemptNo: number;

    startTime: string;
    submittedAt?: string | null;

    status:
      | "IN_PROGRESS"
      | "SUBMITTED"
      | "AUTO_SUBMITTED";

    timeTakenSeconds: number;

    totalMarks: number;
    securedMarks: number;
    percentage: number;

    answeredCount: number;
    correctAnswers: number;
    wrongAnswers: number;
    unanswered: number;
  };

  questions: AttemptQuestion[];
}

/* =========================================================
   HELPERS
========================================================= */

const formatDateTime = (
  value?: string | null
): string => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

const formatDuration = (
  seconds: number
): string => {
  if (!seconds || seconds < 0) {
    return "0m 0s";
  }

  const hours =
    Math.floor(seconds / 3600);

  const minutes =
    Math.floor(
      (seconds % 3600) / 60
    );

  const remainingSeconds =
    seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
};

const getPercentage = (
  percentage: number
): number => {
  if (!Number.isFinite(percentage)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, percentage)
  );
};

/* =========================================================
   PERCENTAGE CIRCLE
========================================================= */

interface PercentageCircleProps {
  percentage: number;
  size?: number;
}

const PercentageCircle = ({
  percentage,
  size = 116,
}: PercentageCircleProps) => {
  const safePercentage =
    getPercentage(percentage);

  const radius = 45;

  const circumference =
    2 * Math.PI * radius;

  const progress =
    (safePercentage / 100) *
    circumference;

  return (
    <div
      className="relative shrink-0"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        className="-rotate-90"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-slate-100"
        />

        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference - progress
          }
          className="text-purple-600 transition-all duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-slate-900">
          {safePercentage.toFixed(0)}%
        </span>

        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Score
        </span>
      </div>
    </div>
  );
};

/* =========================================================
   RESULT CARD
========================================================= */

interface ResultCardProps {
  item: StatusStudent;
  onClick: () => void;
}

const ResultCard = ({
  item,
  onClick,
}: ResultCardProps) => {
  const percentage =
    getPercentage(item.percentage);

  const missedPercentage =
    Math.max(
      0,
      100 - percentage
    );

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        w-full
        overflow-hidden
        rounded-3xl
        border
        border-purple-100
        bg-white
        text-left
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-purple-300
        hover:shadow-xl
      "
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-purple-700 via-purple-500 to-orange-400" />

      <div className="p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                <User size={22} />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-lg font-extrabold text-slate-900">
                  {item.studentName}
                </h3>

                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <Mail size={14} />

                  <span className="truncate">
                    {item.studentEmail}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoItem
                icon={<BookOpen size={15} />}
                label="Exam"
                value={item.examName}
              />

              <InfoItem
                icon={<Users size={15} />}
                label="Department"
                value={item.department}
              />

              <InfoItem
                icon={<ShieldCheck size={15} />}
                label="Mode"
                value={
                  item.examMode ===
                  "SPECIAL"
                    ? "Private / Special"
                    : "Common"
                }
              />

              <InfoItem
                icon={<FileQuestion size={15} />}
                label="Attempt"
                value={
                  item.attemptNo
                    ? `Attempt ${item.attemptNo}`
                    : "No attempt"
                }
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col">
            <PercentageCircle
              percentage={
                percentage
              }
            />

            <div className="min-w-[210px]">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Secured Marks
                  </span>

                  <span className="text-sm font-extrabold text-purple-700">
                    {item.securedMarks} /{" "}
                    {item.totalMarks}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-700 to-purple-500"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-purple-700">
                    Scored{" "}
                    {percentage.toFixed(
                      1
                    )}
                    %
                  </span>

                  <span className="text-orange-500">
                    Missed{" "}
                    {missedPercentage.toFixed(
                      1
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 border-t border-slate-100 pt-5 sm:grid-cols-4">
          <SummaryItem
            label="Questions"
            value={item.questionCount}
          />

          <SummaryItem
            label="Answered"
            value={item.answeredCount}
          />

          <SummaryItem
            label="Total Marks"
            value={item.totalMarks}
          />

          <SummaryItem
            label="Secured"
            value={item.securedMarks}
            highlight
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <StatusBadge
            status={item.status}
          />

          <span className="text-xs font-bold text-purple-600 transition group-hover:text-orange-500">
            View Details →
          </span>
        </div>
      </div>
    </button>
  );
};

/* =========================================================
   INFO ITEM
========================================================= */

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => {
  return (
    <div className="flex min-w-0 gap-3 rounded-xl bg-slate-50 px-3 py-3">
      <div className="mt-0.5 shrink-0 text-purple-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-xs font-bold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   SUMMARY ITEM
========================================================= */

const SummaryItem = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) => {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-extrabold ${
          highlight
            ? "text-purple-700"
            : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({
  status,
}: {
  status: AttemptStatus;
}) => {
  if (
    status === "SUBMITTED"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
        <CheckCircle2 size={13} />
        Submitted
      </span>
    );
  }

  if (
    status === "AUTO_SUBMITTED"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
        <Clock3 size={13} />
        Auto Submitted
      </span>
    );
  }

  if (
    status === "IN_PROGRESS"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">
        <Clock3 size={13} />
        In Progress
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
      <AlertCircle size={13} />
      Not Attempted
    </span>
  );
};

/* =========================================================
   STATUS TAB BUTTON
========================================================= */

interface StatusTabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}

const StatusTabButton = ({ active, onClick, icon, label, count }: StatusTabButtonProps) => {
  return (
    <button type="button" onClick={onClick} className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-extrabold transition-all duration-200 sm:px-4 sm:text-sm ${active ? "bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-md shadow-purple-200" : "text-slate-500 hover:bg-purple-50 hover:text-purple-700"}`}>
      {icon}
      <span className="truncate">{label}</span>
      <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{count}</span>
    </button>
  );
};

/* =========================================================
   SECTION HEADER
========================================================= */

const SectionHeader = ({
  title,
  description,
  count,
  icon,
}: {
  title: string;
  description: string;
  count: number;
  icon: React.ReactNode;
}) => {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
            {icon}
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <span className="w-fit rounded-full bg-purple-50 px-4 py-2 text-xs font-extrabold text-purple-700">
        {count}{" "}
        {count === 1
          ? "Student"
          : "Students"}
      </span>
    </div>
  );
};

/* =========================================================
   DETAIL MODAL
========================================================= */

interface DetailModalProps {
  data: AttemptDetails;
  onClose: () => void;
}

const DetailModal = ({
  data,
  onClose,
}: DetailModalProps) => {
  const {
    student,
    exam,
    attempt,
    questions,
  } = data;

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-950/60
        p-3
        backdrop-blur-sm
        sm:p-6
      "
      onClick={onClose}
    >
      <div
        className="
          relative
          flex
          h-[95vh]
          w-full
          max-w-6xl
          flex-col
          overflow-hidden
          rounded-3xl
          bg-white
          shadow-2xl
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="shrink-0 border-b border-purple-100 bg-gradient-to-r from-purple-700 via-purple-600 to-orange-400 px-5 py-5 text-white sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-100">
                <ShieldCheck size={16} />

                <span className="text-xs font-bold uppercase tracking-wider">
                  Examination Details
                </span>
              </div>

              <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">
                {exam.name}
              </h2>

              <p className="mt-1 text-sm text-white/80">
                {student.name} •{" "}
                {student.email}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white/15
                text-white
                transition
                hover:bg-white/25
              "
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DetailStat
              icon={<User size={17} />}
              label="Student"
              value={student.name}
            />

            <DetailStat
              icon={<ShieldCheck size={17} />}
              label="Exam Mode"
              value={
                exam.mode ===
                "SPECIAL"
                  ? "Private / Special"
                  : "Common"
              }
            />

            <DetailStat
              icon={<CalendarDays size={17} />}
              label="Attended"
              value={formatDateTime(
                attempt.startTime
              )}
            />

            <DetailStat
              icon={<Clock3 size={17} />}
              label="Time Taken"
              value={formatDuration(
                attempt.timeTakenSeconds
              )}
            />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto]">
            <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge
                  status={
                    attempt.status
                  }
                />

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  Attempt{" "}
                  {attempt.attemptNo}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricBox
                  label="Questions"
                  value={
                    exam.questionCount
                  }
                />

                <MetricBox
                  label="Answered"
                  value={
                    attempt.answeredCount
                  }
                />

                <MetricBox
                  label="Correct"
                  value={
                    attempt.correctAnswers
                  }
                />

                <MetricBox
                  label="Wrong"
                  value={
                    attempt.wrongAnswers
                  }
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricBox
                  label="Unanswered"
                  value={
                    attempt.unanswered
                  }
                />

                <MetricBox
                  label="Total Marks"
                  value={
                    attempt.totalMarks
                  }
                />

                <MetricBox
                  label="Secured"
                  value={
                    attempt.securedMarks
                  }
                  highlight
                />

                <MetricBox
                  label="Percentage"
                  value={`${attempt.percentage.toFixed(
                    1
                  )}%`}
                  highlight
                />
              </div>
            </div>

            <PercentageCircle
              percentage={
                attempt.percentage
              }
              size={150}
            />
          </div>

          <div className="mt-5 rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-base font-extrabold text-slate-900">
              Examination Information
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailStat
                icon={
                  <BookOpen size={17} />
                }
                label="Department"
                value={
                  exam.department
                }
              />

              <DetailStat
                icon={
                  <Clock3 size={17} />
                }
                label="Exam Duration"
                value={`${exam.durationMinutes} minutes`}
              />

              <DetailStat
                icon={
                  <Percent size={17} />
                }
                label="Marks / Question"
                value={String(
                  exam.marksPerQuestion
                )}
              />

              <DetailStat
                icon={
                  <CalendarDays size={17} />
                }
                label="Submitted"
                value={formatDateTime(
                  attempt.submittedAt
                )}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-orange-500"
                />

                <div>
                  <p className="text-sm font-extrabold text-orange-800">
                    Negative Marking
                  </p>

                  {exam
                    .negativeMarking
                    .enabled ? (
                    <p className="mt-1 text-sm text-orange-700">
                      Enabled —{" "}
                      {
                        exam
                          .negativeMarking
                          .penalty
                      }{" "}
                      marks are deducted for an incorrect answer.
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-orange-700">
                      Disabled — no negative marks are applied.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Question Review
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Review every question and the student's submitted answer.
                </p>
              </div>

              <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">
                {questions.length} Questions
              </span>
            </div>

            <div className="space-y-4">
              {questions.map(
                (
                  question,
                  index
                ) => (
                  <QuestionReview
                    key={
                      question.questionId
                    }
                    question={
                      question
                    }
                    number={
                      index + 1
                    }
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   DETAIL STAT
========================================================= */

const DetailStat = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-purple-600">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-extrabold text-slate-800">
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   METRIC BOX
========================================================= */

const MetricBox = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-extrabold ${
          highlight
            ? "text-purple-700"
            : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   QUESTION REVIEW
========================================================= */

const QuestionReview = ({
  question,
  number,
}: {
  question: AttemptQuestion;
  number: number;
}) => {
  const unanswered =
    question.selectedAnswers.length === 0;

  const correct = question.isCorrect;

  return (
    <div
      className={`
        overflow-hidden
        rounded-3xl
        border
        bg-white
        shadow-sm
        ${
          unanswered
            ? "border-slate-200"
            : correct
            ? "border-emerald-200"
            : "border-red-200"
        }
      `}
    >
      <div
        className={`
          flex
          items-center
          justify-between
          gap-4
          border-b
          px-5
          py-4
          ${
            unanswered
              ? "border-slate-100 bg-slate-50"
              : correct
              ? "border-emerald-100 bg-emerald-50/60"
              : "border-red-100 bg-red-50/60"
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div
            className={`
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-sm
              font-extrabold
              ${
                unanswered
                  ? "bg-slate-200 text-slate-600"
                  : correct
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }
            `}
          >
            {number}
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {question.questionType === "MULTI"
              ? "Multiple Choice"
              : "Single Choice"}
          </span>
        </div>

        <div>
          {unanswered ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600">
              <AlertCircle size={13} />
              Unanswered
            </span>
          ) : correct ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={13} />
              Correct
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
              <XCircle size={13} />
              Wrong
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm font-bold leading-6 text-slate-900 sm:text-base">
          {question.question}
        </p>

        <div className="mt-5 space-y-2">
          {question.options.map((option, optionIndex) => {
            const selected = question.selectedAnswers.includes(option);

            // Only the answer selected by the student gets a result color.
            // Unselected options remain neutral, even if they are correct answers.
            const selectedIsCorrect =
              selected && question.correctAnswers.includes(option);

            let style =
              "border-slate-200 bg-white text-slate-600";

            if (selected) {
              style = selectedIsCorrect
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-red-300 bg-red-50 text-red-800";
            }

            return (
              <div
                key={`${question.questionId}-${optionIndex}`}
                className={`rounded-xl border p-3 transition ${style}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      text-xs
                      font-extrabold
                      ${
                        selected
                          ? selectedIsCorrect
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-500"
                      }
                    `}
                  >
                    {String.fromCharCode(65 + optionIndex)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {option}
                    </p>

                    {selected && (
                      <div className="mt-1 flex items-center gap-1.5">
                        {selectedIsCorrect ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span className="text-[10px] font-extrabold uppercase tracking-wider">
                              Student Answer • Correct
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            <span className="text-[10px] font-extrabold uppercase tracking-wider">
                              Student Answer • Wrong
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <span className="text-xs font-bold text-slate-500">
            Marks Awarded
          </span>

          <span
            className={`text-sm font-extrabold ${
              question.marksAwarded > 0
                ? "text-emerald-600"
                : question.marksAwarded < 0
                ? "text-red-600"
                : "text-slate-700"
            }`}
          >
            {question.marksAwarded}
          </span>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN PAGE
========================================================= */

const StudentsExaminationStatus =
  () => {
    const [
      data,
      setData,
    ] =
      useState<ExaminationStatusData | null>(
        null
      );

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      error,
      setError,
    ] = useState("");

    const [
      selectedAttempt,
      setSelectedAttempt,
    ] =
      useState<AttemptDetails | null>(
        null
      );

    const [
      detailLoading,
      setDetailLoading,
    ] = useState(false);

    const [
      detailError,
      setDetailError,
    ] = useState("");

    const [
      activeTab,
      setActiveTab,
    ] = useState<StatusTab>("UNATTEMPTED");

    /* =======================================================
       LOAD STATUS
    ======================================================= */

    const loadStatus =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              `${API_URL}/api/examination-status`,
              {
                method: "GET",
                credentials:
                  "include",
              }
            );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result.message ||
                "Unable to load examination status."
            );
          }

          setData(
            result.data
          );
        } catch (err) {
          console.error(
            "Examination status loading error:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load examination status."
          );
        } finally {
          setLoading(false);
        }
      };

    useEffect(() => {
      loadStatus();
    }, []);

    /* =======================================================
       LOAD ATTEMPT DETAILS
    ======================================================= */

    const openAttempt =
      async (
        attemptId?: string
      ) => {
        if (!attemptId) {
          return;
        }

        try {
          setDetailLoading(true);
          setDetailError("");

          const response =
            await fetch(
              `${API_URL}/api/examination-status/attempt/${attemptId}`,
              {
                method: "GET",
                credentials:
                  "include",
              }
            );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result.message ||
                "Unable to load attempt details."
            );
          }

          setSelectedAttempt(
            result.data
          );
        } catch (err) {
          console.error(
            "Attempt detail error:",
            err
          );

          setDetailError(
            err instanceof Error
              ? err.message
              : "Unable to load attempt details."
          );
        } finally {
          setDetailLoading(false);
        }
      };

    /* =======================================================
       LOADING
    ======================================================= */

    if (loading) {
      return (
        <div className="min-h-screen bg-slate-50 px-4 py-10">
          <div className="mx-auto flex max-w-7xl items-center justify-center py-32">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                <Loader2
                  size={28}
                  className="animate-spin"
                />
              </div>

              <h2 className="mt-5 text-lg font-extrabold text-slate-900">
                Loading Examination Status
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Fetching student examination activity...
              </p>
            </div>
          </div>
        </div>
      );
    }

    /* =======================================================
       ERROR
    ======================================================= */

    if (error) {
      return (
        <div className="min-h-screen bg-slate-50 px-4 py-10">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle size={28} />
              </div>

              <h2 className="mt-5 text-xl font-extrabold text-slate-900">
                Unable to Load Status
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={
                  loadStatus
                }
                className="mt-6 rounded-xl bg-purple-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-800"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    const incomplete =
      data?.incomplete ?? [];

    const privateResults =
      data?.privateResults ?? [];

    const commonResults =
      data?.commonResults ?? [];

    return (
      <>
        <div className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* PAGE HEADER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800 via-purple-700 to-orange-500 p-6 text-white shadow-lg sm:p-8">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />

              <div className="absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-orange-300/20 blur-3xl" />

              <div className="relative">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <div className="flex items-center gap-2 text-purple-100">
                      <ShieldCheck
                        size={17}
                      />

                      <span className="text-xs font-bold uppercase tracking-[0.16em]">
                        Instructor Analytics
                      </span>
                    </div>

                    <h1 className="mt-3 text-2xl font-black sm:text-3xl">
                      Students Examination Status
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                      Track untouched examinations,
                      in-progress attempts,
                      private examinations,
                      and common examination results.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      loadStatus
                    }
                    className="hidden rounded-xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/25 sm:block"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* STATUS NAVIGATION */}
            <div className="sticky top-2 z-20 mt-6 rounded-2xl border border-purple-100 bg-white/95 p-2 shadow-lg shadow-purple-100/40 backdrop-blur">
              <div className="grid grid-cols-3 gap-1">
                <StatusTabButton active={activeTab === "UNATTEMPTED"} onClick={() => setActiveTab("UNATTEMPTED")} icon={<Clock3 size={17} />} label="Unattempted" count={incomplete.length} />
                <StatusTabButton active={activeTab === "SPECIAL"} onClick={() => setActiveTab("SPECIAL")} icon={<ShieldCheck size={17} />} label="Special Exams" count={privateResults.length} />
                <StatusTabButton active={activeTab === "COMMON"} onClick={() => setActiveTab("COMMON")} icon={<Users size={17} />} label="Common Exams" count={commonResults.length} />
              </div>
            </div>

            <section className="mt-7">
              {activeTab === "UNATTEMPTED" && (
                <>
                  <SectionHeader title="Unattempted & Incomplete" description="Students who have not completed their assigned examination." count={incomplete.length} icon={<Clock3 size={20} />} />
                  {incomplete.length === 0 ? <EmptyState title="No incomplete examinations" description="All currently assigned examinations have been completed or there are no pending attempts." /> : <div className="grid gap-5">{incomplete.map((item) => <IncompleteCard key={`${item.examId}-${item.studentId}`} item={item} />)}</div>}
                </>
              )}

              {activeTab === "SPECIAL" && (
                <>
                  <SectionHeader title="Special Examination Results" description="Completed results from individually assigned examinations." count={privateResults.length} icon={<ShieldCheck size={20} />} />
                  {privateResults.length === 0 ? <EmptyState title="No special examination results" description="Completed special examination attempts will appear here." /> : <div className="grid gap-5 xl:grid-cols-2">{privateResults.map((item) => <ResultCard key={item.attemptId ?? `${item.examId}-${item.studentId}`} item={item} onClick={() => openAttempt(item.attemptId)} />)}</div>}
                </>
              )}

              {activeTab === "COMMON" && (
                <>
                  <SectionHeader title="Common Examination Results" description="Completed results from examinations available to the department." count={commonResults.length} icon={<Users size={20} />} />
                  {commonResults.length === 0 ? <EmptyState title="No common examination results" description="Completed common examination attempts will appear here." /> : <div className="grid gap-5 xl:grid-cols-2">{commonResults.map((item) => <ResultCard key={item.attemptId ?? `${item.examId}-${item.studentId}`} item={item} onClick={() => openAttempt(item.attemptId)} />)}</div>}
                </>
              )}
            </section>

          </div>
        </div>

        {/* DETAIL LOADING */}
        {detailLoading && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
            <div className="rounded-2xl bg-white px-7 py-6 text-center shadow-2xl">
              <Loader2
                size={30}
                className="mx-auto animate-spin text-purple-700"
              />

              <p className="mt-3 text-sm font-bold text-slate-700">
                Loading examination details...
              </p>
            </div>
          </div>
        )}

        {/* DETAIL ERROR */}
        {detailError && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle size={28} />
              </div>

              <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                Unable to Open Result
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {detailError}
              </p>

              <button
                type="button"
                onClick={() =>
                  setDetailError(
                    ""
                  )
                }
                className="mt-5 rounded-xl bg-purple-700 px-6 py-3 text-sm font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* DETAIL MODAL */}
        {selectedAttempt && (
          <DetailModal
            data={
              selectedAttempt
            }
            onClose={() =>
              setSelectedAttempt(
                null
              )
            }
          />
        )}
      </>
    );
  };

/* =========================================================
   INCOMPLETE CARD
========================================================= */

const IncompleteCard = ({
  item,
}: {
  item: StatusStudent;
}) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-purple-600" />

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <Clock3 size={22} />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {item.studentName}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {item.studentEmail}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
                  {item.department}
                </span>

                <span className="rounded-full bg-purple-50 px-3 py-1.5 text-[11px] font-bold text-purple-700">
                  {item.examMode ===
                  "SPECIAL"
                    ? "Private / Special"
                    : "Common"}
                </span>

                <StatusBadge
                  status={
                    item.status
                  }
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-orange-50/60 p-5 lg:min-w-[300px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
              Examination
            </p>

            <p className="mt-1 text-sm font-extrabold text-slate-800">
              {item.examName}
            </p>

            {item.startTime && (
              <p className="mt-2 text-xs text-slate-500">
                Started:{" "}
                {formatDateTime(
                  item.startTime
                )}
              </p>
            )}

            <p className="mt-2 text-xs font-semibold text-orange-700">
              {item.status ===
              "IN_PROGRESS"
                ? "Student is currently in the examination."
                : "Student has not attempted this examination."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="rounded-3xl border border-dashed border-purple-200 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
        <FileQuestion
          size={26}
        />
      </div>

      <h3 className="mt-4 text-base font-extrabold text-slate-800">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
};

export default StudentsExaminationStatus;
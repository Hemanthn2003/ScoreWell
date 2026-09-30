import {
  CalendarDays,
  Clock3,
  Timer,
} from "lucide-react";

import ExamTypeBadge from "./ExamTypeBadge";
import CountdownTimer from "./CountdownTimer";

import type {
  PerformanceAttempt,
} from "./types";

interface UpcomingResultCardProps {
  item: PerformanceAttempt;
  onClick: () => void;
}

const formatDateTime = (
  value: string | null
): string => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (
  seconds: number
): string => {
  const safeSeconds = Math.max(
    0,
    Number(seconds || 0)
  );

  const hours = Math.floor(
    safeSeconds / 3600
  );

  const minutes = Math.floor(
    (safeSeconds % 3600) / 60
  );

  const remainingSeconds =
    safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
};

const getStatusLabel = (
  status: PerformanceAttempt["attempt"]["status"]
): string => {
  switch (status) {
    case "SUBMITTED":
      return "Submitted";

    case "AUTO_SUBMITTED":
      return "Auto Submitted";

    case "IN_PROGRESS":
      return "In Progress";

    default:
      return "Not Submitted";
  }
};

const UpcomingResultCard = ({
  item,
  onClick,
}: UpcomingResultCardProps) => {
  const attempt = item.attempt;
  const exam = item.exam;

  const submitted =
    attempt.status === "SUBMITTED" ||
    attempt.status === "AUTO_SUBMITTED";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-3xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-gray-900 transition-colors group-hover:text-purple-700">
            {item.examName || exam.title}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {exam.department}
          </p>
        </div>

        <ExamTypeBadge
          type={exam.examType}
          mode={exam.examMode}
        />
      </div>

      {/* STATUS */}
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-purple-50 px-4 py-3">
        <span className="text-sm font-semibold text-purple-700">
          Published
        </span>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
          {getStatusLabel(
            attempt.status
          )}
        </span>
      </div>

      {/* DETAILS */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {/* ATTENDED */}
        <div className="rounded-2xl bg-gray-50 p-3">
          <div className="flex items-center gap-2 text-gray-500">
            <CalendarDays className="h-4 w-4" />

            <span className="text-xs font-medium">
              Attended
            </span>
          </div>

          <p className="mt-1 text-sm font-semibold text-gray-800">
            {formatDateTime(
              attempt.startTime
            )}
          </p>
        </div>

        {/* TIME TAKEN */}
        <div className="rounded-2xl bg-gray-50 p-3">
          <div className="flex items-center gap-2 text-gray-500">
            <Clock3 className="h-4 w-4" />

            <span className="text-xs font-medium">
              Time Taken
            </span>
          </div>

          <p className="mt-1 text-sm font-semibold text-gray-800">
            {formatDuration(
              attempt.timeTakenSeconds
            )}
          </p>
        </div>
      </div>

      {/* SUBMISSION */}
      <div className="mt-3 rounded-2xl border border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-gray-500">
            Submitted
          </span>

          <span
            className={`text-right text-sm font-semibold ${
              submitted
                ? "text-green-600"
                : "text-orange-500"
            }`}
          >
            {submitted
              ? formatDateTime(
                  attempt.submittedAt
                )
              : "Not submitted"}
          </span>
        </div>
      </div>

      {/* EXAM TYPE + MODE */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
          {exam.examType === "SPECIAL"
            ? "Special Exam"
            : "Common Exam"}
        </span>

        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          {exam.examMode === "STRICT"
            ? "Strict Mode"
            : "Normal Mode"}
        </span>
      </div>

      {/* COUNTDOWN */}
      {item.resultReleaseDate && (
        <div className="mt-5 rounded-2xl bg-gradient-to-r from-purple-600 to-orange-500 p-4 text-white">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />

            <span className="text-xs font-semibold uppercase tracking-wide">
              Result Release
            </span>
          </div>

          <div className="mt-2">
            <CountdownTimer
              deadline={
                item.resultReleaseDate
              }
            />
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-4 text-center text-xs font-medium text-gray-400 transition-colors group-hover:text-purple-500">
        Click to view examination details
      </div>
    </button>
  );
};

export default UpcomingResultCard;
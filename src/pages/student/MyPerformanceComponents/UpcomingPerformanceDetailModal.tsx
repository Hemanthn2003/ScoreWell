import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Timer,
  X,
} from "lucide-react";

import CountdownTimer from "./CountdownTimer";
import ExamTypeBadge from "./ExamTypeBadge";

import type { PerformanceAttempt } from "./types";

interface UpcomingPerformanceDetailModalProps {
  item: PerformanceAttempt;
  onClose: () => void;
}

const formatDateTime = (value: string | null): string => {
  if (!value) {
    return "Not submitted";
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

const formatDuration = (seconds: number): string => {
  const safeSeconds = Math.max(0, Number(seconds || 0));

  const hours = Math.floor(safeSeconds / 3600);

  const minutes = Math.floor((safeSeconds % 3600) / 60);

  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
};

const getStatusLabel = (
  status: PerformanceAttempt["attempt"]["status"],
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

const getStatusClass = (
  status: PerformanceAttempt["attempt"]["status"],
): string => {
  switch (status) {
    case "SUBMITTED":
      return "border-green-200 bg-green-50 text-green-700";

    case "AUTO_SUBMITTED":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "IN_PROGRESS":
      return "border-blue-200 bg-blue-50 text-blue-700";

    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
};

const UpcomingPerformanceDetailModal = ({
  item,
  onClose,
}: UpcomingPerformanceDetailModalProps) => {
  const attempt = item.attempt;
  const exam = item.exam;

  const submitted =
    attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-700 via-purple-600 to-orange-500 px-6 py-6 text-white sm:px-8">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10" />

          <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-orange-300/10" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close examination details"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative pr-12">
            <div className="flex flex-wrap items-center gap-3">
              <ExamTypeBadge type={exam.examType} mode={exam.examMode} />

              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                Upcoming Result
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
              {item.examName || exam.title}
            </h2>

            <p className="mt-2 text-sm text-white/80">{exam.department}</p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-h-[calc(92vh-170px)] overflow-y-auto px-5 py-6 sm:px-8">
          {/* EXAMINATION DETAILS */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Examination Details
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* ATTENDED DATE */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                    <CalendarDays className="h-5 w-5 text-purple-600" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Attended Date
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {formatDateTime(attempt.startTime)}
                    </p>
                  </div>
                </div>
              </div>

              {/* TIME TAKEN */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                    <Clock3 className="h-5 w-5 text-orange-600" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Time Taken
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {formatDuration(attempt.timeTakenSeconds)}
                    </p>
                  </div>
                </div>
              </div>

              {/* SUBMITTED */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                    <FileCheck2 className="h-5 w-5 text-green-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">
                      Submitted
                    </p>

                    <p
                      className={`mt-1 text-sm font-bold ${
                        submitted ? "text-green-600" : "text-orange-500"
                      }`}
                    >
                      {submitted
                        ? formatDateTime(attempt.submittedAt)
                        : "Not submitted"}
                    </p>
                  </div>
                </div>
              </div>

              {/* STATUS */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500">Status</p>

                    <span
                      className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                        attempt.status,
                      )}`}
                    >
                      {getStatusLabel(attempt.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* EXAM TYPE AND MODE */}
          <section className="mt-7">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Examination Type
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* SPECIAL / COMMON */}
              <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">
                  Exam Category
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <ExamTypeBadge type={exam.examType} mode={exam.examMode} />

                  <span className="text-base font-bold text-gray-900">
                    {exam.examType === "SPECIAL"
                      ? "Special Exam"
                      : "Common Exam"}
                  </span>
                </div>
              </div>

              {/* STRICT / NORMAL */}
              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                  Examination Mode
                </p>

                <div className="mt-3">
                  <span
                    className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${
                      exam.examMode === "STRICT"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {exam.examMode === "STRICT" ? "Strict Mode" : "Normal Mode"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* RESULT COUNTDOWN */}
          {item.resultReleaseDate && (
            <section className="mt-7">
              <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 to-orange-500 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                    <Timer className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                      Result Release Countdown
                    </p>

                    <p className="mt-1 text-sm font-medium text-white/90">
                      Time remaining until result release
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <CountdownTimer deadline={item.resultReleaseDate} />
                </div>

                <p className="mt-4 text-xs text-white/70">
                  Release date: {formatDateTime(item.resultReleaseDate)}
                </p>
              </div>
            </section>
          )}

          {/* ATTEMPT INFORMATION */}
          <section className="mt-7">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Attempt
                  </p>

                  <p className="mt-1 text-lg font-bold text-gray-900">
                    Attempt #{attempt.attemptNo}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 px-4 py-3 text-right">
                  <p className="text-xs text-gray-500">Exam Duration</p>

                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {exam.durationMinutes} minutes
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* INFORMATION MESSAGE */}
          <div className="mt-6 rounded-2xl border border-purple-100 bg-purple-50 px-4 py-4">
            <p className="text-sm leading-6 text-purple-700">
              Your score, percentage, answer analysis, and question review are
              available in the completed examination result section after the
              examination becomes expired or closed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingPerformanceDetailModal;

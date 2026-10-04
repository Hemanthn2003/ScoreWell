import type { DashboardAttempt } from "./types";

import { formatDate, formatDuration, formatTime, getExamType } from "./helpers";

import { AttemptsIcon, CheckIcon } from "./Icons";

import { cardWidthClasses } from "./cardStyles";

export const RecentAttemptCard = ({
  attempt,
}: {
  attempt: DashboardAttempt;
}) => {
  const submitted =
    attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED";

  const statusText =
    attempt.status === "AUTO_SUBMITTED"
      ? "Auto Submitted"
      : attempt.status === "SUBMITTED"
        ? "Submitted"
        : "In Progress";

  const resultIsAvailable =
    submitted &&
    (attempt.resultAvailable === true ||
      attempt.examStatus === "EXPIRED" ||
      attempt.examStatus === "CLOSED");

  return (
    <div className={cardWidthClasses}>
      <article
        className="
          h-[270px]
          overflow-hidden
          rounded-2xl
          border
          border-purple-100
          bg-white
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-purple-200
          hover:shadow-[0_18px_40px_rgba(91,33,182,0.12)]

          sm:h-[285px]
          md:h-[300px]
        "
      >
        {/* Header */}

        <div className="relative h-[72px] overflow-hidden bg-gradient-to-r from-purple-700 via-purple-800 to-purple-950 px-3 py-2.5 text-white sm:h-[78px] sm:px-4">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full border border-white/10" />

          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[8px] font-extrabold uppercase sm:text-[9px]">
                {attempt.mode === "SPECIAL" ? "Special" : "Common"}
              </span>

              <span
                className={`rounded-full border px-2 py-0.5 text-[8px] font-bold sm:text-[9px] ${
                  submitted
                    ? "border-emerald-300/30 bg-emerald-400/15 text-emerald-100"
                    : "border-orange-300/30 bg-orange-400/15 text-orange-100"
                }`}
              >
                {statusText}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <AttemptsIcon />

              <span className="truncate text-[9px] font-semibold text-purple-100 sm:text-[10px]">
                Recent Attempt
              </span>
            </div>
          </div>
        </div>

        {/* Body */}

        <div className="flex h-[198px] flex-col p-3 sm:h-[207px] sm:p-4 md:h-[222px]">
          <h3
            title={attempt.examName}
            className="
              line-clamp-2
              min-h-[30px]
              break-words
              text-[12px]
              font-extrabold
              leading-4
              text-slate-900

              sm:min-h-[36px]
              sm:text-sm
              sm:leading-5
            "
          >
            {attempt.examName}
          </h3>

          <p
            title={attempt.examDepartment ?? attempt.department}
            className="mt-1 truncate text-[9px] font-medium text-slate-400 sm:text-[10px]"
          >
            {attempt.examDepartment ?? attempt.department ?? "Examination"}
          </p>

          {/* Details */}

          <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-2">
            <div className="min-w-0">
              <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[9px]">
                Type
              </p>

              <p className="truncate text-[9px] font-bold text-slate-700 sm:text-[10px]">
                {getExamType(attempt)}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[9px]">
                Attempt
              </p>

              <p className="truncate text-[9px] font-bold text-slate-700 sm:text-[10px]">
                #{attempt.attemptNo}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[9px]">
                Date
              </p>

              <p className="truncate text-[9px] font-bold text-slate-700 sm:text-[10px]">
                {formatDate(attempt.submittedAt ?? attempt.startTime)}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[9px]">
                Time
              </p>

              <p className="truncate text-[9px] font-bold text-slate-700 sm:text-[10px]">
                {formatTime(attempt.submittedAt ?? attempt.startTime)}
              </p>
            </div>
          </div>

          {/* Result */}

          <div className="mt-3 rounded-lg bg-purple-50 px-2 py-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[8px] font-bold uppercase tracking-wide text-purple-500 sm:text-[9px]">
                Result
              </span>

              {resultIsAvailable ? (
                <span className="text-[10px] font-extrabold text-purple-700 sm:text-xs">
                  {attempt.score ?? 0}

                  {attempt.totalMarks !== undefined &&
                  attempt.totalMarks !== null
                    ? ` / ${attempt.totalMarks}`
                    : ""}
                </span>
              ) : (
                <span className="text-[8px] font-bold text-slate-400 sm:text-[9px]">
                  Not released
                </span>
              )}
            </div>
          </div>

          {/* Duration */}

          <div className="mt-2 flex items-center justify-between gap-2 text-[8px] font-semibold text-slate-400 sm:text-[9px]">
            <span>Time Taken</span>

            <span className="truncate font-bold text-slate-600">
              {formatDuration(attempt.timeTakenSeconds)}
            </span>
          </div>

          <div className="mt-auto flex items-center gap-1.5 rounded-lg border border-purple-100 bg-white px-2 py-1.5">
            <CheckIcon />

            <span className="truncate text-[8px] font-bold text-purple-600 sm:text-[9px]">
              {submitted ? "Examination completed" : "Examination in progress"}
            </span>
          </div>
        </div>
      </article>
    </div>
  );
};

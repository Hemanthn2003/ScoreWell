import { Link } from "react-router-dom";

import type { DashboardExam } from "./types";

import { getExamType, getDeadline, getNegativeMarkingText } from "./helpers";

import { ArrowRightIcon, ClockIcon, ExamIcon } from "./Icons";

import { Countdown } from "./Countdown";

import { cardWidthClasses } from "./cardStyles";

export const AvailableExamCard = ({ exam }: { exam: DashboardExam }) => {
  const examType = getExamType(exam);

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
                {exam.mode === "SPECIAL" ? "Special" : "Common"}
              </span>

              <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[8px] font-bold sm:text-[9px]">
                {examType}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <ExamIcon />

              <span className="truncate text-[9px] font-semibold text-purple-100 sm:text-[10px]">
                Available Examination
              </span>
            </div>
          </div>
        </div>

        {/* Body */}

        <div className="flex h-[198px] flex-col p-3 sm:h-[207px] sm:p-4 md:h-[222px]">
          <h3
            title={exam.title}
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
            {exam.title}
          </h3>

          <p
            title={exam.department}
            className="mt-1 truncate text-[9px] font-medium text-slate-400 sm:text-[10px]"
          >
            {exam.department || "Department examination"}
          </p>

          {/* Details */}

          <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-2">
            <div className="min-w-0">
              <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[9px]">
                Duration
              </p>

              <p className="truncate text-[9px] font-bold text-slate-700 sm:text-[10px]">
                {exam.durationMinutes} min
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[9px]">
                Questions
              </p>

              <p className="truncate text-[9px] font-bold text-slate-700 sm:text-[10px]">
                {exam.questionCount}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[9px]">
                Marks / Q
              </p>

              <p className="truncate text-[9px] font-bold text-slate-700 sm:text-[10px]">
                {exam.marksPerQuestion}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[9px]">
                Negative
              </p>

              <p className="truncate text-[9px] font-bold text-slate-700 sm:text-[10px]">
                {getNegativeMarkingText(exam)}
              </p>
            </div>
          </div>

          {/* Deadline */}

          <div className="mt-3 flex min-w-0 items-center justify-between gap-1 rounded-lg bg-orange-50 px-2 py-1.5">
            <div className="flex min-w-0 items-center gap-1 text-orange-600">
              <ClockIcon />

              <span className="truncate text-[8px] font-bold sm:text-[9px]">
                Deadline
              </span>
            </div>

            <Countdown deadline={getDeadline(exam)} />
          </div>

          {/* Attempt */}

          <Link
            to="/student/new-exams"
            className="
              mt-auto
              flex
              w-full
              items-center
              justify-center
              gap-1
              rounded-lg
              bg-gradient-to-r
              from-purple-700
              to-purple-800
              px-2
              py-2
              text-[9px]
              font-extrabold
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:from-purple-600
              hover:to-purple-700

              sm:rounded-xl
              sm:py-2.5
              sm:text-[10px]
            "
          >
            Attempt Exam
            <ArrowRightIcon />
          </Link>
        </div>
      </article>
    </div>
  );
};

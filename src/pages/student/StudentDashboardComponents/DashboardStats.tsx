import type {
  ReactNode,
} from "react";

export const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) => {
  return (
    <div
      className="
        group
        rounded-2xl
        border
        border-purple-100
        bg-white
        p-4
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-purple-200
        hover:shadow-[0_15px_35px_rgba(91,33,182,0.12)]

        sm:p-5
      "
    >
      <div className="flex items-center justify-between gap-2">

        <div className="min-w-0">

          <p className="truncate text-[10px] font-semibold text-slate-400 sm:text-xs">
            {label}
          </p>

          <p className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
            {value}
          </p>

        </div>

        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-orange-50 text-purple-700 transition-all duration-300 group-hover:scale-110 sm:h-11 sm:w-11">
          {icon}
        </div>

      </div>
    </div>
  );
};

/* =========================================================
   AVERAGE SCORE
========================================================= */

export const AverageScore = ({
  score,
}: {
  score: number;
}) => {
  const safeScore =
    Math.min(
      Math.max(
        Number(score) || 0,
        0
      ),
      100
    );

  const radius = 70;

  const circumference =
    2 *
    Math.PI *
    radius;

  const offset =
    circumference -
    (safeScore / 100) *
      circumference;

  return (
    <section className="mt-7">

      <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-7">

        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

          <div className="text-center md:text-left">

            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-purple-600 sm:text-xs">
              Performance Analytics
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
              Average Score
            </h2>

            <p className="mt-2 max-w-md text-xs leading-5 text-slate-500 sm:text-sm">
              Calculated only from completed
              examinations whose results are
              available.
            </p>

          </div>

          <div className="relative flex h-36 w-36 flex-shrink-0 items-center justify-center sm:h-40 sm:w-40">

            <svg
              viewBox="0 0 160 160"
              className="h-36 w-36 -rotate-90 sm:h-40 sm:w-40"
            >

              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-purple-100"
              />

              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={
                  circumference
                }
                strokeDashoffset={
                  offset
                }
                className="text-purple-700 transition-all duration-700"
              />

            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">

              <span className="text-3xl font-black text-slate-900">
                {safeScore.toFixed(
                  0
                )}
                %
              </span>

              <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Average
              </span>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
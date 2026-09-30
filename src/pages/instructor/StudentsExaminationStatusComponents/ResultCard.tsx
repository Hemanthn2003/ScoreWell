import {
  BookOpen,
  FileQuestion,
  Mail,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

import type {
  ReactNode,
} from "react";

import type {
  StatusStudent,
} from "./types";

import {
  getPercentage,
} from "./helpers";

import PercentageCircle from "./PercentageCircle";
import StatusBadge from "./StatusBadge";

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
      className="group w-full overflow-hidden rounded-3xl border border-purple-100 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-300 hover:shadow-xl"
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
                icon={
                  <ShieldCheck size={15} />
                }
                label="Mode"
                value={
                  item.examMode === "SPECIAL"
                    ? "Private / Special"
                    : "Common"
                }
              />

              <InfoItem
                icon={
                  <FileQuestion size={15} />
                }
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
              percentage={percentage}
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
                    {percentage.toFixed(1)}%
                  </span>

                  <span className="text-orange-500">
                    Missed{" "}
                    {missedPercentage.toFixed(1)}%
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

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
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

const SummaryItem = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) => {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3">
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

export default ResultCard;
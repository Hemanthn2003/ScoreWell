import { ArrowRight, CheckCircle2, Clock3, FileQuestion } from "lucide-react";

import type { PerformanceAttempt } from "./types";

import { formatDateTime } from "./helpers";

import ExamTypeBadge from "./ExamTypeBadge";

interface ExamResultCardProps {
  item: PerformanceAttempt;
  onClick: () => void;
}

const ExamResultCard = ({ item, onClick }: ExamResultCardProps) => {
  const { exam, attempt } = item;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-3xl border border-purple-100 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-300 hover:shadow-xl"
    >
      <div className="h-1.5 bg-gradient-to-r from-purple-700 to-orange-400" />

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-lg font-black text-slate-900">
                {exam.title}
              </h3>

              <p className="mt-1 text-xs text-slate-500">{exam.department}</p>

              <div className="mt-3">
                <ExamTypeBadge type={exam.examType} mode={exam.examMode} />
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={12} />
                Result
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoBox
              icon={<CheckCircle2 size={15} />}
              label="Score"
              value={`${attempt.score}/${attempt.totalMarks}`}
            />

            <InfoBox
              icon={<FileQuestion size={15} />}
              label="Percentage"
              value={`${attempt.percentage.toFixed(1)}%`}
            />

            <InfoBox
              icon={<CheckCircle2 size={15} />}
              label="Correct"
              value={attempt.correctAnswers}
            />

            <InfoBox
              icon={<Clock3 size={15} />}
              label="Time"
              value={`${Math.floor(attempt.timeTakenSeconds / 60)}m`}
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Submitted
              </p>

              <p className="mt-1 text-xs font-bold text-slate-600">
                {formatDateTime(attempt.submittedAt)}
              </p>
            </div>

            <span className="inline-flex items-center gap-2 text-xs font-extrabold text-purple-700 transition group-hover:text-orange-500">
              View Full Performance
              <ArrowRight size={15} />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

const InfoBox = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-1.5 text-purple-600">
        {icon}

        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-1.5 text-sm font-black text-slate-800">{value}</p>
    </div>
  );
};

export default ExamResultCard;

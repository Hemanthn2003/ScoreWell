import { Clock3 } from "lucide-react";

import type { StatusStudent } from "./types";

import { formatDateTime } from "./helpers";

import StatusBadge from "./StatusBadge";

interface IncompleteCardProps {
  item: StatusStudent;
}

const IncompleteCard = ({ item }: IncompleteCardProps) => {
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

              <p className="mt-1 text-sm text-slate-500">{item.studentEmail}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
                  {item.department}
                </span>

                <span className="rounded-full bg-purple-50 px-3 py-1.5 text-[11px] font-bold text-purple-700">
                  {item.examMode === "SPECIAL" ? "Private / Special" : "Common"}
                </span>

                <StatusBadge status={item.status} />
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
                Started: {formatDateTime(item.startTime)}
              </p>
            )}

            <p className="mt-2 text-xs font-semibold text-orange-700">
              {item.status === "IN_PROGRESS"
                ? "Student is currently in the examination."
                : "Student has not attempted this examination."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncompleteCard;

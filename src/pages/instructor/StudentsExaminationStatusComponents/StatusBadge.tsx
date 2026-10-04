import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";

import type { AttemptStatus } from "./types";

interface StatusBadgeProps {
  status: AttemptStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  if (status === "SUBMITTED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
        <CheckCircle2 size={13} />
        Submitted
      </span>
    );
  }

  if (status === "AUTO_SUBMITTED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
        <Clock3 size={13} />
        Auto Submitted
      </span>
    );
  }

  if (status === "IN_PROGRESS") {
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

export default StatusBadge;

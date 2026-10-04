import { ShieldCheck, Users } from "lucide-react";

import type { ExamMode, ExamType } from "./types";

interface ExamTypeBadgeProps {
  type: ExamType;
  mode: ExamMode;
}

const ExamTypeBadge = ({ type, mode }: ExamTypeBadgeProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-purple-700">
        {type === "SPECIAL" ? <ShieldCheck size={12} /> : <Users size={12} />}

        {type === "SPECIAL" ? "Special Exam" : "Common Exam"}
      </span>

      <span className="rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
        {mode === "STRICT" ? "Strict Mode" : "Normal Mode"}
      </span>
    </div>
  );
};

export default ExamTypeBadge;

import { CheckCircle2, Clock3 } from "lucide-react";

interface ResultTabsProps {
  activeTab: "RESULTS" | "UPCOMING";

  resultCount: number;
  upcomingCount: number;

  onChange: (tab: "RESULTS" | "UPCOMING") => void;
}

const ResultTabs = ({
  activeTab,
  resultCount,
  upcomingCount,
  onChange,
}: ResultTabsProps) => {
  return (
    <div className="rounded-2xl border border-purple-100 bg-white p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange("RESULTS")}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition ${
            activeTab === "RESULTS"
              ? "bg-purple-700 text-white shadow-md shadow-purple-200"
              : "text-slate-500 hover:bg-purple-50 hover:text-purple-700"
          }`}
        >
          <CheckCircle2 size={17} />

          <span>Exam Results</span>

          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              activeTab === "RESULTS"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {resultCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChange("UPCOMING")}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition ${
            activeTab === "UPCOMING"
              ? "bg-gradient-to-r from-purple-700 to-orange-500 text-white shadow-md shadow-purple-200"
              : "text-slate-500 hover:bg-purple-50 hover:text-purple-700"
          }`}
        >
          <Clock3 size={17} />

          <span>Upcoming Result</span>

          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              activeTab === "UPCOMING"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {upcomingCount}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ResultTabs;

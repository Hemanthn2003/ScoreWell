import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

import type { PerformanceOverview } from "./types";

import MetricCard from "./MetricCard";

interface PerformanceStatsProps {
  overview: PerformanceOverview;
}

const PerformanceStats = ({ overview }: PerformanceStatsProps) => {
  return (
    <section>
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-600">
          Performance Overview
        </p>

        <h2 className="mt-1 text-xl font-black text-slate-900">
          Your examination statistics
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<CheckCircle2 size={20} />}
          label="Correct Answers"
          value={overview.correctAnswers}
          description="Correctly answered questions"
        />

        <MetricCard
          icon={<XCircle size={20} />}
          label="Wrong Answers"
          value={overview.wrongAnswers}
          description="Incorrectly answered questions"
        />

        <MetricCard
          icon={<CircleAlert size={20} />}
          label="Unanswered"
          value={overview.unanswered}
          description="Questions left unanswered"
        />

        <MetricCard
          icon={<Clock3 size={20} />}
          label="Completed Exams"
          value={overview.completedExams}
          description="Examinations attempted"
        />

        <MetricCard
          icon={<Users size={20} />}
          label="Common Exams"
          value={overview.commonExams}
          description="Common examination attempts"
        />

        <MetricCard
          icon={<ShieldCheck size={20} />}
          label="Special Exams"
          value={overview.specialExams}
          description="Special examination attempts"
        />

        <MetricCard
          icon={<ShieldCheck size={20} />}
          label="Strict Exams"
          value={overview.strictExams}
          description="Strict examination attempts"
        />

        <MetricCard
          icon={<Clock3 size={20} />}
          label="Total Attempts"
          value={overview.totalAttempts}
          description="All recorded attempts"
        />
      </div>
    </section>
  );
};

export default PerformanceStats;

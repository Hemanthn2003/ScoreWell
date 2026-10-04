import { Award, BarChart3, GraduationCap, Target } from "lucide-react";

import type { StudentInfo, PerformanceOverview } from "./types";

interface PerformanceHeroProps {
  student: StudentInfo;
  overview: PerformanceOverview;
}

const PerformanceHero = ({ student, overview }: PerformanceHeroProps) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800 via-purple-700 to-orange-500 p-6 text-white shadow-xl sm:p-8 lg:p-10">
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />

      <div className="relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-purple-100">
              <GraduationCap size={18} />

              <span className="text-xs font-bold uppercase tracking-[0.2em]">
                Student Performance
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Welcome back, {student.name}
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/80 sm:text-base">
              Your overall examination performance, scores and examination
              history are collected here in one place.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
                {student.department}
              </span>

              <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
                {student.email}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[520px]">
            <HeroMetric
              icon={<BarChart3 size={18} />}
              label="Exams"
              value={overview.totalExams}
            />

            <HeroMetric
              icon={<Target size={18} />}
              label="Attempts"
              value={overview.totalAttempts}
            />

            <HeroMetric
              icon={<Award size={18} />}
              label="Average"
              value={`${overview.averagePercentage.toFixed(1)}%`}
            />

            <HeroMetric
              icon={<GraduationCap size={18} />}
              label="Score"
              value={`${overview.totalScore}/${overview.totalMarks}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const HeroMetric = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-white/70">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
};

export default PerformanceHero;

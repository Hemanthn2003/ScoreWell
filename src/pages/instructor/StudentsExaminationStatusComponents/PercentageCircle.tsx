import { getPercentage } from "./helpers";

interface PercentageCircleProps {
  percentage: number;
  size?: number;
}

const PercentageCircle = ({
  percentage,
  size = 116,
}: PercentageCircleProps) => {
  const safePercentage =
    getPercentage(percentage);

  const radius = 45;

  const circumference =
    2 * Math.PI * radius;

  const progress =
    (safePercentage / 100) *
    circumference;

  return (
    <div
      className="relative shrink-0"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        className="-rotate-90"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-slate-100"
        />

        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference - progress
          }
          className="text-purple-600 transition-all duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-slate-900">
          {safePercentage.toFixed(0)}%
        </span>

        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Score
        </span>
      </div>
    </div>
  );
};

export default PercentageCircle;
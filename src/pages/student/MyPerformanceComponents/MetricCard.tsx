import type {
  ReactNode,
} from "react";

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  description?: string;
}

const MetricCard = ({
  icon,
  label,
  value,
  description,
}: MetricCardProps) => {
  return (
    <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
          {icon}
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-4 text-2xl font-black text-slate-900">
        {value}
      </p>

      {description && (
        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
};

export default MetricCard;
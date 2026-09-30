import type {
  ReactNode,
} from "react";

interface SectionHeaderProps {
  title: string;
  description: string;
  count: number;
  icon: ReactNode;
}

const SectionHeader = ({
  title,
  description,
  count,
  icon,
}: SectionHeaderProps) => {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <span className="w-fit rounded-full bg-purple-50 px-4 py-2 text-xs font-extrabold text-purple-700">
        {count}{" "}
        {count === 1
          ? "Student"
          : "Students"}
      </span>
    </div>
  );
};

export default SectionHeader;
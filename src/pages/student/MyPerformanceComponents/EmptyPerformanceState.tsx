import {
  FileQuestion,
} from "lucide-react";

interface EmptyPerformanceStateProps {
  title: string;
  description: string;
}

const EmptyPerformanceState = ({
  title,
  description,
}: EmptyPerformanceStateProps) => {
  return (
    <div className="rounded-3xl border border-dashed border-purple-200 bg-gradient-to-br from-purple-50/70 via-white to-orange-50/50 p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-orange-100 text-purple-700">
        <FileQuestion
          size={26}
        />
      </div>

      <h3 className="mt-4 text-lg font-black text-slate-800">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
};

export default EmptyPerformanceState;
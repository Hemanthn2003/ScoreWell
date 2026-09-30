import {
  FileQuestion,
} from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

const EmptyState = ({
  title,
  description,
}: EmptyStateProps) => {
  return (
    <div className="rounded-3xl border border-dashed border-purple-200 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
        <FileQuestion size={26} />
      </div>

      <h3 className="mt-4 text-base font-extrabold text-slate-800">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
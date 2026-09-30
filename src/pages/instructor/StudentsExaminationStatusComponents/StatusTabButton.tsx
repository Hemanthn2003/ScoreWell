import type { ReactNode } from "react";

interface StatusTabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  count: number;
}

const StatusTabButton = ({
  active,
  onClick,
  icon,
  label,
  count,
}: StatusTabButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        min-w-0
        items-center
        justify-center
        gap-2
        rounded-xl
        px-3
        py-3
        text-xs
        font-extrabold
        transition-all
        duration-200
        sm:px-4
        sm:text-sm
        ${
          active
            ? "bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-md shadow-purple-200"
            : "text-slate-500 hover:bg-purple-50 hover:text-purple-700"
        }
      `}
    >
      {icon}

      <span className="truncate">
        {label}
      </span>

      <span
        className={`
          rounded-full
          px-2
          py-0.5
          text-[10px]
          ${
            active
              ? "bg-white/20 text-white"
              : "bg-slate-100 text-slate-500"
          }
        `}
      >
        {count}
      </span>
    </button>
  );
};

export default StatusTabButton;
import { AttemptsIcon, ExamIcon } from "./Icons";

import { cardWidthClasses } from "./cardStyles";

export const EmptyCard = ({ type }: { type: "available" | "attempts" }) => {
  return (
    <div className={cardWidthClasses}>
      <div
        className="
          flex
          h-[270px]
          items-center
          justify-center
          rounded-2xl
          border
          border-dashed
          border-purple-200
          bg-gradient-to-br
          from-purple-50/70
          via-white
          to-orange-50/50
          p-4
          text-center

          sm:h-[285px]
          md:h-[300px]
        "
      >
        <div>
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600 sm:h-12 sm:w-12">
            {type === "available" ? <ExamIcon /> : <AttemptsIcon />}
          </div>

          <p className="mt-3 text-[10px] font-bold text-slate-700 sm:text-xs">
            {type === "available" ? "No available exams" : "No recent attempts"}
          </p>

          <p className="mt-1 text-[8px] leading-4 text-slate-400 sm:text-[10px]">
            {type === "available"
              ? "New examinations will appear here."
              : "Your latest examination activity will appear here."}
          </p>
        </div>
      </div>
    </div>
  );
};

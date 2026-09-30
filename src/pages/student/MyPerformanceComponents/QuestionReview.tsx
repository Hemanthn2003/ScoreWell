import {
  CheckCircle2,
  Circle,
  XCircle,
} from "lucide-react";

import type {
  PerformanceQuestion,
} from "./types";

import {
  getLetter,
} from "./helpers";

interface QuestionReviewProps {
  question: PerformanceQuestion;
  number: number;
}

const QuestionReview = ({
  question,
  number,
}: QuestionReviewProps) => {
  const isUnanswered =
    question.selectedAnswers.length ===
    0;

  return (
    <div className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm">

      <div className="flex items-center justify-between gap-4 border-b border-purple-100 bg-purple-50/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-700 text-sm font-black text-white">
            {number}
          </div>

          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            {question.questionType ===
            "MULTI"
              ? "Multiple Choice"
              : "Single Choice"}
          </span>
        </div>

        {isUnanswered ? (
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Unanswered
          </span>
        ) : question.isCorrect ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
            <CheckCircle2
              size={13}
            />
            Correct
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-red-700">
            <XCircle size={13} />
            Wrong
          </span>
        )}
      </div>

      <div className="p-5 sm:p-6">

        <h3 className="text-sm font-bold leading-6 text-slate-900 sm:text-base">
          {question.question}
        </h3>

        <div className="mt-5 space-y-2.5">
          {question.options.map(
            (
              option,
              index
            ) => {
              const selected =
                question.selectedAnswers.includes(
                  option
                );

              const selectedCorrect =
                selected &&
                question.correctAnswers.includes(
                  option
                );

              let wrapper =
                "border-slate-200 bg-white text-slate-600";

              let letter =
                "bg-slate-100 text-slate-500";

              if (selected) {
                if (
                  selectedCorrect
                ) {
                  wrapper =
                    "border-emerald-300 bg-emerald-50 text-emerald-800";

                  letter =
                    "bg-emerald-100 text-emerald-700";
                } else {
                  wrapper =
                    "border-red-300 bg-red-50 text-red-800";

                  letter =
                    "bg-red-100 text-red-700";
                }
              }

              return (
                <div
                  key={`${question.questionId}-${index}`}
                  className={`rounded-2xl border p-3.5 transition ${wrapper}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black ${letter}`}
                    >
                      {getLetter(
                        index
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-6">
                        {option}
                      </p>

                      {selected && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          {selectedCorrect ? (
                            <>
                              <CheckCircle2
                                size={13}
                              />

                              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                                Your Answer • Correct
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle
                                size={13}
                              />

                              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                                Your Answer • Wrong
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {!selected && (
                      <Circle
                        size={17}
                        className="mt-1 shrink-0 text-slate-200"
                      />
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <span className="text-xs font-bold text-slate-500">
            Marks Awarded
          </span>

          <span
            className={`text-sm font-black ${
              question.marksAwarded > 0
                ? "text-emerald-600"
                : question.marksAwarded < 0
                ? "text-red-600"
                : "text-slate-700"
            }`}
          >
            {question.marksAwarded}
          </span>
        </div>

      </div>
    </div>
  );
};

export default QuestionReview;
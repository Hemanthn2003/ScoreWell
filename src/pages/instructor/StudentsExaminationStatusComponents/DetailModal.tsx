import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Percent,
  ShieldCheck,
  User,
  X,
  XCircle,
} from "lucide-react";

import type { ReactNode } from "react";

import type { AttemptDetails, AttemptQuestion } from "./types";

import { formatDateTime, formatDuration } from "./helpers";

import PercentageCircle from "./PercentageCircle";
import StatusBadge from "./StatusBadge";

interface DetailModalProps {
  data: AttemptDetails;
  onClose: () => void;
}

const DetailModal = ({ data, onClose }: DetailModalProps) => {
  const { student, exam, attempt, questions } = data;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative flex h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="shrink-0 border-b border-purple-100 bg-gradient-to-r from-purple-700 via-purple-600 to-orange-400 px-5 py-5 text-white sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-100">
                <ShieldCheck size={16} />

                <span className="text-xs font-bold uppercase tracking-wider">
                  Examination Details
                </span>
              </div>

              <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">
                {exam.name}
              </h2>

              <p className="mt-1 text-sm text-white/80">
                {student.name} • {student.email}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-7">
          {/* TOP INFORMATION */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DetailStat
              icon={<User size={17} />}
              label="Student"
              value={student.name}
            />

            <DetailStat
              icon={<ShieldCheck size={17} />}
              label="Exam Mode"
              value={exam.mode === "SPECIAL" ? "Private / Special" : "Common"}
            />

            <DetailStat
              icon={<CalendarDays size={17} />}
              label="Attended"
              value={formatDateTime(attempt.startTime)}
            />

            <DetailStat
              icon={<Clock3 size={17} />}
              label="Time Taken"
              value={formatDuration(attempt.timeTakenSeconds)}
            />
          </div>

          {/* RESULT SUMMARY */}
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto]">
            <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={attempt.status} />

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  Attempt {attempt.attemptNo}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricBox label="Questions" value={exam.questionCount} />

                <MetricBox label="Answered" value={attempt.answeredCount} />

                <MetricBox label="Correct" value={attempt.correctAnswers} />

                <MetricBox label="Wrong" value={attempt.wrongAnswers} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricBox label="Unanswered" value={attempt.unanswered} />

                <MetricBox label="Total Marks" value={attempt.totalMarks} />

                <MetricBox
                  label="Secured"
                  value={attempt.securedMarks}
                  highlight
                />

                <MetricBox
                  label="Percentage"
                  value={`${attempt.percentage.toFixed(1)}%`}
                  highlight
                />
              </div>
            </div>

            <div className="flex items-center justify-center rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
              <PercentageCircle percentage={attempt.percentage} size={150} />
            </div>
          </div>

          {/* EXAM INFORMATION */}
          <div className="mt-5 rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-base font-extrabold text-slate-900">
              Examination Information
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailStat
                icon={<BookOpen size={17} />}
                label="Department"
                value={exam.department}
              />

              <DetailStat
                icon={<Clock3 size={17} />}
                label="Exam Duration"
                value={`${exam.durationMinutes} minutes`}
              />

              <DetailStat
                icon={<Percent size={17} />}
                label="Marks / Question"
                value={String(exam.marksPerQuestion)}
              />

              <DetailStat
                icon={<CalendarDays size={17} />}
                label="Submitted"
                value={formatDateTime(attempt.submittedAt)}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-orange-500"
                />

                <div>
                  <p className="text-sm font-extrabold text-orange-800">
                    Negative Marking
                  </p>

                  {exam.negativeMarking.enabled ? (
                    <p className="mt-1 text-sm text-orange-700">
                      Enabled — {exam.negativeMarking.penalty} marks are
                      deducted for an incorrect answer.
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-orange-700">
                      Disabled — no negative marks are applied.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* QUESTIONS */}
          <div className="mt-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Question Review
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Review every question and the student's submitted answer.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">
                {questions.length} Questions
              </span>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <QuestionReview
                  key={question.questionId}
                  question={question}
                  number={index + 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailStat = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-purple-600">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-extrabold text-slate-800">
        {value}
      </p>
    </div>
  );
};

const MetricBox = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-extrabold ${
          highlight ? "text-purple-700" : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

const QuestionReview = ({
  question,
  number,
}: {
  question: AttemptQuestion;
  number: number;
}) => {
  const unanswered = question.selectedAnswers.length === 0;

  const correct = question.isCorrect;

  return (
    <div
      className={`
        overflow-hidden
        rounded-3xl
        border
        bg-white
        shadow-sm
        ${
          unanswered
            ? "border-slate-200"
            : correct
              ? "border-emerald-200"
              : "border-red-200"
        }
      `}
    >
      {/* QUESTION HEADER */}
      <div
        className={`
          flex
          items-center
          justify-between
          gap-4
          border-b
          px-5
          py-4
          ${
            unanswered
              ? "border-slate-100 bg-slate-50"
              : correct
                ? "border-emerald-100 bg-emerald-50/60"
                : "border-red-100 bg-red-50/60"
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div
            className={`
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-sm
              font-extrabold
              ${
                unanswered
                  ? "bg-slate-200 text-slate-600"
                  : correct
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
              }
            `}
          >
            {number}
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {question.questionType === "MULTI"
              ? "Multiple Choice"
              : "Single Choice"}
          </span>
        </div>

        {unanswered ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600">
            <AlertCircle size={13} />
            Unanswered
          </span>
        ) : correct ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 size={13} />
            Correct
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
            <XCircle size={13} />
            Wrong
          </span>
        )}
      </div>

      {/* QUESTION BODY */}
      <div className="p-5">
        <p className="text-sm font-bold leading-6 text-slate-900 sm:text-base">
          {question.question}
        </p>

        <div className="mt-5 space-y-2">
          {question.options.map((option, optionIndex) => {
            const selected = question.selectedAnswers.includes(option);

            /*
                IMPORTANT:
                Only the student's selected
                option receives a result color.

                Correct but unselected options
                remain neutral.
              */
            const selectedIsCorrect =
              selected && question.correctAnswers.includes(option);

            let containerStyle = "border-slate-200 bg-white text-slate-600";

            let letterStyle = "bg-slate-100 text-slate-500";

            if (selected) {
              if (selectedIsCorrect) {
                containerStyle =
                  "border-emerald-300 bg-emerald-50 text-emerald-800";

                letterStyle = "bg-emerald-100 text-emerald-700";
              } else {
                containerStyle = "border-red-300 bg-red-50 text-red-800";

                letterStyle = "bg-red-100 text-red-700";
              }
            }

            return (
              <div
                key={`${question.questionId}-${optionIndex}`}
                className={`rounded-xl border p-3 transition ${containerStyle}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${letterStyle}`}
                  >
                    {String.fromCharCode(65 + optionIndex)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{option}</p>

                    {selected && (
                      <div className="mt-1 flex items-center gap-1.5">
                        {selectedIsCorrect ? (
                          <>
                            <CheckCircle2 size={12} />

                            <span className="text-[10px] font-extrabold uppercase tracking-wider">
                              Student Answer • Correct
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />

                            <span className="text-[10px] font-extrabold uppercase tracking-wider">
                              Student Answer • Wrong
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MARKS */}
        <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <span className="text-xs font-bold text-slate-500">
            Marks Awarded
          </span>

          <span
            className={`
              text-sm
              font-extrabold
              ${
                question.marksAwarded > 0
                  ? "text-emerald-600"
                  : question.marksAwarded < 0
                    ? "text-red-600"
                    : "text-slate-700"
              }
            `}
          >
            {question.marksAwarded}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;

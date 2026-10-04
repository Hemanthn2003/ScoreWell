import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileQuestion,
  ShieldCheck,
  User,
  X,
  XCircle,
} from "lucide-react";

import type { PerformanceAttempt } from "./types";

import { formatDateTime, formatDuration } from "./helpers";

import ExamTypeBadge from "./ExamTypeBadge";
import QuestionReview from "./QuestionReview";

interface PerformanceDetailModalProps {
  item: PerformanceAttempt;
  onClose: () => void;
}

const PerformanceDetailModal = ({
  item,
  onClose,
}: PerformanceDetailModalProps) => {
  const { exam, attempt } = item;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="shrink-0 bg-gradient-to-r from-purple-800 via-purple-700 to-orange-500 px-5 py-5 text-white sm:px-7">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-purple-100">
                <ShieldCheck size={16} />

                <span className="text-[10px] font-extrabold uppercase tracking-[0.18em]">
                  My Examination Performance
                </span>
              </div>

              <h2 className="mt-2 text-xl font-black sm:text-2xl">
                {exam.title}
              </h2>

              <div className="mt-3">
                <ExamTypeBadge type={exam.examType} mode={exam.examMode} />
              </div>
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
          {/* EXAM DETAILS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoBox
              icon={<User size={17} />}
              label="Student"
              value="My Performance"
            />

            <InfoBox
              icon={<FileQuestion size={17} />}
              label="Questions"
              value={String(exam.questionCount)}
            />

            <InfoBox
              icon={<Clock3 size={17} />}
              label="Duration"
              value={`${exam.durationMinutes} minutes`}
            />

            <InfoBox
              icon={<CalendarDays size={17} />}
              label="Submitted"
              value={formatDateTime(attempt.submittedAt)}
            />
          </div>

          {/* PERFORMANCE */}
          <div className="mt-5 rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-600">
                  Your Result
                </p>

                <h3 className="mt-2 text-2xl font-black text-slate-900">
                  {attempt.score}{" "}
                  <span className="text-slate-400">/ {attempt.totalMarks}</span>
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {attempt.percentage.toFixed(1)}% overall performance
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <ResultMetric
                  icon={<CheckCircle2 size={17} />}
                  label="Correct"
                  value={attempt.correctAnswers}
                />

                <ResultMetric
                  icon={<XCircle size={17} />}
                  label="Wrong"
                  value={attempt.wrongAnswers}
                />

                <ResultMetric
                  icon={<AlertCircle size={17} />}
                  label="Unanswered"
                  value={attempt.unanswered}
                />

                <ResultMetric
                  icon={<Clock3 size={17} />}
                  label="Time Taken"
                  value={formatDuration(attempt.timeTakenSeconds)}
                />
              </div>
            </div>
          </div>

          {/* EXAM CONFIGURATION */}
          <div className="mt-5 rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-base font-black text-slate-900">
              Examination Configuration
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ConfigBox label="Department" value={exam.department} />

              <ConfigBox
                label="Exam Type"
                value={
                  exam.examType === "SPECIAL" ? "Special Exam" : "Common Exam"
                }
              />

              <ConfigBox
                label="Exam Mode"
                value={
                  exam.examMode === "STRICT" ? "Strict Mode" : "Normal Mode"
                }
              />

              <ConfigBox
                label="Attempt"
                value={`Attempt ${attempt.attemptNo}`}
              />

              <ConfigBox
                label="Marks / Question"
                value={String(exam.marksPerQuestion)}
              />

              <ConfigBox
                label="Negative Marking"
                value={
                  exam.negativeMarking.enabled
                    ? `Enabled (-${exam.negativeMarking.penalty})`
                    : "Disabled"
                }
              />

              <ConfigBox
                label="Start Time"
                value={formatDateTime(attempt.startTime)}
              />

              <ConfigBox
                label="Submission Time"
                value={formatDateTime(attempt.submittedAt)}
              />
            </div>
          </div>

          {/* QUESTIONS */}
          <div className="mt-7">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-600">
                Answer Review
              </p>

              <h3 className="mt-1 text-xl font-black text-slate-900">
                Questions & Your Answers
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Only the options selected by you are highlighted as correct or
                incorrect.
              </p>
            </div>

            <div className="space-y-5">
              {attempt.questions.map((question, index) => (
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

const InfoBox = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-purple-600">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-black text-slate-800">{value}</p>
    </div>
  );
};

const ResultMetric = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-1.5 text-purple-600">
        {icon}

        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
    </div>
  );
};

const ConfigBox = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 text-xs font-extrabold text-slate-700">{value}</p>
    </div>
  );
};

export default PerformanceDetailModal;

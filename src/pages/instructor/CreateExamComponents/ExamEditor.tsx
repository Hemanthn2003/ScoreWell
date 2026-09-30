import { CalendarClock, CalendarDays, ShieldCheck, Timer } from "lucide-react";

import type { Exam, ExamMode, QuestionSet, Student, User } from "./types";

export interface ExamEditorProps {
  user: User | null;
  editingExam: Exam | null;
  error: string;
  success: string;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  durationMinutes: number;
  setDurationMinutes: (value: number) => void;
  marksPerQuestion: number;
  setMarksPerQuestion: (value: number) => void;
  questionSets: QuestionSet[];
  setShowQuestionSetCreator: (value: boolean) => void;
  selectedQuestionSetIds: string[];
  toggleQuestionSet: (id: string) => void;
  maxQuestionCount: number;
  questionCount: number;
  setQuestionCount: (value: number) => void;
  mode: ExamMode;
  setMode: (value: ExamMode) => void;
  students: Student[];
  selectedStudentIds: string[];
  toggleStudent: (id: string) => void;
  maxAttempts: number;
  setMaxAttempts: (value: number) => void;
  negativeMarkingEnabled: boolean;
  setNegativeMarkingEnabled: (value: boolean) => void;
  negativePenalty: number;
  setNegativePenalty: (value: number) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  deadlineDate: string;
  setDeadlineDate: (value: string) => void;
  strictMode: boolean;
  setStrictMode: (value: boolean) => void;
  strictAttemptChances: number;
  setStrictAttemptChances: (value: number) => void;
  strictDeadlineDate: string;
  setStrictDeadlineDate: (value: string) => void;
  saving: boolean;
  saveExam: () => void;
  onBack: () => void;
}

const ExamEditor = (props: ExamEditorProps) => {
  const {
    user,
    editingExam,
    error,
    success,
    title,
    setTitle,
    description,
    setDescription,
    durationMinutes,
    setDurationMinutes,
    marksPerQuestion,
    setMarksPerQuestion,
    questionSets,
    setShowQuestionSetCreator,
    selectedQuestionSetIds,
    toggleQuestionSet,
    maxQuestionCount,
    questionCount,
    setQuestionCount,
    mode,
    setMode,
    students,
    selectedStudentIds,
    toggleStudent,
    maxAttempts,
    setMaxAttempts,
    negativeMarkingEnabled,
    setNegativeMarkingEnabled,
    negativePenalty,
    setNegativePenalty,
    startDate,
    setStartDate,
    deadlineDate,
    setDeadlineDate,
    strictMode,
    setStrictMode,
    strictAttemptChances,
    setStrictAttemptChances,
    strictDeadlineDate,
    setStrictDeadlineDate,
    saving,
    saveExam,
    onBack,
  } = props;

    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xl shadow-purple-100/40 sm:p-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
                Instructor
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                {editingExam
                  ? "Edit Exam"
                  : "Create New Exam"}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Configure the complete examination.
              </p>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-50"
            >
              Back to Exams
            </button>

          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-600">
              {success}
            </div>
          )}

          {/* =================================================
              BASIC DETAILS
          ================================================= */}

          <div className="mt-7 grid gap-5 md:grid-cols-2">

            <div className="md:col-span-2">

              <label className="text-sm font-bold text-slate-700">
                Exam Name
              </label>

              <input
                value={title}
                onChange={(
                  event
                ) =>
                  setTitle(
                    event.target
                      .value
                  )
                }
                placeholder="Example: JavaScript Fundamentals Assessment"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
              />

            </div>

            <div className="md:col-span-2">

              <label className="text-sm font-bold text-slate-700">
                Description
              </label>

              <textarea
                value={
                  description
                }
                onChange={(
                  event
                ) =>
                  setDescription(
                    event.target
                      .value
                  )
                }
                rows={3}
                placeholder="Describe this examination..."
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
              />

            </div>

            <div>

              <label className="text-sm font-bold text-slate-700">
                Duration (Minutes)
              </label>

              <input
                type="number"
                min={1}
                value={
                  durationMinutes
                }
                onChange={(
                  event
                ) =>
                  setDurationMinutes(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
              />

            </div>

            <div>

              <label className="text-sm font-bold text-slate-700">
                Marks Per Question
              </label>

              <input
                type="number"
                min={0}
                step="0.5"
                value={
                  marksPerQuestion
                }
                onChange={(
                  event
                ) =>
                  setMarksPerQuestion(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
              />

            </div>

          </div>

          {/* =================================================
              QUESTION SETS
          ================================================= */}

          <div className="mt-8 rounded-2xl border border-purple-100 bg-purple-50/40 p-5">

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Question Sets
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Published question sets from your department.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowQuestionSetCreator(
                    true
                  )
                }
                className="rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                + Create New Question Set
              </button>

            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">

              {questionSets.length ===
                0 && (
                <div className="md:col-span-2 rounded-xl border border-dashed border-purple-200 bg-white p-6 text-center text-sm text-slate-500">
                  No published question sets are available for your department.
                </div>
              )}

              {questionSets.map(
                (
                  questionSet
                ) => {
                  const selected =
                    selectedQuestionSetIds.includes(
                      questionSet._id
                    );

                  return (
                    <button
                      type="button"
                      key={
                        questionSet._id
                      }
                      onClick={() =>
                        toggleQuestionSet(
                          questionSet._id
                        )
                      }
                      className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                        selected
                          ? "border-purple-500 bg-white shadow-lg shadow-purple-100"
                          : "border-slate-200 bg-white hover:border-purple-300"
                      }`}
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <h3 className="font-bold text-slate-900">
                            {
                              questionSet.questionSetName
                            }
                          </h3>

                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {
                              questionSet.department
                            }
                          </p>

                          <p className="mt-2 text-xs font-bold text-purple-600">
                            {
                              questionSet.questions.length
                            }{" "}
                            Questions
                          </p>
                        </div>

                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                            selected
                              ? "border-purple-600 bg-purple-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {selected
                            ? "✓"
                            : ""}
                        </div>

                      </div>

                    </button>
                  );
                }
              )}

            </div>

            <div className="mt-5 rounded-xl bg-white p-4">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-bold text-slate-700">
                    Total Available Questions
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Questions are combined across all selected sets.
                  </p>
                </div>

                <span className="rounded-full bg-purple-100 px-4 py-2 text-lg font-black text-purple-700">
                  {
                    maxQuestionCount
                  }
                </span>

              </div>

              <div className="mt-4">

                <label className="text-sm font-bold text-slate-700">
                  Question Count
                </label>

                <input
                  type="number"
                  min={1}
                  max={
                    Math.max(
                      1,
                      maxQuestionCount
                    )
                  }
                  disabled={
                    maxQuestionCount ===
                    0
                  }
                  value={
                    questionCount
                  }
                  onChange={(
                    event
                  ) =>
                    setQuestionCount(
                      Math.min(
                        Math.max(
                          1,
                          Number(
                            event
                              .target
                              .value
                          )
                        ),
                        Math.max(
                          1,
                          maxQuestionCount
                        )
                      )
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                />

                <p className="mt-2 text-xs font-semibold text-orange-600">
                  Questions will be randomly selected from all selected question sets.
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              EXAM MODE
          ================================================= */}

          <div className="mt-8 rounded-2xl border border-orange-100 bg-orange-50/40 p-5">

            <h2 className="text-lg font-bold text-slate-900">
              Examination Mode
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose who can attend this examination.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">

              <button
                type="button"
                onClick={() =>
                  setMode(
                    "COMMON"
                  )
                }
                className={`rounded-2xl border p-5 text-left transition ${
                  mode ===
                  "COMMON"
                    ? "border-purple-500 bg-white shadow-lg shadow-purple-100"
                    : "border-slate-200 bg-white hover:border-purple-300"
                }`}
              >

                <p className="font-bold text-slate-900">
                  Common Exam
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Every permitted student from the department can attend the published examination.
                </p>

              </button>

              <button
                type="button"
                onClick={() =>
                  setMode(
                    "SPECIAL"
                  )
                }
                className={`rounded-2xl border p-5 text-left transition ${
                  mode ===
                  "SPECIAL"
                    ? "border-orange-500 bg-white shadow-lg shadow-orange-100"
                    : "border-slate-200 bg-white hover:border-orange-300"
                }`}
              >

                <p className="font-bold text-slate-900">
                  Selected Students
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Only selected students from your department can attend.
                </p>

              </button>

            </div>

            {mode ===
              "SPECIAL" && (
              <div className="mt-5">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="font-bold text-slate-800">
                      Select Students
                    </p>

                    <p className="text-xs text-slate-500">
                      {user?.department}
                    </p>
                  </div>

                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                    {
                      selectedStudentIds.length
                    }{" "}
                    Selected
                  </span>

                </div>

                <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3">

                  {students.length ===
                    0 && (
                    <p className="p-4 text-center text-sm text-slate-500">
                      No permitted students found in your department.
                    </p>
                  )}

                  {students.map(
                    (
                      student
                    ) => {
                      const selected =
                        selectedStudentIds.includes(
                          student._id
                        );

                      return (
                        <button
                          type="button"
                          key={
                            student._id
                          }
                          onClick={() =>
                            toggleStudent(
                              student._id
                            )
                          }
                          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                            selected
                              ? "border-orange-300 bg-orange-50"
                              : "border-transparent hover:bg-slate-50"
                          }`}
                        >

                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              selected
                                ? "border-orange-500 bg-orange-500 text-white"
                                : "border-slate-300"
                            }`}
                          >
                            {selected
                              ? "✓"
                              : ""}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800">
                              {
                                student.name
                              }
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {
                                student.email
                              }
                            </p>
                          </div>

                        </button>
                      );
                    }
                  )}

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              ATTEMPTS + NEGATIVE MARKING
          ================================================= */}

          <div className="mt-8 grid gap-5 md:grid-cols-2">

            <div className="rounded-2xl border border-slate-200 bg-white p-5">

              <label className="text-sm font-bold text-slate-700">
                Maximum Attempt Count
              </label>

              <input
                type="number"
                min={1}
                value={
                  maxAttempts
                }
                onChange={(
                  event
                ) =>
                  setMaxAttempts(
                    Math.max(
                      1,
                      Number(
                        event
                          .target
                          .value
                      )
                    )
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
              />

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-bold text-slate-700">
                    Negative Marking
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Apply penalty for incorrect answers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNegativeMarkingEnabled(
                      !negativeMarkingEnabled
                    )
                  }
                  className={`relative h-7 w-12 rounded-full transition ${
                    negativeMarkingEnabled
                      ? "bg-purple-600"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                      negativeMarkingEnabled
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>

              </div>

              {negativeMarkingEnabled && (
                <div className="mt-4">

                  <label className="text-xs font-bold text-slate-600">
                    Penalty
                  </label>

                  <input
                    type="number"
                    min={0}
                    step="0.25"
                    value={
                      negativePenalty
                    }
                    onChange={(
                      event
                    ) =>
                      setNegativePenalty(
                        Math.max(
                          0,
                          Number(
                            event
                              .target
                              .value
                          )
                        )
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-400"
                  />

                </div>
              )}

            </div>

          </div>

          {/* =================================================
              EXAM SCHEDULE
          ================================================= */}

          <div className="mt-8 overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-orange-50 p-5 shadow-lg shadow-purple-100/30">
            <div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-orange-500 text-white shadow-lg shadow-purple-200"><CalendarClock size={21} /></div><div><p className="text-base font-black text-slate-900">Exam Schedule</p><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">Set when the exam should become available and when it should expire. Leave the start date empty for manual publication; publishing manually will automatically record that moment as the start time.</p></div></div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"><label className="text-sm font-bold text-slate-700">Start Date & Time</label><p className="mt-1 text-xs text-slate-500">The exam automatically publishes at this time when it is scheduled.</p><div className="relative mt-3"><CalendarDays size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-purple-600" /><input type="datetime-local" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-11 font-semibold text-slate-700 outline-none transition [color-scheme:light] focus:border-purple-400 focus:ring-4 focus:ring-purple-100" /></div></div>
              <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"><label className="text-sm font-bold text-slate-700">Deadline Date & Time</label><p className="mt-1 text-xs text-slate-500">The exam automatically changes to Expired when this exact time arrives.</p><div className="relative mt-3"><Timer size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" /><input type="datetime-local" value={deadlineDate} onChange={(event) => setDeadlineDate(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-11 font-semibold text-slate-700 outline-none transition [color-scheme:light] focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></div></div>
            </div>
          </div>

          {/* =================================================
              EXAM STRICT MODE
          ================================================= */}

          <div className={`mt-8 overflow-hidden rounded-2xl border p-5 transition ${
            strictMode
              ? "border-purple-200 bg-gradient-to-br from-purple-50 via-white to-orange-50 shadow-lg shadow-purple-100/50"
              : "border-slate-200 bg-white"
          }`}>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-3">

                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  strictMode
                    ? "bg-gradient-to-br from-purple-600 to-orange-500 text-white shadow-lg shadow-purple-200"
                    : "bg-purple-50 text-purple-600"
                }`}>
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <p className="text-base font-black text-slate-900">
                    Exam Strict Mode
                  </p>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                    Control how many times a student can attempt this examination and set the final date by which the examination must be completed.
                  </p>
                </div>

              </div>

              <button
                type="button"
                aria-pressed={strictMode}
                onClick={() => setStrictMode(!strictMode)}
                className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                  strictMode
                    ? "bg-gradient-to-r from-purple-600 to-orange-500"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition ${
                    strictMode ? "left-7" : "left-1"
                  }`}
                />
              </button>

            </div>

            {strictMode && (
              <div className="mt-5 grid gap-5 md:grid-cols-2">

                <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                  <label className="text-sm font-bold text-slate-700">
                    Strict Mode Attempt Chances
                  </label>

                  <p className="mt-1 text-xs text-slate-500">
                    Maximum number of attempts permitted under strict mode.
                  </p>

                  <input
                    type="number"
                    min={1}
                    value={strictAttemptChances}
                    onChange={(event) =>
                      setStrictAttemptChances(
                        Math.max(1, Number(event.target.value))
                      )
                    }
                    className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                  />
                </div>

                <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                  <label className="text-sm font-bold text-slate-700">
                    Deadline Date
                  </label>

                  <p className="mt-1 text-xs text-slate-500">
                    Students must complete the examination on or before this date.
                  </p>

                  <div className="relative mt-3">
                    <CalendarDays
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-purple-600"
                    />

                    <input
                      type="date"
                      value={strictDeadlineDate}
                      min={(() => {
                        const today = new Date();
                        const year = today.getFullYear();
                        const month = String(
                          today.getMonth() + 1
                        ).padStart(2, "0");
                        const day = String(
                          today.getDate()
                        ).padStart(2, "0");
                        return `${year}-${month}-${day}`;
                      })()}
                      onChange={(event) =>
                        setStrictDeadlineDate(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-11 font-semibold text-slate-700 outline-none transition [color-scheme:light] focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              SAVE
          ================================================= */}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={
                saveExam
              }
              className="rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {saving
                ? "Saving Exam..."
                : editingExam
                ? "Update Exam"
                : "Create Exam"}
            </button>

          </div>

        </div>

      </div>
    );
};

export default ExamEditor;

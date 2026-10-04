import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from "react";
import {
  BookOpen,
  Check,
  Edit3,
  FileText,
  FileUp,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { Question, QuestionType } from "./types";
import { createEmptyQuestion } from "./helpers";

export interface QuestionSetEditorProps {
  editingSetId: string | null;
  questionSetName: string;
  setQuestionSetName: (value: string) => void;
  currentQuestion: Question;
  questions: Question[];
  editingQuestionIndex: number | null;
  setEditingQuestionIndex: (value: number | null) => void;
  setCurrentQuestion: Dispatch<SetStateAction<Question>>;
  isImportingPdf: boolean;
  pdfInputRef: RefObject<HTMLInputElement | null>;
  handlePdfImport: (event: ChangeEvent<HTMLInputElement>) => void;
  handleQuestionChange: (value: string) => void;
  handleAddOption: () => void;
  handleOptionChange: (index: number, value: string) => void;
  handleRemoveOption: (index: number) => void;
  handleQuestionTypeChange: (type: QuestionType) => void;
  handleAnswerChange: (option: string) => void;
  handleAddNextQuestion: () => void;
  handleMarkAsDone: () => void;
  handleEditQuestion: (index: number) => void;
  handleDeleteQuestion: (index: number) => void;
  isSaving: boolean;
  resetEditor: () => void;
}

const QuestionSetEditor = ({
  editingSetId,
  questionSetName,
  setQuestionSetName,
  currentQuestion,
  questions,
  editingQuestionIndex,
  setEditingQuestionIndex,
  setCurrentQuestion,
  isImportingPdf,
  pdfInputRef,
  handlePdfImport,
  handleQuestionChange,
  handleAddOption,
  handleOptionChange,
  handleRemoveOption,
  handleQuestionTypeChange,
  handleAnswerChange,
  handleAddNextQuestion,
  handleMarkAsDone,
  handleEditQuestion,
  handleDeleteQuestion,
  isSaving,
  resetEditor,
}: QuestionSetEditorProps) => (
  <section className="mt-6 overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-xl shadow-purple-100/50">
    {/* EDITOR HEADER */}

    <div className="border-b border-purple-100 bg-gradient-to-r from-purple-50 via-white to-orange-50 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-500">
            {editingSetId ? "Edit Question Set" : "New Question Set"}
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-900">
            {editingSetId
              ? "Update your question bank"
              : "Create a question bank"}
          </h2>
        </div>

        <button
          type="button"
          onClick={resetEditor}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm font-bold text-purple-700 transition hover:-translate-y-0.5 hover:bg-purple-50"
        >
          <X size={17} />
          Close
        </button>
      </div>

      {/* QUESTION SET NAME */}

      <div className="mt-6">
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Question Set Name
        </label>

        <input
          type="text"
          value={questionSetName}
          onChange={(event) => setQuestionSetName(event.target.value)}
          placeholder="Example: JavaScript Fundamentals"
          className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
        />

        <p className="mt-2 text-xs text-slate-400">
          Department and instructor ID will be automatically stored from your
          instructor account.
        </p>
      </div>

      {/* PDF IMPORT */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 via-white to-purple-50 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-purple-700 text-white shadow-lg shadow-orange-100">
              <FileText size={21} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-black text-slate-900">
                  Import Questions from PDF
                </h3>
                <span className="rounded-full bg-purple-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-purple-700">
                  Smart Import
                </span>
              </div>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                Upload a text-based MCQ PDF. ScoreWell will read the questions,
                four options and correct answers, then detect SINGLE or MULTI
                automatically. You can review and edit everything before saving.
              </p>

              <p className="mt-1 text-[11px] font-semibold text-slate-400">
                Supported pattern: Question → A/B/C/D options → Correct Answer.
                Maximum 10 MB.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handlePdfImport}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              disabled={isImportingPdf}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 to-purple-900 px-4 py-3 text-xs font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:from-purple-800 hover:to-purple-950 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isImportingPdf ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <FileUp size={17} />
              )}
              {isImportingPdf ? "Reading PDF..." : "Choose PDF"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-purple-100 bg-white/80 px-3 py-2.5 text-[11px] font-semibold text-purple-700">
          <Sparkles size={14} className="shrink-0 text-orange-500" />
          Imported questions appear in the Question Bank on the right, where you
          can edit or delete them before saving.
        </div>
      </div>
    </div>

    {/* QUESTION CREATOR */}

    <div className="grid gap-6 p-5 lg:grid-cols-[1.2fr_0.8fr] sm:p-6">
      {/* LEFT */}

      <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-purple-500">
              {editingQuestionIndex !== null
                ? `Editing Question ${editingQuestionIndex + 1}`
                : "Question Editor"}
            </p>

            <h3 className="mt-1 text-lg font-black text-slate-900">
              {editingQuestionIndex !== null
                ? "Update Question"
                : "Add Question"}
            </h3>
          </div>

          {editingQuestionIndex !== null && (
            <button
              type="button"
              onClick={() => {
                setEditingQuestionIndex(null);

                setCurrentQuestion(createEmptyQuestion());
              }}
              className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-white"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* QUESTION */}

        <div className="mt-5">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Question
          </label>

          <textarea
            value={currentQuestion.question}
            onChange={(event) => handleQuestionChange(event.target.value)}
            rows={4}
            placeholder="Enter the examination question..."
            className="w-full resize-none rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
          />
        </div>

        {/* OPTIONS */}

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-700">Options</label>

            <button
              type="button"
              onClick={handleAddOption}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-purple-800"
            >
              <Plus size={15} />
              Add Option
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = currentQuestion.answer.includes(option);

              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 rounded-xl border p-2 transition ${
                    isCorrect
                      ? "border-green-300 bg-green-50"
                      : "border-purple-100 bg-white"
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-xs font-black text-purple-700">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <input
                    type="text"
                    value={option}
                    onChange={(event) =>
                      handleOptionChange(index, event.target.value)
                    }
                    placeholder={`Option ${index + 1}`}
                    className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm font-medium text-slate-900 outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    disabled={currentQuestion.options.length <= 2}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* QUESTION TYPE */}

        <div className="mt-6">
          <p className="mb-3 text-sm font-bold text-slate-700">Question Type</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleQuestionTypeChange("SINGLE")}
              className={`rounded-xl border p-4 text-left transition ${
                currentQuestion.questionType === "SINGLE"
                  ? "border-purple-400 bg-purple-100 shadow-sm"
                  : "border-purple-100 bg-white hover:border-purple-300"
              }`}
            >
              <p className="text-sm font-black text-purple-800">
                Single Answer
              </p>

              <p className="mt-1 text-xs text-purple-600">
                Choose exactly one correct answer.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleQuestionTypeChange("MULTI")}
              className={`rounded-xl border p-4 text-left transition ${
                currentQuestion.questionType === "MULTI"
                  ? "border-orange-400 bg-orange-100 shadow-sm"
                  : "border-orange-100 bg-white hover:border-orange-300"
              }`}
            >
              <p className="text-sm font-black text-orange-800">
                Multiple Answer
              </p>

              <p className="mt-1 text-xs text-orange-600">
                Choose one or more correct answers.
              </p>
            </button>
          </div>
        </div>

        {/* CORRECT ANSWERS */}

        <div className="mt-6">
          <p className="mb-3 text-sm font-bold text-slate-700">
            Select Correct Answer
          </p>

          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => {
              if (!option.trim()) {
                return null;
              }

              const selected = currentQuestion.answer.includes(option);

              return (
                <label
                  key={index}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                    selected
                      ? "border-green-300 bg-green-50"
                      : "border-slate-100 bg-white hover:border-purple-200"
                  }`}
                >
                  <input
                    type={
                      currentQuestion.questionType === "SINGLE"
                        ? "radio"
                        : "checkbox"
                    }
                    name="correct-answer"
                    checked={selected}
                    onChange={() => handleAnswerChange(option)}
                    className="h-4 w-4 accent-purple-700"
                  />

                  <span className="flex-1 text-sm font-semibold text-slate-700">
                    {option}
                  </span>

                  {selected && <Check size={17} className="text-green-600" />}
                </label>
              );
            })}
          </div>
        </div>

        {/* QUESTION ACTION */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleAddNextQuestion}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 py-3 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-purple-800"
          >
            <Plus size={18} />

            {editingQuestionIndex !== null
              ? "Update Question"
              : "Add Next Question"}
          </button>

          <button
            type="button"
            onClick={handleMarkAsDone}
            disabled={isSaving}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Mark as Done
          </button>
        </div>
      </div>

      {/* RIGHT - ADDED QUESTIONS */}

      <div className="rounded-2xl border border-orange-100 bg-orange-50/30 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
              Question Bank
            </p>

            <h3 className="mt-1 text-lg font-black text-slate-900">
              Added Questions
            </h3>
          </div>

          <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-orange-100 px-3 text-sm font-black text-orange-700">
            {questions.length}
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-orange-200 bg-white p-8 text-center">
            <BookOpen size={30} className="mx-auto text-orange-300" />

            <p className="mt-3 text-sm font-bold text-slate-700">
              No questions added yet.
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Complete the question on the left and click Add Next Question.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {questions.map((question, index) => (
              <div
                key={question._id || index}
                className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-xs font-black text-purple-700">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold leading-5 text-slate-800">
                      {question.question}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-700">
                        {question.questionType}
                      </span>

                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">
                        {question.answer.length} correct
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditQuestion(index)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-purple-200 px-3 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-50"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(index)}
                    className="inline-flex items-center justify-center rounded-lg border border-red-100 px-3 py-2 text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </section>
);

export default QuestionSetEditor;

import { useState } from "react";

import type { Question, QuestionSet, QuestionType } from "./types";
import { emptyQuestion } from "./helpers";

interface InlineQuestionSetCreatorProps {
  onDone: (questionSet: QuestionSet) => void;
  onCancel: () => void;
}

export const InlineQuestionSetCreator = ({
  onDone,
  onCancel,
}: InlineQuestionSetCreatorProps) => {
  const [questionSetName, setQuestionSetName] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);

  const [currentQuestion, setCurrentQuestion] =
    useState<Question>(emptyQuestion());

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const addOption = () => {
    setCurrentQuestion((previous) => ({
      ...previous,

      options: [...previous.options, ""],
    }));
  };

  const removeOption = (index: number) => {
    if (currentQuestion.options.length <= 2) {
      return;
    }

    const removed = currentQuestion.options[index];

    setCurrentQuestion((previous) => ({
      ...previous,

      options: previous.options.filter((_, i) => i !== index),

      answer: previous.answer.filter((answer) => answer !== removed),
    }));
  };

  const updateOption = (index: number, value: string) => {
    const oldValue = currentQuestion.options[index];

    setCurrentQuestion((previous) => ({
      ...previous,

      options: previous.options.map((option, i) =>
        i === index ? value : option,
      ),

      answer: previous.answer.map((answer) =>
        answer === oldValue ? value : answer,
      ),
    }));
  };

  const toggleAnswer = (option: string) => {
    if (currentQuestion.questionType === "SINGLE") {
      setCurrentQuestion((previous) => ({
        ...previous,
        answer: [option],
      }));

      return;
    }

    setCurrentQuestion((previous) => ({
      ...previous,

      answer: previous.answer.includes(option)
        ? previous.answer.filter((answer) => answer !== option)
        : [...previous.answer, option],
    }));
  };

  const saveCurrentQuestion = () => {
    const cleanOptions = currentQuestion.options
      .map((option) => option.trim())
      .filter(Boolean);

    if (!currentQuestion.question.trim()) {
      setError("Question cannot be empty.");

      return;
    }

    if (cleanOptions.length < 2) {
      setError("Add at least two options.");

      return;
    }

    if (currentQuestion.answer.length === 0) {
      setError("Select the correct answer.");

      return;
    }

    if (
      currentQuestion.questionType === "SINGLE" &&
      currentQuestion.answer.length !== 1
    ) {
      setError("SINGLE questions can have only one correct answer.");

      return;
    }

    const cleanQuestion: Question = {
      ...currentQuestion,

      question: currentQuestion.question.trim(),

      options: cleanOptions,
    };

    if (editingIndex !== null) {
      setQuestions((previous) =>
        previous.map((question, index) =>
          index === editingIndex ? cleanQuestion : question,
        ),
      );
    } else {
      setQuestions((previous) => [...previous, cleanQuestion]);
    }

    setCurrentQuestion(emptyQuestion());

    setEditingIndex(null);

    setError("");
  };

  const editQuestion = (index: number) => {
    setCurrentQuestion(questions[index]);

    setEditingIndex(index);

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteQuestion = (index: number) => {
    setQuestions((previous) => previous.filter((_, i) => i !== index));
  };

  const markAsDone = async () => {
    if (!questionSetName.trim()) {
      setError("Question set name is required.");

      return;
    }

    if (questions.length === 0) {
      setError("Add at least one question.");

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/question-sets", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          questionSetName: questionSetName.trim(),

          questions: questions.map((question) => ({
            ...question,
            _id: undefined,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create question set.");
      }

      /*
       * Automatically published
       * for use immediately in
       * this exam.
       */
      const created = data.questionSet;

      const publishResponse = await fetch(
        `http://localhost:5000/api/question-sets/${created._id}/publish`,
        {
          method: "PATCH",

          credentials: "include",
        },
      );

      const publishedData = await publishResponse.json();

      if (!publishResponse.ok) {
        throw new Error(
          publishedData.message ||
            "Question set was created but could not be published.",
        );
      }

      onDone(publishedData.questionSet);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xl shadow-purple-100/50 sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
            Question Set
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Create New Question Set
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            This question set will be published automatically for this exam.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
        >
          Back to Exam
        </button>
      </div>

      <div className="mt-6">
        <label className="text-sm font-bold text-slate-700">
          Question Set Name
        </label>

        <input
          value={questionSetName}
          onChange={(event) => setQuestionSetName(event.target.value)}
          placeholder="Example: CSE - JavaScript Fundamentals"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-purple-100 bg-purple-50/40 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Question</h3>

          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
            {editingIndex !== null
              ? `Editing #${editingIndex + 1}`
              : "New Question"}
          </span>
        </div>

        <textarea
          value={currentQuestion.question}
          onChange={(event) =>
            setCurrentQuestion((previous) => ({
              ...previous,
              question: event.target.value,
            }))
          }
          placeholder="Enter your question..."
          rows={3}
          className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
        />

        <div className="mt-5 space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleAnswer(option)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  currentQuestion.answer.includes(option)
                    ? "border-purple-600 bg-purple-600 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {currentQuestion.answer.includes(option) ? "✓" : ""}
              </button>

              <input
                value={option}
                onChange={(event) => updateOption(index, event.target.value)}
                placeholder={`Option ${index + 1}`}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-purple-400"
              />

              <button
                type="button"
                onClick={() => removeOption(index)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addOption}
          className="mt-4 rounded-xl border border-dashed border-purple-300 px-4 py-2 text-sm font-bold text-purple-700 hover:bg-purple-50"
        >
          + Add Option
        </button>

        <div className="mt-5">
          <p className="text-sm font-bold text-slate-700">Question Type</p>

          <div className="mt-2 flex gap-3">
            {(["SINGLE", "MULTI"] as QuestionType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setCurrentQuestion((previous) => ({
                    ...previous,
                    questionType: type,

                    answer:
                      type === "SINGLE"
                        ? previous.answer.slice(0, 1)
                        : previous.answer,
                  }))
                }
                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                  currentQuestion.questionType === type
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                    : "bg-white text-purple-700 ring-1 ring-purple-200 hover:bg-purple-50"
                }`}
              >
                {type === "SINGLE" ? "Single Answer" : "Multiple Answers"}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={saveCurrentQuestion}
          className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
        >
          {editingIndex !== null ? "Update Question" : "Add Next Question"}
        </button>
      </div>

      {questions.length > 0 && (
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              Added Questions
            </h3>

            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
              {questions.length} Questions
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {questions.map((question, index) => (
              <div
                key={question._id ?? index}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-sm font-bold text-purple-700">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800">
                      {question.question}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {question.questionType}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => editQuestion(index)}
                      className="rounded-lg px-3 py-2 text-sm font-bold text-purple-600 hover:bg-purple-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteQuestion(index)}
                      className="rounded-lg px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={markAsDone}
        disabled={loading}
        className="mt-7 w-full rounded-xl bg-gradient-to-r from-purple-700 to-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading
          ? "Publishing Question Set..."
          : "Mark as Done & Return to Exam"}
      </button>
    </div>
  );
};

export default InlineQuestionSetCreator;

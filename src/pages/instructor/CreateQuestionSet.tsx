import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Send,
  RotateCcw,
  Save,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  CircleX,
  Loader2,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/* =========================================================
   TYPES
========================================================= */

type QuestionType =
  | "SINGLE"
  | "MULTI";

interface Question {
  _id?: string;
  question: string;
  options: string[];
  questionType: QuestionType;
  answer: string[];
}

interface QuestionSet {
  _id: string;
  questionSetName: string;
  department: string;
  questions: Question[];
  createdBy: string;
  isActive: boolean;
}

interface LoggedInUser {
  _id: string;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR";
  department?: string | null;
}

/* =========================================================
   EMPTY QUESTION
========================================================= */

const createEmptyQuestion = (): Question => ({
  question: "",
  options: ["", ""],
  questionType: "SINGLE",
  answer: [],
});

/* =========================================================
   COMPONENT
========================================================= */

const CreateQuestionSet = () => {
  /* =======================================================
     USER
  ======================================================= */

  const [user, setUser] =
    useState<LoggedInUser | null>(null);

  /* =======================================================
     QUESTION SETS
  ======================================================= */

  const [questionSets, setQuestionSets] =
    useState<QuestionSet[]>([]);

  const [isLoadingSets, setIsLoadingSets] =
    useState(true);

  /* =======================================================
     CREATE/EDIT MODE
  ======================================================= */

  const [isEditorOpen, setIsEditorOpen] =
    useState(false);

  const [editingSetId, setEditingSetId] =
    useState<string | null>(null);

  const [questionSetName, setQuestionSetName] =
    useState("");

  /* =======================================================
     QUESTIONS
  ======================================================= */

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [currentQuestion, setCurrentQuestion] =
    useState<Question>(
      createEmptyQuestion()
    );

  const [editingQuestionIndex, setEditingQuestionIndex] =
    useState<number | null>(null);

  /* =======================================================
     UI
  ======================================================= */

  const [isSaving, setIsSaving] =
    useState(false);

  const [actionId, setActionId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [expandedSetId, setExpandedSetId] =
    useState<string | null>(null);

  /* =======================================================
     LOAD USER
  ======================================================= */

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            credentials: "include",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load instructor."
          );
        }

        if (
          data.user.role !==
          "INSTRUCTOR"
        ) {
          throw new Error(
            "Only instructors can access this page."
          );
        }

        setUser(data.user);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load instructor."
        );
      }
    };

    loadUser();
  }, []);

  /* =======================================================
     LOAD QUESTION SETS
  ======================================================= */

  const loadQuestionSets = async () => {
    try {
      setIsLoadingSets(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/question-sets`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load question sets."
        );
      }

      setQuestionSets(
        data.questionSets || []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load question sets."
      );
    } finally {
      setIsLoadingSets(false);
    }
  };

  useEffect(() => {
    loadQuestionSets();
  }, []);

  /* =======================================================
     SORTED SETS
  ======================================================= */

  const draftSets = useMemo(
    () =>
      questionSets.filter(
        (item) => !item.isActive
      ),
    [questionSets]
  );

  const publishedSets = useMemo(
    () =>
      questionSets.filter(
        (item) => item.isActive
      ),
    [questionSets]
  );

  /* =======================================================
     RESET EDITOR
  ======================================================= */

  const resetEditor = () => {
    setIsEditorOpen(false);
    setEditingSetId(null);
    setQuestionSetName("");
    setQuestions([]);
    setCurrentQuestion(
      createEmptyQuestion()
    );
    setEditingQuestionIndex(null);
    setError("");
  };

  /* =======================================================
     OPEN NEW QUESTION SET
  ======================================================= */

  const handleCreateNew = () => {
    setEditingSetId(null);
    setQuestionSetName("");
    setQuestions([]);
    setCurrentQuestion(
      createEmptyQuestion()
    );
    setEditingQuestionIndex(null);
    setError("");
    setSuccess("");
    setIsEditorOpen(true);
  };

  /* =======================================================
     OPEN EXISTING QUESTION SET
  ======================================================= */

  const handleEditSet = (
    questionSet: QuestionSet
  ) => {
    setEditingSetId(
      questionSet._id
    );

    setQuestionSetName(
      questionSet.questionSetName
    );

    setQuestions(
      questionSet.questions.map(
        (question) => ({
          ...question,
          options: [
            ...question.options,
          ],
          answer: [
            ...question.answer,
          ],
        })
      )
    );

    setCurrentQuestion(
      createEmptyQuestion()
    );

    setEditingQuestionIndex(null);
    setError("");
    setSuccess("");
    setIsEditorOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     QUESTION TEXT
  ======================================================= */

  const handleQuestionChange = (
    value: string
  ) => {
    setCurrentQuestion(
      (previous) => ({
        ...previous,
        question: value,
      })
    );
  };

  /* =======================================================
     OPTION CHANGE
  ======================================================= */

  const handleOptionChange = (
    index: number,
    value: string
  ) => {
    setCurrentQuestion(
      (previous) => {
        const oldOption =
          previous.options[index];

        const options = [
          ...previous.options,
        ];

        options[index] = value;

        const answer =
          previous.answer.map(
            (item) =>
              item === oldOption
                ? value
                : item
          );

        return {
          ...previous,
          options,
          answer,
        };
      }
    );
  };

  /* =======================================================
     ADD OPTION
  ======================================================= */

  const handleAddOption = () => {
    setCurrentQuestion(
      (previous) => ({
        ...previous,
        options: [
          ...previous.options,
          "",
        ],
      })
    );
  };

  /* =======================================================
     REMOVE OPTION
  ======================================================= */

  const handleRemoveOption = (
    index: number
  ) => {
    if (
      currentQuestion.options
        .length <= 2
    ) {
      return;
    }

    const removedOption =
      currentQuestion.options[index];

    setCurrentQuestion(
      (previous) => ({
        ...previous,
        options:
          previous.options.filter(
            (_, optionIndex) =>
              optionIndex !== index
          ),
        answer:
          previous.answer.filter(
            (answer) =>
              answer !== removedOption
          ),
      })
    );
  };

  /* =======================================================
     QUESTION TYPE
  ======================================================= */

  const handleQuestionTypeChange = (
    type: QuestionType
  ) => {
    setCurrentQuestion(
      (previous) => ({
        ...previous,
        questionType: type,
        answer:
          type === "SINGLE"
            ? previous.answer.slice(
                0,
                1
              )
            : previous.answer,
      })
    );
  };

  /* =======================================================
     ANSWER SELECTION
  ======================================================= */

  const handleAnswerChange = (
    option: string
  ) => {
    setCurrentQuestion(
      (previous) => {
        if (
          previous.questionType ===
          "SINGLE"
        ) {
          return {
            ...previous,
            answer: [option],
          };
        }

        const alreadySelected =
          previous.answer.includes(
            option
          );

        return {
          ...previous,
          answer: alreadySelected
            ? previous.answer.filter(
                (answer) =>
                  answer !== option
              )
            : [
                ...previous.answer,
                option,
              ],
        };
      }
    );
  };

  /* =======================================================
     VALIDATE CURRENT QUESTION
  ======================================================= */

  const validateCurrentQuestion =
    (): string | null => {
      if (
        !currentQuestion.question.trim()
      ) {
        return "Please enter the question.";
      }

      const validOptions =
        currentQuestion.options
          .map((option) =>
            option.trim()
          )
          .filter(Boolean);

      if (
        validOptions.length < 2
      ) {
        return "Add at least 2 options.";
      }

      if (
        currentQuestion.answer.length ===
        0
      ) {
        return "Select at least one correct answer.";
      }

      if (
        currentQuestion.questionType ===
          "SINGLE" &&
        currentQuestion.answer
          .length !== 1
      ) {
        return "A single-answer question must have exactly one correct answer.";
      }

      return null;
    };

  /* =======================================================
     SAVE QUESTION TO LOCAL EDITOR
  ======================================================= */

  const handleAddNextQuestion = () => {
    setError("");

    const validation =
      validateCurrentQuestion();

    if (validation) {
      setError(validation);
      return;
    }

    const cleanedQuestion: Question = {
      ...currentQuestion,
      question:
        currentQuestion.question.trim(),
      options:
        currentQuestion.options
          .map((option) =>
            option.trim()
          )
          .filter(Boolean),
      answer:
        currentQuestion.answer,
    };

    if (
      editingQuestionIndex !== null
    ) {
      setQuestions(
        (previous) =>
          previous.map(
            (question, index) =>
              index ===
              editingQuestionIndex
                ? {
                    ...cleanedQuestion,
                    _id:
                      question._id,
                  }
                : question
          )
      );

      setEditingQuestionIndex(null);
    } else {
      setQuestions(
        (previous) => [
          ...previous,
          cleanedQuestion,
        ]
      );
    }

    setCurrentQuestion(
      createEmptyQuestion()
    );

    setSuccess(
      "Question added successfully."
    );

    setTimeout(() => {
      setSuccess("");
    }, 1800);
  };

  /* =======================================================
     EDIT QUESTION
  ======================================================= */

  const handleEditQuestion = (
    index: number
  ) => {
    const question =
      questions[index];

    setCurrentQuestion({
      ...question,
      options: [
        ...question.options,
      ],
      answer: [
        ...question.answer,
      ],
    });

    setEditingQuestionIndex(
      index
    );

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     DELETE QUESTION
  ======================================================= */

  const handleDeleteQuestion = (
    index: number
  ) => {
    setQuestions(
      (previous) =>
        previous.filter(
          (_, questionIndex) =>
            questionIndex !== index
        )
    );

    if (
      editingQuestionIndex === index
    ) {
      setCurrentQuestion(
        createEmptyQuestion()
      );

      setEditingQuestionIndex(
        null
      );
    }
  };

  /* =======================================================
     MARK AS DONE / SAVE QUESTION SET
  ======================================================= */

  const handleMarkAsDone = async () => {
    setError("");
    setSuccess("");

    let finalQuestions = [
      ...questions,
    ];

    /*
      If the instructor has filled the current
      question but hasn't pressed Add Next Question,
      automatically include it.
    */

    const hasCurrentQuestion =
      currentQuestion.question.trim() ||
      currentQuestion.options.some(
        (option) => option.trim()
      );

    if (hasCurrentQuestion) {
      const validation =
        validateCurrentQuestion();

      if (validation) {
        setError(validation);
        return;
      }

      const cleanedQuestion: Question =
        {
          ...currentQuestion,
          question:
            currentQuestion.question.trim(),
          options:
            currentQuestion.options
              .map((option) =>
                option.trim()
              )
              .filter(Boolean),
          answer:
            currentQuestion.answer,
        };

      if (
        editingQuestionIndex !== null
      ) {
        finalQuestions =
          finalQuestions.map(
            (question, index) =>
              index ===
              editingQuestionIndex
                ? {
                    ...cleanedQuestion,
                    _id:
                      question._id,
                  }
                : question
          );
      } else {
        finalQuestions = [
          ...finalQuestions,
          cleanedQuestion,
        ];
      }
    }

    if (!questionSetName.trim()) {
      setError(
        "Please enter a question set name."
      );
      return;
    }

    if (
      finalQuestions.length === 0
    ) {
      setError(
        "Add at least one question."
      );
      return;
    }

    try {
      setIsSaving(true);

      const isEditing =
        Boolean(editingSetId);

      const response = await fetch(
        isEditing
          ? `${API_URL}/api/question-sets/${editingSetId}`
          : `${API_URL}/api/question-sets`,
        {
          method: isEditing
            ? "PUT"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            questionSetName:
              questionSetName.trim(),
            questions:
              finalQuestions,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save question set."
        );
      }

      await loadQuestionSets();

      setSuccess(
        isEditing
          ? "Question set updated successfully."
          : "Question set saved successfully."
      );

      resetEditor();

      setTimeout(() => {
        setSuccess("");
      }, 2200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save question set."
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =======================================================
     DELETE SET
  ======================================================= */

  const handleDeleteSet = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this question set?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(id);
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/question-sets/${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete question set."
        );
      }

      setQuestionSets(
        (previous) =>
          previous.filter(
            (item) =>
              item._id !== id
          )
      );

      setSuccess(
        "Question set deleted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete question set."
      );
    } finally {
      setActionId(null);
    }
  };

  /* =======================================================
     PUBLISH
  ======================================================= */

  const handlePublish = async (
    id: string
  ) => {
    try {
      setActionId(id);
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/question-sets/${id}/publish`,
          {
            method: "PATCH",
            credentials: "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to publish question set."
        );
      }

      setQuestionSets(
        (previous) =>
          previous.map(
            (item) =>
              item._id === id
                ? {
                    ...item,
                    isActive: true,
                  }
                : item
          )
      );

      setSuccess(
        "Question set published successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to publish question set."
      );
    } finally {
      setActionId(null);
    }
  };

  /* =======================================================
     UNPUBLISH
  ======================================================= */

  const handleUnpublish = async (
    id: string
  ) => {
    try {
      setActionId(id);
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/question-sets/${id}/unpublish`,
          {
            method: "PATCH",
            credentials: "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to unpublish question set."
        );
      }

      setQuestionSets(
        (previous) =>
          previous.map(
            (item) =>
              item._id === id
                ? {
                    ...item,
                    isActive: false,
                  }
                : item
          )
      );

      setSuccess(
        "Question set unpublished."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to unpublish question set."
      );
    } finally {
      setActionId(null);
    }
  };

  /* =======================================================
     TOGGLE SET DETAILS
  ======================================================= */

  const toggleSet = (
    id: string
  ) => {
    setExpandedSetId(
      (previous) =>
        previous === id
          ? null
          : id
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-purple-800 to-purple-950 p-6 text-white shadow-xl shadow-purple-200/60 sm:p-8">

          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
              Instructor Workspace
            </p>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Question Sets
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-purple-100">
              Create, edit, organize and publish
              examination question banks for your
              department.
            </p>

            {user?.department && (
              <div className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-purple-100 backdrop-blur">
                Department: {user.department}
              </div>
            )}
          </div>

          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />

          <div className="pointer-events-none absolute -bottom-32 right-20 h-72 w-72 rounded-full border border-orange-300/10" />

        </section>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <CircleX
              size={20}
              className="mt-0.5 shrink-0"
            />

            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="ml-auto"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            <CircleCheck
              size={20}
            />

            {success}
          </div>
        )}

        {/* =================================================
            EDITOR
        ================================================= */}

        {isEditorOpen ? (
          <section className="mt-6 overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-xl shadow-purple-100/50">

            {/* EDITOR HEADER */}

            <div className="border-b border-purple-100 bg-gradient-to-r from-purple-50 via-white to-orange-50 p-5 sm:p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-500">
                    {editingSetId
                      ? "Edit Question Set"
                      : "New Question Set"}
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
                  onChange={(event) =>
                    setQuestionSetName(
                      event.target.value
                    )
                  }
                  placeholder="Example: JavaScript Fundamentals"
                  className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Department and instructor ID
                  will be automatically stored
                  from your instructor account.
                </p>

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
                        ? `Editing Question ${
                            editingQuestionIndex +
                            1
                          }`
                        : "Question Editor"}
                    </p>

                    <h3 className="mt-1 text-lg font-black text-slate-900">
                      {editingQuestionIndex !== null
                        ? "Update Question"
                        : "Add Question"}
                    </h3>
                  </div>

                  {editingQuestionIndex !==
                    null && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuestionIndex(
                          null
                        );

                        setCurrentQuestion(
                          createEmptyQuestion()
                        );
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
                    value={
                      currentQuestion.question
                    }
                    onChange={(event) =>
                      handleQuestionChange(
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Enter the examination question..."
                    className="w-full resize-none rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                  />

                </div>

                {/* OPTIONS */}

                <div className="mt-6">

                  <div className="flex items-center justify-between">

                    <label className="text-sm font-bold text-slate-700">
                      Options
                    </label>

                    <button
                      type="button"
                      onClick={
                        handleAddOption
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-purple-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-purple-800"
                    >
                      <Plus size={15} />
                      Add Option
                    </button>

                  </div>

                  <div className="mt-3 space-y-3">

                    {currentQuestion.options.map(
                      (
                        option,
                        index
                      ) => {
                        const isCorrect =
                          currentQuestion.answer.includes(
                            option
                          );

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
                              {String.fromCharCode(
                                65 + index
                              )}
                            </span>

                            <input
                              type="text"
                              value={option}
                              onChange={(
                                event
                              ) =>
                                handleOptionChange(
                                  index,
                                  event.target
                                    .value
                                )
                              }
                              placeholder={`Option ${
                                index + 1
                              }`}
                              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm font-medium text-slate-900 outline-none"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveOption(
                                  index
                                )
                              }
                              disabled={
                                currentQuestion
                                  .options
                                  .length <=
                                2
                              }
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

                {/* QUESTION TYPE */}

                <div className="mt-6">

                  <p className="mb-3 text-sm font-bold text-slate-700">
                    Question Type
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">

                    <button
                      type="button"
                      onClick={() =>
                        handleQuestionTypeChange(
                          "SINGLE"
                        )
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        currentQuestion.questionType ===
                        "SINGLE"
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
                      onClick={() =>
                        handleQuestionTypeChange(
                          "MULTI"
                        )
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        currentQuestion.questionType ===
                        "MULTI"
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

                    {currentQuestion.options.map(
                      (
                        option,
                        index
                      ) => {
                        if (
                          !option.trim()
                        ) {
                          return null;
                        }

                        const selected =
                          currentQuestion.answer.includes(
                            option
                          );

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
                                currentQuestion.questionType ===
                                "SINGLE"
                                  ? "radio"
                                  : "checkbox"
                              }
                              name="correct-answer"
                              checked={
                                selected
                              }
                              onChange={() =>
                                handleAnswerChange(
                                  option
                                )
                              }
                              className="h-4 w-4 accent-purple-700"
                            />

                            <span className="flex-1 text-sm font-semibold text-slate-700">
                              {option}
                            </span>

                            {selected && (
                              <Check
                                size={17}
                                className="text-green-600"
                              />
                            )}

                          </label>
                        );
                      }
                    )}

                  </div>

                </div>

                {/* QUESTION ACTION */}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={
                      handleAddNextQuestion
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 py-3 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-purple-800"
                  >
                    <Plus size={18} />

                    {editingQuestionIndex !==
                    null
                      ? "Update Question"
                      : "Add Next Question"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleMarkAsDone
                    }
                    disabled={isSaving}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
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

                    <BookOpen
                      size={30}
                      className="mx-auto text-orange-300"
                    />

                    <p className="mt-3 text-sm font-bold text-slate-700">
                      No questions added yet.
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Complete the question on
                      the left and click
                      Add Next Question.
                    </p>

                  </div>
                ) : (
                  <div className="mt-5 space-y-3">

                    {questions.map(
                      (
                        question,
                        index
                      ) => (
                        <div
                          key={
                            question._id ||
                            index
                          }
                          className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm"
                        >

                          <div className="flex items-start gap-3">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-xs font-black text-purple-700">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">

                              <p className="text-sm font-bold leading-5 text-slate-800">
                                {
                                  question.question
                                }
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2">

                                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-700">
                                  {
                                    question.questionType
                                  }
                                </span>

                                <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">
                                  {
                                    question.answer
                                      .length
                                  }{" "}
                                  correct
                                </span>

                              </div>

                            </div>

                          </div>

                          <div className="mt-3 flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleEditQuestion(
                                  index
                                )
                              }
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-purple-200 px-3 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-50"
                            >
                              <Edit3
                                size={14}
                              />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteQuestion(
                                  index
                                )
                              }
                              className="inline-flex items-center justify-center rounded-lg border border-red-100 px-3 py-2 text-red-500 transition hover:bg-red-50"
                            >
                              <Trash2
                                size={14}
                              />
                            </button>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

            </div>

          </section>
        ) : (
          /* =================================================
             CREATE CARD
          ================================================= */

          <section className="mt-6">

            <button
              type="button"
              onClick={
                handleCreateNew
              }
              className="group relative w-full overflow-hidden rounded-3xl border-2 border-dashed border-purple-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-100 sm:p-8"
            >

              <div className="relative z-10 flex flex-col items-center justify-between gap-5 sm:flex-row">

                <div className="flex items-center gap-4">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-lg shadow-purple-200 transition group-hover:scale-105">
                    <Plus
                      size={30}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-purple-500">
                      Question Bank
                    </p>

                    <h2 className="mt-1 text-xl font-black text-slate-900">
                      Create New Question Set
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Add questions, options,
                      answer types and correct
                      answers.
                    </p>
                  </div>

                </div>

                <div className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-100 transition group-hover:bg-orange-600">
                  Create New
                </div>

              </div>

            </button>

          </section>
        )}

        {/* =================================================
            UNPUBLISHED
        ================================================= */}

        <section className="mt-8">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-500">
                Drafts
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-900">
                Unpublished Question Sets
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Question sets saved by you but not
                currently published.
              </p>
            </div>

            <div className="rounded-xl bg-orange-100 px-3 py-2 text-sm font-black text-orange-700">
              {draftSets.length}
            </div>

          </div>

          {isLoadingSets ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <Loader2
                size={28}
                className="mx-auto animate-spin text-purple-600"
              />

              <p className="mt-3 text-sm font-semibold text-slate-500">
                Loading question sets...
              </p>
            </div>
          ) : draftSets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-8 text-center">

              <p className="text-sm font-bold text-slate-700">
                No unpublished question sets.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Your newly created question sets
                will appear here.
              </p>

            </div>
          ) : (
            <div className="space-y-4">

              {draftSets.map(
                (questionSet) => {
                  const expanded =
                    expandedSetId ===
                    questionSet._id;

                  return (
                    <div
                      key={
                        questionSet._id
                      }
                      className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:shadow-md"
                    >

                      <div className="p-5">

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                          <div className="flex items-start gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                              <BookOpen
                                size={22}
                              />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">

                                <h3 className="text-base font-black text-slate-900">
                                  {
                                    questionSet.questionSetName
                                  }
                                </h3>

                                <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-black uppercase text-orange-700">
                                  Draft
                                </span>

                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  questionSet.department
                                }
                              </p>

                              <p className="mt-1 text-xs font-semibold text-purple-600">
                                {
                                  questionSet.questions
                                    .length
                                }{" "}
                                questions
                              </p>
                            </div>

                          </div>

                          <div className="flex flex-wrap gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleEditSet(
                                  questionSet
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-50"
                            >
                              <Edit3
                                size={14}
                              />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handlePublish(
                                  questionSet._id
                                )
                              }
                              disabled={
                                actionId ===
                                questionSet._id
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-700 disabled:opacity-60"
                            >
                              {actionId ===
                              questionSet._id ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Send
                                  size={14}
                                />
                              )}
                              Publish
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteSet(
                                  questionSet._id
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50"
                            >
                              <Trash2
                                size={14}
                              />
                              Delete
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                toggleSet(
                                  questionSet._id
                                )
                              }
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                            >
                              {expanded ? (
                                <ChevronUp
                                  size={16}
                                />
                              ) : (
                                <ChevronDown
                                  size={16}
                                />
                              )}
                            </button>

                          </div>

                        </div>

                        {expanded && (
                          <div className="mt-5 border-t border-slate-100 pt-4">

                            <div className="space-y-3">

                              {questionSet.questions.map(
                                (
                                  question,
                                  index
                                ) => (
                                  <div
                                    key={
                                      question._id ||
                                      index
                                    }
                                    className="rounded-xl bg-slate-50 p-4"
                                  >
                                    <div className="flex gap-3">

                                      <span className="font-black text-purple-600">
                                        {index +
                                          1}
                                        .
                                      </span>

                                      <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                          {
                                            question.question
                                          }
                                        </p>

                                        <div className="mt-2 flex flex-wrap gap-2">
                                          <span className="rounded-full bg-purple-100 px-2 py-1 text-[10px] font-bold text-purple-700">
                                            {
                                              question.questionType
                                            }
                                          </span>

                                          <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">
                                            Answer:{" "}
                                            {
                                              question
                                                .answer
                                                .join(
                                                  ", "
                                                )
                                            }
                                          </span>
                                        </div>
                                      </div>

                                    </div>
                                  </div>
                                )
                              )}

                            </div>

                          </div>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* =================================================
            PUBLISHED
        ================================================= */}

        <section className="mt-10 pb-10">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-purple-500">
                Published
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-900">
                Published Question Sets
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Question sets currently available for
                examination creation.
              </p>
            </div>

            <div className="rounded-xl bg-purple-100 px-3 py-2 text-sm font-black text-purple-700">
              {publishedSets.length}
            </div>

          </div>

          {publishedSets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 p-8 text-center">

              <CircleCheck
                size={30}
                className="mx-auto text-purple-300"
              />

              <p className="mt-3 text-sm font-bold text-slate-700">
                No published question sets.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Publish a draft to make it appear here.
              </p>

            </div>
          ) : (
            <div className="space-y-4">

              {publishedSets.map(
                (questionSet) => {
                  const expanded =
                    expandedSetId ===
                    questionSet._id;

                  return (
                    <div
                      key={
                        questionSet._id
                      }
                      className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm transition hover:shadow-md"
                    >

                      <div className="p-5">

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                          <div className="flex items-start gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                              <BookOpen
                                size={22}
                              />
                            </div>

                            <div>

                              <div className="flex flex-wrap items-center gap-2">

                                <h3 className="text-base font-black text-slate-900">
                                  {
                                    questionSet.questionSetName
                                  }
                                </h3>

                                <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-black uppercase text-green-700">
                                  Published
                                </span>

                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  questionSet.department
                                }
                              </p>

                              <p className="mt-1 text-xs font-semibold text-purple-600">
                                {
                                  questionSet.questions
                                    .length
                                }{" "}
                                questions
                              </p>

                            </div>

                          </div>

                          <div className="flex flex-wrap gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleEditSet(
                                  questionSet
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-50"
                            >
                              <Edit3
                                size={14}
                              />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleUnpublish(
                                  questionSet._id
                                )
                              }
                              disabled={
                                actionId ===
                                questionSet._id
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
                            >
                              {actionId ===
                              questionSet._id ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <RotateCcw
                                  size={14}
                                />
                              )}
                              Unpublish
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                toggleSet(
                                  questionSet._id
                                )
                              }
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                            >
                              {expanded ? (
                                <ChevronUp
                                  size={16}
                                />
                              ) : (
                                <ChevronDown
                                  size={16}
                                />
                              )}
                            </button>

                          </div>

                        </div>

                        {expanded && (
                          <div className="mt-5 border-t border-slate-100 pt-4">

                            <div className="space-y-3">

                              {questionSet.questions.map(
                                (
                                  question,
                                  index
                                ) => (
                                  <div
                                    key={
                                      question._id ||
                                      index
                                    }
                                    className="rounded-xl bg-slate-50 p-4"
                                  >
                                    <div className="flex gap-3">

                                      <span className="font-black text-purple-600">
                                        {index +
                                          1}
                                        .
                                      </span>

                                      <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                          {
                                            question.question
                                          }
                                        </p>

                                        <div className="mt-2 flex flex-wrap gap-2">
                                          <span className="rounded-full bg-purple-100 px-2 py-1 text-[10px] font-bold text-purple-700">
                                            {
                                              question.questionType
                                            }
                                          </span>

                                          <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">
                                            Answer:{" "}
                                            {
                                              question
                                                .answer
                                                .join(
                                                  ", "
                                                )
                                            }
                                          </span>
                                        </div>
                                      </div>

                                    </div>
                                  </div>
                                )
                              )}

                            </div>

                          </div>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

      </div>
    </div>
  );
};

export default CreateQuestionSet;
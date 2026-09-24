import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

type QuestionType =
  | "SINGLE"
  | "MULTI";

type ExamMode =
  | "COMMON"
  | "SPECIAL";

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

interface Student {
  _id: string;
  name: string;
  email: string;
  department: string;
}

interface Exam {
  _id: string;
  title: string;
  description: string;
  questionSetIds: string[];
  questionIds: string[];
  department: string;
  instructorId: string;
  durationMinutes: number;
  questionCount: number;
  marksPerQuestion: number;

  negativeMarking: {
    enabled: boolean;
    penalty: number;
  };

  mode: ExamMode;
  maxAttempts: number;

  status:
    | "UNPUBLISHED"
    | "PUBLISHED"
    | "CLOSED";

  selectedStudents?: Student[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR";
  department?: string | null;
}


/* =========================================================
   HELPERS
========================================================= */

const emptyQuestion =
  (): Question => ({
    question: "",
    options: [
      "",
      "",
    ],
    questionType:
      "SINGLE",
    answer: [],
  });



/* =========================================================
   INLINE QUESTION SET CREATOR
========================================================= */

interface InlineQuestionSetCreatorProps {
  onDone: (
    questionSet: QuestionSet
  ) => void;

  onCancel: () => void;
}

const InlineQuestionSetCreator = ({
  onDone,
  onCancel,
}: InlineQuestionSetCreatorProps) => {
  const [
    questionSetName,
    setQuestionSetName,
  ] = useState("");

  const [
    questions,
    setQuestions,
  ] = useState<Question[]>(
    []
  );

  const [
    currentQuestion,
    setCurrentQuestion,
  ] =
    useState<Question>(
      emptyQuestion()
    );

  const [
    editingIndex,
    setEditingIndex,
  ] = useState<
    number | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const addOption = () => {
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

  const removeOption = (
    index: number
  ) => {
    if (
      currentQuestion.options
        .length <= 2
    ) {
      return;
    }

    const removed =
      currentQuestion
        .options[index];

    setCurrentQuestion(
      (previous) => ({
        ...previous,

        options:
          previous.options.filter(
            (_, i) =>
              i !== index
          ),

        answer:
          previous.answer.filter(
            (answer) =>
              answer !==
              removed
          ),
      })
    );
  };

  const updateOption = (
    index: number,
    value: string
  ) => {
    const oldValue =
      currentQuestion
        .options[index];

    setCurrentQuestion(
      (previous) => ({
        ...previous,

        options:
          previous.options.map(
            (
              option,
              i
            ) =>
              i === index
                ? value
                : option
          ),

        answer:
          previous.answer.map(
            (answer) =>
              answer ===
              oldValue
                ? value
                : answer
          ),
      })
    );
  };

  const toggleAnswer = (
    option: string
  ) => {
    if (
      currentQuestion
        .questionType ===
      "SINGLE"
    ) {
      setCurrentQuestion(
        (previous) => ({
          ...previous,
          answer: [option],
        })
      );

      return;
    }

    setCurrentQuestion(
      (previous) => ({
        ...previous,

        answer:
          previous.answer.includes(
            option
          )
            ? previous.answer.filter(
                (answer) =>
                  answer !==
                  option
              )
            : [
                ...previous.answer,
                option,
              ],
      })
    );
  };

  const saveCurrentQuestion =
    () => {
      const cleanOptions =
        currentQuestion.options
          .map(
            (option) =>
              option.trim()
          )
          .filter(Boolean);

      if (
        !currentQuestion.question.trim()
      ) {
        setError(
          "Question cannot be empty."
        );

        return;
      }

      if (
        cleanOptions.length <
        2
      ) {
        setError(
          "Add at least two options."
        );

        return;
      }

      if (
        currentQuestion.answer
          .length === 0
      ) {
        setError(
          "Select the correct answer."
        );

        return;
      }

      if (
        currentQuestion.questionType ===
          "SINGLE" &&
        currentQuestion.answer
          .length !== 1
      ) {
        setError(
          "SINGLE questions can have only one correct answer."
        );

        return;
      }

      const cleanQuestion: Question =
        {
          ...currentQuestion,

          question:
            currentQuestion.question.trim(),

          options:
            cleanOptions,
        };

      if (
        editingIndex !==
        null
      ) {
        setQuestions(
          (previous) =>
            previous.map(
              (
                question,
                index
              ) =>
                index ===
                editingIndex
                  ? cleanQuestion
                  : question
            )
        );
      } else {
        setQuestions(
          (previous) => [
            ...previous,
            cleanQuestion,
          ]
        );
      }

      setCurrentQuestion(
        emptyQuestion()
      );

      setEditingIndex(
        null
      );

      setError("");
    };

  const editQuestion = (
    index: number
  ) => {
    setCurrentQuestion(
      questions[index]
    );

    setEditingIndex(
      index
    );

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteQuestion = (
    index: number
  ) => {
    setQuestions(
      (previous) =>
        previous.filter(
          (_, i) =>
            i !== index
        )
    );
  };

  const markAsDone =
    async () => {
      if (
        !questionSetName.trim()
      ) {
        setError(
          "Question set name is required."
        );

        return;
      }

      if (
        questions.length === 0
      ) {
        setError(
          "Add at least one question."
        );

        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/question-sets",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify(
                {
                  questionSetName:
                    questionSetName.trim(),

                  questions:
                    questions.map(
                      (
                        question
                      ) => ({
                        ...question,
                        _id:
                          undefined,
                      })
                    ),
                }
              ),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data.message ||
              "Failed to create question set."
          );
        }

        /*
         * Automatically published
         * for use immediately in
         * this exam.
         */
        const created =
          data.questionSet;

        const publishResponse =
          await fetch(
            `http://localhost:5000/api/question-sets/${created._id}/publish`,
            {
              method:
                "PATCH",

              credentials:
                "include",
            }
          );

        const publishedData =
          await publishResponse.json();

        if (
          !publishResponse.ok
        ) {
          throw new Error(
            publishedData.message ||
              "Question set was created but could not be published."
          );
        }

        onDone(
          publishedData.questionSet
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong."
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
          value={
            questionSetName
          }
          onChange={(event) =>
            setQuestionSetName(
              event.target.value
            )
          }
          placeholder="Example: CSE - JavaScript Fundamentals"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-purple-100 bg-purple-50/40 p-5">

        <div className="flex items-center justify-between">

          <h3 className="font-bold text-slate-900">
            Question
          </h3>

          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
            {editingIndex !==
            null
              ? `Editing #${
                  editingIndex +
                  1
                }`
              : "New Question"}
          </span>

        </div>

        <textarea
          value={
            currentQuestion.question
          }
          onChange={(event) =>
            setCurrentQuestion(
              (previous) => ({
                ...previous,
                question:
                  event.target
                    .value,
              })
            )
          }
          placeholder="Enter your question..."
          rows={3}
          className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
        />

        <div className="mt-5 space-y-3">

          {currentQuestion.options.map(
            (
              option,
              index
            ) => (
              <div
                key={index}
                className="flex items-center gap-3"
              >

                <button
                  type="button"
                  onClick={() =>
                    toggleAnswer(
                      option
                    )
                  }
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    currentQuestion.answer.includes(
                      option
                    )
                      ? "border-purple-600 bg-purple-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {currentQuestion.answer.includes(
                    option
                  )
                    ? "✓"
                    : ""}
                </button>

                <input
                  value={option}
                  onChange={(
                    event
                  ) =>
                    updateOption(
                      index,
                      event
                        .target
                        .value
                    )
                  }
                  placeholder={`Option ${
                    index +
                    1
                  }`}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-purple-400"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeOption(
                      index
                    )
                  }
                  className="rounded-lg px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50"
                >
                  ×
                </button>

              </div>
            )
          )}

        </div>

        <button
          type="button"
          onClick={addOption}
          className="mt-4 rounded-xl border border-dashed border-purple-300 px-4 py-2 text-sm font-bold text-purple-700 hover:bg-purple-50"
        >
          + Add Option
        </button>

        <div className="mt-5">

          <p className="text-sm font-bold text-slate-700">
            Question Type
          </p>

          <div className="mt-2 flex gap-3">

            {(
              [
                "SINGLE",
                "MULTI",
              ] as QuestionType[]
            ).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setCurrentQuestion(
                      (
                        previous
                      ) => ({
                        ...previous,
                        questionType:
                          type,

                        answer:
                          type ===
                          "SINGLE"
                            ? previous
                                .answer
                                .slice(
                                  0,
                                  1
                                )
                            : previous.answer,
                      })
                    )
                  }
                  className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                    currentQuestion.questionType ===
                    type
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                      : "bg-white text-purple-700 ring-1 ring-purple-200 hover:bg-purple-50"
                  }`}
                >
                  {type ===
                  "SINGLE"
                    ? "Single Answer"
                    : "Multiple Answers"}
                </button>
              )
            )}

          </div>

        </div>

        <button
          type="button"
          onClick={
            saveCurrentQuestion
          }
          className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
        >
          {editingIndex !==
          null
            ? "Update Question"
            : "Add Next Question"}
        </button>

      </div>

      {questions.length >
        0 && (
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

            {questions.map(
              (
                question,
                index
              ) => (
                <div
                  key={
                    question._id ??
                    index
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >

                  <div className="flex gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-sm font-bold text-purple-700">
                      {index +
                        1}
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="font-semibold text-slate-800">
                        {
                          question.question
                        }
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        {
                          question.questionType
                        }
                      </p>

                    </div>

                    <div className="flex gap-1">

                      <button
                        type="button"
                        onClick={() =>
                          editQuestion(
                            index
                          )
                        }
                        className="rounded-lg px-3 py-2 text-sm font-bold text-purple-600 hover:bg-purple-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteQuestion(
                            index
                          )
                        }
                        className="rounded-lg px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>
              )
            )}

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

/* =========================================================
   MAIN CREATE EXAM
========================================================= */

const CreateExam = () => {
  const [
    user,
    setUser,
  ] = useState<User | null>(
    null
  );

  const [
    exams,
    setExams,
  ] = useState<Exam[]>(
    []
  );

  const [
    questionSets,
    setQuestionSets,
  ] = useState<
    QuestionSet[]
  >([]);

  const [
    students,
    setStudents,
  ] = useState<Student[]>(
    []
  );

  const [
    showEditor,
    setShowEditor,
  ] = useState(false);

  const [
    showQuestionSetCreator,
    setShowQuestionSetCreator,
  ] =
    useState(false);

  const [
    editingExam,
    setEditingExam,
  ] =
    useState<Exam | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /* =======================================================
     FORM
  ======================================================= */

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    durationMinutes,
    setDurationMinutes,
  ] = useState(30);

  const [
    selectedQuestionSetIds,
    setSelectedQuestionSetIds,
  ] = useState<
    string[]
  >([]);

  const [
    questionCount,
    setQuestionCount,
  ] = useState(1);

  const [
    marksPerQuestion,
    setMarksPerQuestion,
  ] = useState(1);

  const [
    negativeMarkingEnabled,
    setNegativeMarkingEnabled,
  ] = useState(false);

  const [
    negativePenalty,
    setNegativePenalty,
  ] = useState(0.5);

  const [
    mode,
    setMode,
  ] = useState<ExamMode>(
    "COMMON"
  );

  const [
    maxAttempts,
    setMaxAttempts,
  ] = useState(1);

  const [
    selectedStudentIds,
    setSelectedStudentIds,
  ] = useState<
    string[]
  >([]);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData =
    async () => {
      setLoading(true);
      setError("");

      try {
        const [
          meResponse,
          examsResponse,
          questionSetsResponse,
          studentsResponse,
        ] =
          await Promise.all([
            fetch(
              "http://localhost:5000/api/auth/me",
              {
                credentials:
                  "include",
              }
            ),

            fetch(
              "http://localhost:5000/api/exams",
              {
                credentials:
                  "include",
              }
            ),

            fetch(
              "http://localhost:5000/api/exams/question-sets",
              {
                credentials:
                  "include",
              }
            ),

            fetch(
              "http://localhost:5000/api/exams/students",
              {
                credentials:
                  "include",
              }
            ),
          ]);

        const me =
          await meResponse.json();

        const examsData =
          await examsResponse.json();

        const questionSetsData =
          await questionSetsResponse.json();

        const studentsData =
          await studentsResponse.json();

        if (
          !meResponse.ok
        ) {
          throw new Error(
            me.message ||
              "Unable to load instructor."
          );
        }

        if (
          !examsResponse.ok
        ) {
          throw new Error(
            examsData.message ||
              "Unable to load exams."
          );
        }

        if (
          !questionSetsResponse.ok
        ) {
          throw new Error(
            questionSetsData.message ||
              "Unable to load question sets."
          );
        }

        setUser(
          me.user
        );

        setExams(
          examsData.exams ??
            []
        );

        setQuestionSets(
          questionSetsData.questionSets ??
            []
        );

        setStudents(
          studentsData.students ??
            []
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load exam data."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadData();
  }, []);

  /* =======================================================
     QUESTION COUNT LIMIT
  ======================================================= */

  const maxQuestionCount =
    useMemo(() => {
      return selectedQuestionSetIds.reduce(
        (
          total,
          id
        ) => {
          const set =
            questionSets.find(
              (item) =>
                item._id ===
                id
            );

          return (
            total +
            (set?.questions
              .length ?? 0)
          );
        },
        0
      );
    }, [
      selectedQuestionSetIds,
      questionSets,
    ]);

  useEffect(() => {
    if (
      maxQuestionCount ===
      0
    ) {
      setQuestionCount(
        1
      );

      return;
    }

    if (
      questionCount >
      maxQuestionCount
    ) {
      setQuestionCount(
        maxQuestionCount
      );
    }
  }, [
    maxQuestionCount,
    questionCount,
  ]);

  /* =======================================================
     OPEN CREATE
  ======================================================= */

  const openCreate =
    () => {
      setEditingExam(
        null
      );

      setTitle("");
      setDescription("");
      setDurationMinutes(
        30
      );
      setSelectedQuestionSetIds(
        []
      );
      setQuestionCount(
        1
      );
      setMarksPerQuestion(
        1
      );
      setNegativeMarkingEnabled(
        false
      );
      setNegativePenalty(
        0.5
      );
      setMode(
        "COMMON"
      );
      setMaxAttempts(
        1
      );
      setSelectedStudentIds(
        []
      );

      setError("");
      setSuccess("");

      setShowEditor(
        true
      );
    };

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const openEdit = (
    exam: Exam
  ) => {
    setEditingExam(
      exam
    );

    setTitle(
      exam.title
    );

    setDescription(
      exam.description
    );

    setDurationMinutes(
      exam.durationMinutes
    );

    setSelectedQuestionSetIds(
      exam.questionSetIds
    );

    setQuestionCount(
      exam.questionCount
    );

    setMarksPerQuestion(
      exam.marksPerQuestion
    );

    setNegativeMarkingEnabled(
      exam.negativeMarking
        .enabled
    );

    setNegativePenalty(
      exam.negativeMarking
        .penalty
    );

    setMode(
      exam.mode
    );

    setMaxAttempts(
      exam.maxAttempts
    );

    setSelectedStudentIds(
      exam.selectedStudents?.map(
        (student) =>
          student._id
      ) ?? []
    );

    setError("");
    setSuccess("");

    setShowEditor(
      true
    );
  };

  /* =======================================================
     QUESTION SET SELECT
  ======================================================= */

  const toggleQuestionSet =
    (
      id: string
    ) => {
      setSelectedQuestionSetIds(
        (previous) =>
          previous.includes(
            id
          )
            ? previous.filter(
                (
                  item
                ) =>
                  item !==
                  id
              )
            : [
                ...previous,
                id,
              ]
      );
    };

  /* =======================================================
     STUDENT SELECT
  ======================================================= */

  const toggleStudent =
    (
      id: string
    ) => {
      setSelectedStudentIds(
        (previous) =>
          previous.includes(
            id
          )
            ? previous.filter(
                (
                  item
                ) =>
                  item !==
                  id
              )
            : [
                ...previous,
                id,
              ]
      );
    };

  /* =======================================================
     QUESTION SET CREATED
  ======================================================= */

  const handleQuestionSetCreated =
    (
      questionSet: QuestionSet
    ) => {
      setQuestionSets(
        (previous) => [
          questionSet,
          ...previous.filter(
            (item) =>
              item._id !==
              questionSet._id
          ),
        ]
      );

      /*
       * Automatically select the
       * newly-created question set.
       */
      setSelectedQuestionSetIds(
        (previous) =>
          previous.includes(
            questionSet._id
          )
            ? previous
            : [
                ...previous,
                questionSet._id,
              ]
      );

      setShowQuestionSetCreator(
        false
      );

      setSuccess(
        "Question set published and added to the question-set selection."
      );
    };

  /* =======================================================
     SAVE EXAM
  ======================================================= */

  const saveExam =
    async () => {
      setError("");
      setSuccess("");

      if (!title.trim()) {
        setError(
          "Exam name is required."
        );

        return;
      }

      if (
        selectedQuestionSetIds.length ===
        0
      ) {
        setError(
          "Select at least one question set."
        );

        return;
      }

      if (
        questionCount < 1 ||
        questionCount >
          maxQuestionCount
      ) {
        setError(
          `Question count must be between 1 and ${maxQuestionCount}.`
        );

        return;
      }

      if (
        mode ===
          "SPECIAL" &&
        selectedStudentIds.length ===
          0
      ) {
        setError(
          "Select at least one student for a special exam."
        );

        return;
      }

      setSaving(true);

      try {
        const isEditing =
          Boolean(
            editingExam
          );

        const response =
          await fetch(
            isEditing
              ? `http://localhost:5000/api/exams/${editingExam!._id}`
              : "http://localhost:5000/api/exams",
            {
              method:
                isEditing
                  ? "PUT"
                  : "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify(
                {
                  title:
                    title.trim(),

                  description:
                    description.trim(),

                  questionSetIds:
                    selectedQuestionSetIds,

                  questionCount,

                  durationMinutes,

                  marksPerQuestion,

                  negativeMarking:
                    {
                      enabled:
                        negativeMarkingEnabled,

                      penalty:
                        negativeMarkingEnabled
                          ? negativePenalty
                          : 0,
                    },

                  mode,

                  maxAttempts,

                  studentIds:
                    mode ===
                    "SPECIAL"
                      ? selectedStudentIds
                      : [],
                }
              ),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data.message ||
              "Failed to save exam."
          );
        }

        setShowEditor(
          false
        );

        setEditingExam(
          null
        );

        setSuccess(
          isEditing
            ? "Exam updated successfully."
            : "Exam created successfully and added to Unpublished Exams."
        );

        await loadData();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to save exam."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =======================================================
     DELETE
  ======================================================= */

  const deleteExam =
    async (
      id: string
    ) => {
      if (
        !window.confirm(
          "Delete this exam permanently?"
        )
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/exams/${id}`,
            {
              method:
                "DELETE",

              credentials:
                "include",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data.message ||
              "Failed to delete exam."
          );
        }

        await loadData();

        setSuccess(
          "Exam deleted successfully."
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to delete exam."
        );
      }
    };

  /* =======================================================
     PUBLISH / UNPUBLISH
  ======================================================= */

  const changePublication =
    async (
      exam: Exam,
      action:
        | "publish"
        | "unpublish"
    ) => {
      try {
        const response =
          await fetch(
            `http://localhost:5000/api/exams/${exam._id}/${action}`,
            {
              method:
                "PATCH",

              credentials:
                "include",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data.message ||
              "Failed to update exam."
          );
        }

        await loadData();

        setSuccess(
          action ===
            "publish"
            ? "Exam published successfully."
            : "Exam unpublished successfully."
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to update exam."
        );
      }
    };

  const unpublishedExams =
    exams.filter(
      (exam) =>
        exam.status !==
        "PUBLISHED"
    );

  const publishedExams =
    exams.filter(
      (exam) =>
        exam.status ===
        "PUBLISHED"
    );

  /* =======================================================
     INLINE QUESTION SET PAGE
  ======================================================= */

  if (
    showQuestionSetCreator
  ) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        <InlineQuestionSetCreator
          onDone={
            handleQuestionSetCreated
          }
          onCancel={() =>
            setShowQuestionSetCreator(
              false
            )
          }
        />

      </div>
    );
  }

  /* =======================================================
     EXAM EDITOR
  ======================================================= */

  if (
    showEditor
  ) {
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
              onClick={() =>
                setShowEditor(
                  false
                )
              }
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
                      (
                        previous
                      ) =>
                        !previous
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
              SAVE
          ================================================= */}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                setShowEditor(
                  false
                )
              }
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
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

      <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-lg shadow-purple-100/40 sm:p-8">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
              Instructor
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Create Exam
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Create, configure and manage examinations.
            </p>
          </div>

          <Link
            to="/instructor"
            className="inline-flex w-fit rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
          >
            Back to Dashboard
          </Link>

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
            TOP SECTION
        ================================================= */}

        <section className="mt-8">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-purple-500">
                Section 01
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Unpublished Exams
              </h2>
            </div>

            <button
              type="button"
              onClick={
                openCreate
              }
              className="rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5"
            >
              + Create Exam
            </button>

          </div>

          {loading ? (
            <div className="mt-5 rounded-2xl border border-dashed border-purple-200 bg-purple-50/30 p-10 text-center text-sm text-slate-500">
              Loading exams...
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">

              {unpublishedExams.length ===
                0 && (
                <div className="md:col-span-2 rounded-2xl border border-dashed border-purple-200 bg-purple-50/30 p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-xl font-black text-purple-700">
                    E
                  </div>

                  <h3 className="mt-4 font-bold text-slate-800">
                    No unpublished exams
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Create your first examination.
                  </p>
                </div>
              )}

              {unpublishedExams.map(
                (exam) => (
                  <div
                    key={
                      exam._id
                    }
                    className="rounded-2xl border border-purple-100 bg-gradient-to-br from-white to-purple-50/40 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-orange-700">
                          Unpublished
                        </span>

                        <h3 className="mt-3 text-lg font-bold text-slate-900">
                          {
                            exam.title
                          }
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {
                            exam.department
                          }
                        </p>
                      </div>

                      <span className="rounded-xl bg-purple-100 px-3 py-2 text-xs font-bold text-purple-700">
                        {
                          exam.mode
                        }
                      </span>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">

                      <div className="rounded-xl bg-white p-3">
                        <p className="text-slate-400">
                          Duration
                        </p>

                        <p className="mt-1 font-bold text-slate-800">
                          {
                            exam.durationMinutes
                          }{" "}
                          min
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3">
                        <p className="text-slate-400">
                          Questions
                        </p>

                        <p className="mt-1 font-bold text-slate-800">
                          {
                            exam.questionCount
                          }
                        </p>
                      </div>

                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(
                            exam
                          )
                        }
                        className="rounded-xl bg-purple-100 px-4 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-200"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          changePublication(
                            exam,
                            "publish"
                          )
                        }
                        className="rounded-xl bg-green-100 px-4 py-2.5 text-xs font-bold text-green-700 hover:bg-green-200"
                      >
                        Publish
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteExam(
                            exam._id
                          )
                        }
                        className="rounded-xl bg-red-100 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-200"
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* =================================================
            PUBLISHED SECTION
        ================================================= */}

        <section className="mt-12 border-t border-slate-100 pt-10">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-500">
              Section 02
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Published Exams
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Exams currently available according to their configured mode.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            {publishedExams.length ===
              0 && (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-orange-200 bg-orange-50/30 p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-xl font-black text-orange-600">
                  ✓
                </div>

                <h3 className="mt-4 font-bold text-slate-800">
                  No published exams
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Publish an unpublished exam to see it here.
                </p>
              </div>
            )}

            {publishedExams.map(
              (exam) => (
                <div
                  key={
                    exam._id
                  }
                  className="rounded-2xl border border-green-100 bg-gradient-to-br from-white to-green-50/30 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-green-700">
                        Published
                      </span>

                      <h3 className="mt-3 text-lg font-bold text-slate-900">
                        {
                          exam.title
                        }
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          exam.department
                        }
                      </p>
                    </div>

                    <span className="rounded-xl bg-purple-100 px-3 py-2 text-xs font-bold text-purple-700">
                      {
                        exam.mode
                      }
                    </span>

                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-slate-400">
                        Duration
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {
                          exam.durationMinutes
                        }{" "}
                        min
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-slate-400">
                        Questions
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {
                          exam.questionCount
                        }
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-slate-400">
                        Attempts
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {
                          exam.maxAttempts
                        }
                      </p>
                    </div>

                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        openEdit(
                          exam
                        )
                      }
                      className="rounded-xl bg-purple-100 px-4 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-200"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        changePublication(
                          exam,
                          "unpublish"
                        )
                      }
                      className="rounded-xl bg-orange-100 px-4 py-2.5 text-xs font-bold text-orange-700 hover:bg-orange-200"
                    >
                      Unpublish
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteExam(
                          exam._id
                        )
                      }
                      className="rounded-xl bg-red-100 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-200"
                    >
                      Delete
                    </button>

                  </div>

                </div>
              )
            )}

          </div>

        </section>

      </div>

    </div>
  );
};

export default CreateExam;
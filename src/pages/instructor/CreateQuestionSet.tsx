import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import CreateQuestionSetCard from "./CreateQuestionSetComponents/CreateQuestionSetCard";
import QuestionSetEditor from "./CreateQuestionSetComponents/QuestionSetEditor";
import QuestionSetHeader from "./CreateQuestionSetComponents/QuestionSetHeader";
import QuestionSetLists from "./CreateQuestionSetComponents/QuestionSetLists";
import { createEmptyQuestion } from "./CreateQuestionSetComponents/helpers";
import type {
  LoggedInUser,
  Question,
  QuestionSet,
  QuestionType,
} from "./CreateQuestionSetComponents/types";

/* =========================================================
   API
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

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
     PDF IMPORT
  ======================================================= */

  const [isImportingPdf, setIsImportingPdf] =
    useState(false);

  const pdfInputRef =
    useRef<HTMLInputElement | null>(null);

  // React StrictMode runs mount effects twice in development.
  // These guards keep each initial API request to one call.
  const hasLoadedUser = useRef(false);
  const hasLoadedQuestionSets = useRef(false);

  /* =======================================================
     LOAD USER
  ======================================================= */

  useEffect(() => {
    if (hasLoadedUser.current) {
      return;
    }

    hasLoadedUser.current = true;

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
    if (hasLoadedQuestionSets.current) {
      return;
    }

    hasLoadedQuestionSets.current = true;
    void loadQuestionSets();
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
     IMPORT QUESTIONS FROM PDF
  ======================================================= */

  const handlePdfImport = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    // Allow selecting the same PDF again later.
    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("PDF size must be 10 MB or less.");
      return;
    }

    setError("");
    setSuccess("");
    setIsImportingPdf(true);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch(
        `${API_URL}/api/question-sets/import-pdf`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to read questions from the PDF."
        );
      }

      const importedQuestions: Question[] =
        (data.questions || []).map(
          (question: Question) => ({
            question: question.question || "",
            options: Array.isArray(question.options)
              ? question.options
              : [],
            questionType:
              question.questionType === "MULTI"
                ? "MULTI"
                : "SINGLE",
            answer: Array.isArray(question.answer)
              ? question.answer
              : [],
          })
        );

      if (importedQuestions.length === 0) {
        throw new Error(
          "No questions could be detected. Make sure the PDF follows the supported question format."
        );
      }

      setQuestions((previous) => [
        ...previous,
        ...importedQuestions,
      ]);

      const warningText =
        Array.isArray(data.warnings) &&
        data.warnings.length > 0
          ? ` ${data.warnings.length} question(s) need review before saving.`
          : "";

      setSuccess(
        `${importedQuestions.length} question(s) imported successfully.${warningText}`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to import PDF questions."
      );
    } finally {
      setIsImportingPdf(false);
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

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <QuestionSetHeader
          user={user}
          error={error}
          success={success}
          setError={setError}
        />

        {isEditorOpen ? (
          <QuestionSetEditor
            editingSetId={editingSetId}
            questionSetName={questionSetName}
            setQuestionSetName={setQuestionSetName}
            currentQuestion={currentQuestion}
            questions={questions}
            editingQuestionIndex={editingQuestionIndex}
            setEditingQuestionIndex={setEditingQuestionIndex}
            setCurrentQuestion={setCurrentQuestion}
            isImportingPdf={isImportingPdf}
            pdfInputRef={pdfInputRef}
            handlePdfImport={handlePdfImport}
            handleQuestionChange={handleQuestionChange}
            handleAddOption={handleAddOption}
            handleOptionChange={handleOptionChange}
            handleRemoveOption={handleRemoveOption}
            handleQuestionTypeChange={handleQuestionTypeChange}
            handleAnswerChange={handleAnswerChange}
            handleAddNextQuestion={handleAddNextQuestion}
            handleMarkAsDone={handleMarkAsDone}
            handleEditQuestion={handleEditQuestion}
            handleDeleteQuestion={handleDeleteQuestion}
            isSaving={isSaving}
            resetEditor={resetEditor}
          />
        ) : (
          <CreateQuestionSetCard
            handleCreateNew={handleCreateNew}
          />
        )}

        <QuestionSetLists
          isLoadingSets={isLoadingSets}
          draftSets={draftSets}
          publishedSets={publishedSets}
          expandedSetId={expandedSetId}
          actionId={actionId}
          handleEditSet={handleEditSet}
          handlePublish={handlePublish}
          handleUnpublish={handleUnpublish}
          handleDeleteSet={handleDeleteSet}
          toggleSet={toggleSet}
        />
      </div>
    </div>
  );
};

export default CreateQuestionSet;

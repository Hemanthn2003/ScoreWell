import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ExamEditor from "./CreateExamComponents/ExamEditor";
import ExamSections from "./CreateExamComponents/ExamSections";
import InlineQuestionSetCreator from "./CreateExamComponents/InlineQuestionSetCreator";
import type { Exam, ExamMode, QuestionSet, Student, User } from "./CreateExamComponents/types";

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

  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowTick(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

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

  const [startDate, setStartDate] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");

  const [
    strictMode,
    setStrictMode,
  ] = useState(false);

  const [
    strictAttemptChances,
    setStrictAttemptChances,
  ] = useState(1);

  const [
    strictDeadlineDate,
    setStrictDeadlineDate,
  ] = useState("");

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

  const hasLoadedInitialData = useRef(false);

  useEffect(() => {
    if (hasLoadedInitialData.current) {
      return;
    }

    hasLoadedInitialData.current = true;
    void loadData();
  }, []);

  // Exam data is fetched once when this page opens.
  // Countdown/status display is calculated locally from the dates.

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
      setStrictMode(false);
      setStrictAttemptChances(1);
      setStrictDeadlineDate("");
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

    const toLocalDateTime = (value?: string | Date | null): string => {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setStartDate(toLocalDateTime(exam.startDate));
    setDeadlineDate(toLocalDateTime(exam.deadlineDate));

    setStrictMode(Boolean(exam.strictExam));
    setStrictAttemptChances(
      exam.strictExam?.attemptChances ?? 1
    );
    setStrictDeadlineDate(
      exam.strictExam?.deadlineDate
        ? (() => {
            const date = new Date(
              exam.strictExam.deadlineDate
            );

            const year = date.getFullYear();
            const month = String(
              date.getMonth() + 1
            ).padStart(2, "0");
            const day = String(
              date.getDate()
            ).padStart(2, "0");

            return `${year}-${month}-${day}`;
          })()
        : ""
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

      if (startDate && deadlineDate) {
        const start = new Date(startDate).getTime();
        const deadline = new Date(deadlineDate).getTime();
        if (Number.isNaN(start) || Number.isNaN(deadline)) {
          setError("Select valid start and deadline date/time values.");
          return;
        }
        if (deadline <= start) {
          setError("Deadline must be after the start date and time.");
          return;
        }
      }

      if (deadlineDate && new Date(deadlineDate).getTime() <= Date.now()) {
        setError("Deadline date and time must be in the future.");
        return;
      }

      if (strictMode) {
        if (
          !Number.isInteger(strictAttemptChances) ||
          strictAttemptChances < 1
        ) {
          setError(
            "Strict mode attempt chances must be at least 1."
          );
          return;
        }

        if (!strictDeadlineDate) {
          setError(
            "Select a strict mode deadline date."
          );
          return;
        }

        const selectedDeadline = new Date(
          `${strictDeadlineDate}T23:59:59`
        );

        if (Number.isNaN(selectedDeadline.getTime())) {
          setError(
            "Select a valid strict mode deadline date."
          );
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDeadline < today) {
          setError(
            "Strict mode deadline cannot be in the past."
          );
          return;
        }
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

                  startDate: startDate || undefined,

                  deadlineDate: deadlineDate || undefined,

                  strictMode,

                  strictAttemptChances: strictMode
                    ? strictAttemptChances
                    : undefined,

                  strictDeadlineDate: strictMode
                    ? strictDeadlineDate
                    : undefined,

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
          action === "publish"
            ? data.exam?.status === "UNPUBLISHED"
              ? "Exam scheduled successfully. It will publish automatically at the configured start time."
              : "Exam published successfully."
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

  const unpublishedExams = exams.filter((exam) => exam.status === "UNPUBLISHED");

  const publishedExams = exams.filter((exam) => exam.status === "PUBLISHED");

  const expiredExams = exams.filter((exam) => exam.status === "EXPIRED");

  /* =======================================================
     INLINE QUESTION SET PAGE
  ======================================================= */

  if (showQuestionSetCreator) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <InlineQuestionSetCreator
          onDone={handleQuestionSetCreated}
          onCancel={() => setShowQuestionSetCreator(false)}
        />
      </div>
    );
  }

  /* =======================================================
     EXAM EDITOR
  ======================================================= */

  if (showEditor) {
    return (
      <ExamEditor
        user={user}
        editingExam={editingExam}
        error={error}
        success={success}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        durationMinutes={durationMinutes}
        setDurationMinutes={setDurationMinutes}
        marksPerQuestion={marksPerQuestion}
        setMarksPerQuestion={setMarksPerQuestion}
        questionSets={questionSets}
        setShowQuestionSetCreator={setShowQuestionSetCreator}
        selectedQuestionSetIds={selectedQuestionSetIds}
        toggleQuestionSet={toggleQuestionSet}
        maxQuestionCount={maxQuestionCount}
        questionCount={questionCount}
        setQuestionCount={setQuestionCount}
        mode={mode}
        setMode={setMode}
        students={students}
        selectedStudentIds={selectedStudentIds}
        toggleStudent={toggleStudent}
        maxAttempts={maxAttempts}
        setMaxAttempts={setMaxAttempts}
        negativeMarkingEnabled={negativeMarkingEnabled}
        setNegativeMarkingEnabled={setNegativeMarkingEnabled}
        negativePenalty={negativePenalty}
        setNegativePenalty={setNegativePenalty}
        startDate={startDate}
        setStartDate={setStartDate}
        deadlineDate={deadlineDate}
        setDeadlineDate={setDeadlineDate}
        strictMode={strictMode}
        setStrictMode={setStrictMode}
        strictAttemptChances={strictAttemptChances}
        setStrictAttemptChances={setStrictAttemptChances}
        strictDeadlineDate={strictDeadlineDate}
        setStrictDeadlineDate={setStrictDeadlineDate}
        saving={saving}
        saveExam={saveExam}
        onBack={() => setShowEditor(false)}
      />
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <ExamSections
      loading={loading}
      error={error}
      success={success}
      unpublishedExams={unpublishedExams}
      publishedExams={publishedExams}
      expiredExams={expiredExams}
      nowTick={nowTick}
      openCreate={openCreate}
      openEdit={openEdit}
      deleteExam={deleteExam}
      changePublication={changePublication}
    />
  );
};

export default CreateExam;

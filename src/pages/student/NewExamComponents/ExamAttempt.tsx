import {



  useCallback,



  useEffect,



  useMemo,



  useRef,



  useState,



} from "react";







import {



  useNavigate,



  useParams,



} from "react-router-dom";







type QuestionType = "SINGLE" | "MULTI";







interface ExamQuestion {



  questionId: string;



  question: string;



  options: string[];



  questionType: QuestionType;



  selectedAnswers: string[];



}







interface ExamAttempt {



  id: string;



  attemptNo: number;



  examId: string;



  examName: string;



  mode: "COMMON" | "SPECIAL";



  examType: "NORMAL" | "STRICT";



  startTime: string;



  durationMinutes: number;



  questionCount: number;



  totalMarks: number;



  questions: ExamQuestion[];



}







interface StartExamResponse {



  success: boolean;



  message?: string;



  resumed?: boolean;



  attempt?: ExamAttempt;



}







interface SubmissionResult {



  attemptId: string;



  examId: string;



  examName: string;



  attemptNo: number;



  score: number;



  totalMarks: number;



  correctAnswers: number;



  wrongAnswers: number;



  unanswered: number;



  timeTakenSeconds: number;



  submittedAt: string | null;



}







interface SubmitExamResponse {



  success: boolean;



  message?: string;



  result?: SubmissionResult;



}







const API_URL = "http\://localhost:5000";







const ExamAttempt = () => {



  const navigate = useNavigate();



  const { examId } = useParams();







  const [attempt, setAttempt] =



    useState<ExamAttempt | null>(null);







  const [currentQuestionIndex, setCurrentQuestionIndex] =



    useState(0);







  const [answers, setAnswers] = useState<



    Record<string, string[]>



  >({});







  const [remainingSeconds, setRemainingSeconds] =



    useState(0);







  const [loading, setLoading] = useState(true);







  const [savingAnswer, setSavingAnswer] =



    useState(false);







  const [submitting, setSubmitting] =



    useState(false);







  const [error, setError] = useState("");







  const [showSubmitConfirm, setShowSubmitConfirm] =



    useState(false);







  const [submitted, setSubmitted] =



    useState(false);







  const activityHandlingRef =



    useRef(false);



  const examAccessKey = examId



    ? `scorewell-exam-access-${examId}`



    : "";







  /*



   * Start or resume the examination.



   */



  const startExam = useCallback(async () => {



    if (!examId) {



      setError("Invalid examination ID.");



      setLoading(false);



      return;



    }







    if (

      examAccessKey &&

      !sessionStorage.getItem(examAccessKey)

    ) {

      navigate("/student/new-exams", {

        replace: true,

      });

      return;

    }



    try {



      setLoading(true);



      setError("");







      const response = await fetch(



        `${API_URL}/api/student-exams/${examId}/start`,



        {



          method: "POST",



          credentials: "include",



          headers: {



            "Content-Type": "application/json",



          },



        }



      );







      const data: StartExamResponse =



        await response.json();







      if (



        !response.ok ||



        !data.success ||



        !data.attempt



      ) {



        throw new Error(



          data.message ||



            "Unable to start the examination."



        );



      }







      const examAttempt = data.attempt;







      setAttempt(examAttempt);







      const existingAnswers: Record<



        string,



        string[]



      > = {};







      examAttempt.questions.forEach(



        (question) => {



          existingAnswers[



            question.questionId



          ] = question.selectedAnswers ?? [];



        }



      );







      setAnswers(existingAnswers);







      const startTime = new Date(



        examAttempt.startTime



      ).getTime();







      const durationMilliseconds =



        examAttempt.durationMinutes *



        60 *



        1000;







      const endTime =



        startTime + durationMilliseconds;







      const secondsRemaining = Math.max(



        0,



        Math.floor(



          (endTime - Date.now()) / 1000



        )



      );







      setRemainingSeconds(



        secondsRemaining



      );



    } catch (err) {



      setError(



        err instanceof Error



          ? err.message



          : "Unable to start the examination."



      );



    } finally {



      setLoading(false);



    }



  }, [examAccessKey, examId, navigate]);







  useEffect(() => {



    void startExam();



  }, [startExam]);







  /*



   * Save one answer to MongoDB.



   */



  const saveAnswer = useCallback(



    async (



      questionId: string,



      selectedAnswers: string[]



    ) => {



      if (!attempt?.id) {



        return;



      }







      try {



        setSavingAnswer(true);







        const response = await fetch(



          `${API_URL}/api/student-exam-submissions/${attempt.id}/answer`,



          {



            method: "PATCH",



            credentials: "include",



            headers: {



              "Content-Type": "application/json",



            },



            body: JSON.stringify({



              questionId,



              selectedAnswers,



            }),



          }



        );







        const data: {



          success: boolean;



          message?: string;



        } = await response.json();







        if (!response.ok || !data.success) {



          throw new Error(



            data.message ||



              "Failed to save answer."



          );



        }



      } catch (err) {



        console.error(



          "Save answer error:",



          err



        );







        setError(



          err instanceof Error



            ? err.message



            : "Failed to save answer."



        );



      } finally {



        setSavingAnswer(false);



      }



    },



    [attempt]



  );







  /*



   * Submit the examination.



   */



  const submitExam = useCallback(



    async () => {



      if (



        !attempt?.id ||



        submitting ||



        submitted



      ) {



        return;



      }







      try {



        setSubmitting(true);



        setError("");



        setShowSubmitConfirm(false);







        const response = await fetch(



          `${API_URL}/api/student-exam-submissions/${attempt.id}/submit`,



          {



            method: "POST",



            credentials: "include",



            headers: {



              "Content-Type": "application/json",



            },



          }



        );







        const data: SubmitExamResponse =



          await response.json();







        if (



          !response.ok ||



          !data.success ||



          !data.result



        ) {



          throw new Error(



            data.message ||



              "Failed to submit the examination."



          );



        }







        if (examAccessKey) {

          sessionStorage.removeItem(examAccessKey);

        }



        setSubmitted(true);



      } catch (err) {



        console.error(



          "Submit examination error:",



          err



        );







        setError(



          err instanceof Error



            ? err.message



            : "Failed to submit the examination."



        );



      } finally {



        setSubmitting(false);



      }



    },



    [



      attempt,



      examAccessKey,



      submitting,



      submitted,



    ]



  );







  /*

   * Browser/tab activity.

   *

   * STRICT attempts are auto-submitted immediately.

   * NORMAL attempts are counted and paused until resumed.

   */

  useEffect(() => {

    if (!attempt || submitted) {

      return;

    }



    const handleExamLeave = () => {

      if (

        activityHandlingRef.current ||

        !attempt.id

      ) {

        return;

      }



      if (document.visibilityState !== "hidden") {

        return;

      }



      activityHandlingRef.current = true;



      void fetch(

        `${API_URL}/api/student-exam-submissions/${attempt.id}/activity`,

        {

          method: "POST",

          credentials: "include",

          keepalive: true,

        }

      ).finally(() => {

        if (examAccessKey) {

          sessionStorage.removeItem(examAccessKey);

        }



        window.location.replace("/student/new-exams");

      });

    };



    const handlePageHide = () => {

      handleExamLeave();

    };



    document.addEventListener(

      "visibilitychange",

      handleExamLeave

    );



    window.addEventListener(

      "pagehide",

      handlePageHide

    );



    return () => {

      document.removeEventListener(

        "visibilitychange",

        handleExamLeave

      );



      window.removeEventListener(

        "pagehide",

        handlePageHide

      );

    };

  }, [attempt, examAccessKey, submitted]);



  /*



   * Countdown timer.



   *



   * The timer is calculated from startTime,



   * so refreshing the page does not reset it.



   */



  useEffect(() => {



    if (!attempt || submitted) {



      return;



    }







    const updateTimer = () => {



      // NORMAL exams pause while the browser tab is hidden.



      // STRICT exams continue running and are handled by



      // the browser/tab activity violation logic above.



      if (



        attempt.examType === "NORMAL" &&



        document.visibilityState === "hidden"



      ) {



        return;



      }







      const startTime = new Date(



        attempt.startTime



      ).getTime();







      const endTime =



        startTime +



        attempt.durationMinutes *



          60 *



          1000;







      const secondsRemaining = Math.max(



        0,



        Math.floor(



          (endTime - Date.now()) / 1000



        )



      );







      setRemainingSeconds(



        secondsRemaining



      );







      if (secondsRemaining <= 0) {



        setShowSubmitConfirm(false);







        void submitExam();



      }



    };







    updateTimer();







    const timer = window.setInterval(



      updateTimer,



      1000



    );







    return () => {



      window.clearInterval(timer);



    };



  }, [



    attempt,



    submitted,



    submitExam,



  ]);







  /*



   * Current question.



   */



  const currentQuestion = useMemo(() => {



    if (!attempt) {



      return null;



    }







    return (



      attempt.questions[



        currentQuestionIndex



      ] ?? null



    );



  }, [



    attempt,



    currentQuestionIndex,



  ]);







  /*



   * Select an answer.



   */



  const handleAnswerChange = (



    option: string



  ) => {



    if (



      !currentQuestion ||



      submitted ||



      submitting



    ) {



      return;



    }







    const questionId =



      currentQuestion.questionId;







    const currentAnswers =



      answers[questionId] ?? [];







    let updatedAnswers: string[];







    if (



      currentQuestion.questionType ===



      "SINGLE"



    ) {



      updatedAnswers = [option];



    } else {



      const alreadySelected =



        currentAnswers.includes(option);







      updatedAnswers = alreadySelected



        ? currentAnswers.filter(



            (answer) => answer !== option



          )



        : [



            ...currentAnswers,



            option,



          ];



    }







    setAnswers((previous) => ({



      ...previous,



      [questionId]: updatedAnswers,



    }));







    void saveAnswer(



      questionId,



      updatedAnswers



    );



  };







  /*



   * Move to previous question.



   */



  const handlePrevious = () => {



    if (



      currentQuestionIndex <= 0 ||



      submitting ||



      submitted



    ) {



      return;



    }







    setCurrentQuestionIndex(



      (previous) => previous - 1



    );



  };







  /*



   * Move to next question.



   */



  const handleNext = () => {



    if (



      !attempt ||



      submitting ||



      submitted



    ) {



      return;



    }







    if (



      currentQuestionIndex >=



      attempt.questions.length - 1



    ) {



      setShowSubmitConfirm(true);



      return;



    }







    setCurrentQuestionIndex(



      (previous) => previous + 1



    );



  };







  /*



   * Format timer.



   */



  const formatTime = (



    seconds: number



  ) => {



    const hours = Math.floor(



      seconds / 3600



    );







    const minutes = Math.floor(



      (seconds % 3600) / 60



    );







    const remaining =



      seconds % 60;







    return `${String(hours).padStart(



      2,



      "0"



    )}:${String(minutes).padStart(



      2,



      "0"



    )}:${String(remaining).padStart(



      2,



      "0"



    )}`;



  };







  /*



   * Question answer status.



   */



  const answeredCount = useMemo(() => {



    if (!attempt) {



      return 0;



    }







    return attempt.questions.filter(



      (question) =>



        (



          answers[



            question.questionId



          ] ?? []



        ).length > 0



    ).length;



  }, [attempt, answers]);







  /*



   * Loading screen.



   */



  if (loading) {



    return (



      <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-purple-50 via-white to-orange-50 px-4">



        <div className="w-full max-w-md rounded-3xl border border-purple-100 bg-white p-8 text-center shadow-xl shadow-purple-100/40">



          <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-purple-100 text-xl font-bold text-purple-600">



            E



          </div>







          <h2 className="mt-5 text-xl font-bold text-slate-800">



            Preparing Your Examination



          </h2>







          <p className="mt-2 text-sm leading-6 text-slate-500">



            Please wait while your



            examination attempt is



            being prepared.



          </p>



        </div>



      </div>



    );



  }







  /*



   * Error screen.



   */



  if (error && !attempt) {



    return (



      <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-purple-50 via-white to-orange-50 px-4">



        <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-red-100/30">



          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-xl font-bold text-red-500">



            !



          </div>







          <h2 className="mt-5 text-xl font-bold text-slate-800">



            Unable to Start Examination



          </h2>







          <p className="mt-2 text-sm leading-6 text-slate-500">



            {error}



          </p>







          <button



            type="button"



            onClick={() =>



              void startExam()



            }



            className="mt-6 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-700"



          >



            Try Again



          </button>



        </div>



      </div>



    );



  }







  /*



   * No attempt.



   */



  if (



    !attempt ||



    !currentQuestion



  ) {



    return (



      <div className="flex min-h-full items-center justify-center bg-slate-50 px-4">



        <div className="rounded-3xl bg-white p-8 text-center shadow-lg">



          <h2 className="text-xl font-bold text-slate-800">



            Examination Not Available



          </h2>



        </div>



      </div>



    );



  }







  /*



   * Submitted screen.



   */



  if (submitted) {



    return (



      <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-purple-50 via-white to-orange-50 px-4 py-8">



        <div className="w-full max-w-2xl rounded-3xl border border-purple-100 bg-white p-8 shadow-xl shadow-purple-100/40">



          <div className="text-center">



            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-orange-500 text-2xl font-bold text-white">



              ✓



            </div>







            <h1 className="mt-5 text-2xl font-bold text-slate-900">



              Thank You for Submitting



            </h1>







            <p className="mt-3 text-base font-semibold text-purple-700">



              Your examination has been submitted successfully.



            </p>







            <p className="mt-3 text-sm leading-6 text-slate-500">



              All the best for your result!



              <br />



              Your result will be released once the examination timer expires.



            </p>



          </div>







          <button



            type="button"



            onClick={() =>



              navigate("/student")



            }



            className="mt-7 w-full rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-700"



          >



            Return to Dashboard



          </button>



        </div>



      </div>



    );



  }







  const selectedAnswers =



    answers[



      currentQuestion.questionId



    ] ?? [];







  const isLastQuestion =



    currentQuestionIndex ===



    attempt.questions.length - 1;







  return (



    <div className="min-h-full bg-slate-50">



      {/* Top Bar */}



      <header className="sticky top-0 z-30 border-b border-purple-100 bg-white shadow-sm">



        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">



          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">



            <div className="min-w-0">



              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">



                {attempt.examType}{" "}



                Examination



              </p>







              <h1 className="mt-1 truncate text-lg font-bold text-slate-900 sm:text-xl">



                {attempt.examName}



              </h1>







              <p className="mt-1 text-xs text-slate-500">



                Attempt{" "}



                {attempt.attemptNo}



              </p>



            </div>







            {/* Timer */}



            <div



              className={`rounded-2xl border px-5 py-3 text-center ${



                remainingSeconds <=



                300



                  ? "border-red-200 bg-red-50"



                  : "border-purple-200 bg-purple-50"



              }`}



            >



              <p



                className={`text-[10px] font-bold uppercase tracking-[0.16em] ${



                  remainingSeconds <=



                  300



                    ? "text-red-500"



                    : "text-purple-500"



                }`}



              >



                Time Remaining



              </p>







              <p



                className={`mt-0.5 font-mono text-xl font-bold ${



                  remainingSeconds <=



                  300



                    ? "text-red-600"



                    : "text-purple-700"



                }`}



              >



                {formatTime(



                  remainingSeconds



                )}



              </p>



            </div>



          </div>



        </div>



      </header>







      {/* Main */}



      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">



        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">



          {/* Question */}



          <section className="rounded-3xl border border-purple-100 bg-white shadow-lg shadow-purple-100/30">



            <div className="border-b border-slate-100 p-6 sm:p-8">



              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">



                <div>



                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-500">



                    Question{" "}



                    {currentQuestionIndex +



                      1}{" "}



                    of{" "}



                    {



                      attempt.questions



                        .length



                    }



                  </p>







                  <p className="mt-1 text-xs text-slate-400">



                    {currentQuestion.questionType ===



                    "MULTI"



                      ? "Select all correct options"



                      : "Select one option"}



                  </p>



                </div>







                <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">



                  {currentQuestion.questionType ===



                  "MULTI"



                    ? "Multiple Answer"



                    : "Single Answer"}



                </span>



              </div>







              <h2 className="mt-7 text-lg font-semibold leading-8 text-slate-800 sm:text-xl">



                {currentQuestion.question}



              </h2>







              {/* Options */}



              <div className="mt-7 space-y-3">



                {currentQuestion.options.map(



                  (



                    option,



                    optionIndex



                  ) => {



                    const isSelected =



                      selectedAnswers.includes(



                        option



                      );







                    return (



                      <label



                        key={`${currentQuestion.questionId}-${optionIndex}`}



                        className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${



                          isSelected



                            ? "border-purple-400 bg-purple-50 shadow-sm"



                            : "border-slate-200 bg-white hover:border-purple-200 hover:bg-purple-50/40"



                        }`}



                      >



                        <input



                          type={



                            currentQuestion.questionType ===



                            "MULTI"



                              ? "checkbox"



                              : "radio"



                          }



                          name={



                            currentQuestion.questionId



                          }



                          value={option}



                          checked={



                            isSelected



                          }



                          disabled={



                            savingAnswer ||



                            submitting



                          }



                          onChange={() =>



                            handleAnswerChange(



                              option



                            )



                          }



                          className="mt-1 h-4 w-4 border-purple-300 text-purple-600 focus:ring-purple-500"



                        />







                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">



                          {String.fromCharCode(



                            65 +



                              optionIndex



                          )}



                        </span>







                        <span



                          className={`text-sm leading-6 ${



                            isSelected



                              ? "font-semibold text-purple-800"



                              : "text-slate-700"



                          }`}



                        >



                          {option}



                        </span>



                      </label>



                    );



                  }



                )}



              </div>







              {savingAnswer && (



                <p className="mt-4 text-xs font-medium text-purple-500">



                  Saving answer...



                </p>



              )}



            </div>







            {/* Navigation */}



            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">



              <button



                type="button"



                disabled={



                  currentQuestionIndex ===



                    0 ||



                  submitting



                }



                onClick={



                  handlePrevious



                }



                className="rounded-xl border border-purple-200 bg-white px-5 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-40"



              >



                ← Previous



              </button>







              <button



                type="button"



                disabled={submitting}



                onClick={handleNext}



                className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:from-purple-700 hover:to-purple-800 disabled:cursor-not-allowed disabled:opacity-60"



              >



                {isLastQuestion



                  ? "Submit Examination"



                  : "Save & Continue →"}



              </button>



            </div>



          </section>







          {/* Question Palette */}



          <aside className="h-fit rounded-3xl border border-purple-100 bg-white p-5 shadow-lg shadow-purple-100/30 lg:sticky lg:top-24">



            <div>



              <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-500">



                Question Navigator



              </p>







              <h2 className="mt-1 text-lg font-bold text-slate-800">



                Your Progress



              </h2>



            </div>







            {/* Progress */}



            <div className="mt-5 rounded-2xl bg-purple-50 p-4">



              <div className="flex items-center justify-between">



                <span className="text-xs font-semibold text-slate-500">



                  Answered



                </span>







                <span className="text-sm font-bold text-purple-700">



                  {answeredCount}/



                  {



                    attempt.questions



                      .length



                  }



                </span>



              </div>







              <div className="mt-3 h-2 overflow-hidden rounded-full bg-purple-100">



                <div



                  className="h-full rounded-full bg-purple-600 transition-all"



                  style={{



                    width: `${



                      attempt.questions



                        .length >



                      0



                        ? (answeredCount /



                            attempt



                              .questions



                              .length) *



                          100



                        : 0



                    }%`,



                  }}



                />



              </div>



            </div>







            {/* Palette */}



            <div className="mt-5 grid grid-cols-5 gap-2">



              {attempt.questions.map(



                (



                  question,



                  index



                ) => {



                  const isAnswered =



                    (



                      answers[



                        question



                          .questionId



                      ] ?? []



                    ).length > 0;







                  const isCurrent =



                    index ===



                    currentQuestionIndex;







                  return (



                    <button



                      key={



                        question.questionId



                      }



                      type="button"



                      disabled={



                        submitting



                      }



                      onClick={() =>



                        setCurrentQuestionIndex(



                          index



                        )



                      }



                      className={`flex h-10 items-center justify-center rounded-xl text-xs font-bold transition ${



                        isCurrent



                          ? "bg-purple-600 text-white ring-2 ring-purple-200"



                          : isAnswered



                          ? "bg-orange-100 text-orange-700 hover:bg-orange-200"



                          : "bg-slate-100 text-slate-500 hover:bg-purple-50 hover:text-purple-700"



                      }`}



                    >



                      {index + 1}



                    </button>



                  );



                }



              )}



            </div>







            {/* Legend */}



            <div className="mt-5 space-y-2 border-t border-slate-100 pt-5">



              <div className="flex items-center gap-2">



                <span className="h-3 w-3 rounded bg-purple-600" />







                <span className="text-xs text-slate-500">



                  Current



                </span>



              </div>







              <div className="flex items-center gap-2">



                <span className="h-3 w-3 rounded bg-orange-100" />







                <span className="text-xs text-slate-500">



                  Answered



                </span>



              </div>







              <div className="flex items-center gap-2">



                <span className="h-3 w-3 rounded bg-slate-100" />







                <span className="text-xs text-slate-500">



                  Not Answered



                </span>



              </div>



            </div>



          </aside>



        </div>



      </main>







      {/* Error while exam is active */}



      {error && attempt && (



        <div className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-red-200 bg-white p-4 shadow-xl">



          <div className="flex items-start gap-3">



            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 font-bold text-red-500">



              !



            </div>







            <div className="min-w-0">



              <p className="text-sm font-bold text-slate-800">



                Action failed



              </p>







              <p className="mt-1 text-xs leading-5 text-slate-500">



                {error}



              </p>



            </div>







            <button



              type="button"



              onClick={() =>



                setError("")



              }



              className="ml-auto text-slate-400 hover:text-slate-600"



            >



              ×



            </button>



          </div>



        </div>



      )}







      {/* Submit Confirmation */}



      {showSubmitConfirm && (



        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">



          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">



            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-xl font-bold text-orange-600">



              ?



            </div>







            <h2 className="mt-5 text-center text-xl font-bold text-slate-900">



              Submit Examination?



            </h2>







            <p className="mt-2 text-center text-sm leading-6 text-slate-500">



              You have answered{" "}



              <strong>



                {answeredCount}



              </strong>{" "}



              of{" "}



              <strong>



                {



                  attempt.questions



                    .length



                }



              </strong>{" "}



              questions. Once



              submitted, you cannot



              continue this attempt.



            </p>







            <div className="mt-6 flex flex-col gap-3 sm:flex-row">



              <button



                type="button"



                onClick={() =>



                  setShowSubmitConfirm(



                    false



                  )



                }



                disabled={submitting}



                className="flex-1 rounded-xl border border-purple-200 px-5 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 disabled:opacity-50"



              >



                Continue Exam



              </button>







              <button



                type="button"



                onClick={() =>



                  void submitExam()



                }



                disabled={submitting}



                className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-3 text-sm font-bold text-white transition hover:from-purple-700 hover:to-purple-800 disabled:cursor-not-allowed disabled:opacity-60"



              >



                {submitting



                  ? "Submitting..."



                  : "Submit Now"}



              </button>



            </div>



          </div>



        </div>



      )}







      {/* Submission loading overlay */}



      {submitting && (



        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">



          <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">



            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" />







            <h2 className="mt-5 text-lg font-bold text-slate-900">



              Submitting Examination



            </h2>







            <p className="mt-2 text-sm text-slate-500">



              Please wait while your



              answers are evaluated.



            </p>



          </div>



        </div>



      )}



    </div>



  );



};







export default ExamAttempt;
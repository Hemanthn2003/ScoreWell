import { useCallback, useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";



type ExamType = "NORMAL" | "STRICT";

type ExamMode = "COMMON" | "SPECIAL";



interface InProgressAttempt {

  attemptId: string;

  attemptNo: number;

  startTime: string;

  status: string;

}



interface AvailableExam {

  _id: string;

  title: string;

  description?: string;

  department: string;

  durationMinutes: number;

  questionCount: number;

  marksPerQuestion: number;

  negativeMarking: {

    enabled: boolean;

    penalty: number;

  };

  mode: ExamMode;

  examType: ExamType;

  maxAttempts: number;

  attemptsUsed: number;

  attemptsRemaining: number;

  startDate: string | null;

  deadlineDate: string | null;

  inProgressAttempt: InProgressAttempt | null;

}



interface ExamsResponse {

  success: boolean;

  exams: AvailableExam[];

  message?: string;

}



const API_URL = "http\://localhost:5000";



const NewExams = () => {

  const navigate = useNavigate();



  const [exams, setExams] = useState<AvailableExam[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");



  const loadExams = useCallback(async () => {

    try {

      setLoading(true);

      setError("");



      const response = await fetch(

        `${API_URL}/api/student-exams`,

        {

          method: "GET",

          credentials: "include",

          headers: {

            "Content-Type": "application/json",

          },

        }

      );



      const data: ExamsResponse = await response.json();



      if (!response.ok || !data.success) {

        throw new Error(

          data.message ||

            "Failed to load available examinations."

        );

      }



      setExams(data.exams ?? []);

    } catch (err) {

      setError(

        err instanceof Error

          ? err.message

          : "Failed to load available examinations."

      );

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => {

    void loadExams();

  }, [loadExams]);



  const formatDeadline = (deadline: string | null) => {

    if (!deadline) {

      return "No deadline";

    }



    return new Date(deadline).toLocaleString("en-IN", {

      dateStyle: "medium",

      timeStyle: "short",

    });

  };



  const getTimeRemaining = (deadline: string | null) => {

    if (!deadline) {

      return "No deadline";

    }



    const difference =

      new Date(deadline).getTime() - Date.now();



    if (difference <= 0) {

      return "Deadline passed";

    }



    const totalMinutes = Math.floor(

      difference / (1000 * 60)

    );



    const days = Math.floor(totalMinutes / (60 * 24));

    const hours = Math.floor(

      (totalMinutes % (60 * 24)) / 60

    );

    const minutes = totalMinutes % 60;



    if (days > 0) {

      return `${days}d ${hours}h ${minutes}m remaining`;

    }



    if (hours > 0) {

      return `${hours}h ${minutes}m remaining`;

    }



    return `${minutes}m remaining`;

  };



  const handleExamAction = (exam: AvailableExam) => {

    navigate(`/student/exams/${exam._id}/terms`);

  };



  return (

    <div className="min-h-full bg-gradient-to-br from-purple-50/60 via-white to-orange-50/40">

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}

        <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-lg shadow-purple-100/40 sm:p-8">

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

            <div>

              <div className="flex items-center gap-2">

                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">

                  Student Portal

                </p>

              </div>



              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">

                Available Examinations

              </h1>



              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">

                View and attempt examinations available for

                your department.

              </p>

            </div>



            <Link

              to="/student"

              className="inline-flex w-fit items-center justify-center rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm font-semibold text-purple-700 transition hover:border-purple-300 hover:bg-purple-50"

            >

              Back to Dashboard

            </Link>

          </div>

        </div>



        {/* Loading */}

        {loading && (

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {[1, 2].map((item) => (

              <div

                key={item}

                className="animate-pulse rounded-3xl border border-purple-100 bg-white p-6 shadow-lg shadow-purple-100/30"

              >

                <div className="h-5 w-32 rounded bg-purple-100" />

                <div className="mt-4 h-7 w-3/4 rounded bg-slate-100" />

                <div className="mt-3 h-4 w-full rounded bg-slate-100" />

                <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />



                <div className="mt-6 grid grid-cols-2 gap-3">

                  <div className="h-16 rounded-2xl bg-purple-50" />

                  <div className="h-16 rounded-2xl bg-orange-50" />

                </div>

              </div>

            ))}

          </div>

        )}



        {/* Error */}

        {!loading && error && (

          <div className="mt-6 rounded-3xl border border-red-100 bg-white p-8 text-center shadow-lg shadow-red-100/20">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-xl font-bold text-red-500">

              !

            </div>



            <h2 className="mt-4 text-lg font-bold text-slate-800">

              Unable to Load Examinations

            </h2>



            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">

              {error}

            </p>



            <button

              type="button"

              onClick={() => void loadExams()}

              className="mt-5 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"

            >

              Try Again

            </button>

          </div>

        )}



        {/* Empty */}

        {!loading && !error && exams.length === 0 && (

          <div className="mt-6 rounded-3xl border border-dashed border-purple-200 bg-white p-10 text-center shadow-lg shadow-purple-100/30">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-orange-100 text-2xl font-bold text-purple-700">

              E

            </div>



            <h2 className="mt-5 text-xl font-bold text-slate-800">

              No Examinations Available

            </h2>



            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">

              There are currently no examinations available

              for you. New examinations will appear here when

              they become available.

            </p>

          </div>

        )}



        {/* Exam Cards */}

        {!loading && !error && exams.length > 0 && (

          <div className="mt-6 grid gap-5 lg:grid-cols-2">

            {exams.map((exam) => {

              const isResume =

                exam.inProgressAttempt !== null;



              return (

                <div

                  key={exam._id}

                  className="group overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-lg shadow-purple-100/30 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-200/40"

                >

                  {/* Card Top */}

                  <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-600 to-purple-700 p-6 text-white">

                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />

                    <div className="absolute -bottom-12 right-16 h-28 w-28 rounded-full bg-orange-400/20" />



                    <div className="relative">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">

                          {exam.examType}

                        </span>



                        <span className="rounded-full bg-orange-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">

                          {exam.mode}

                        </span>



                        {isResume && (

                          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-700">

                            In Progress

                          </span>

                        )}

                      </div>



                      <h2 className="mt-4 text-xl font-bold sm:text-2xl">

                        {exam.title}

                      </h2>



                      <p className="mt-2 text-sm leading-6 text-purple-100">

                        {exam.description ||

                          "Examination assigned to your department."}

                      </p>

                    </div>

                  </div>



                  {/* Card Body */}

                  <div className="p-6">

                    {/* Exam Information */}

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                      <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-3">

                        <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-500">

                          Duration

                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">

                          {exam.durationMinutes} min

                        </p>

                      </div>



                      <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-3">

                        <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-500">

                          Questions

                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">

                          {exam.questionCount}

                        </p>

                      </div>



                      <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-3">

                        <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-500">

                          Marks

                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">

                          {exam.marksPerQuestion} / Q

                        </p>

                      </div>



                      <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-3">

                        <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-500">

                          Attempts

                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">

                          {exam.attemptsUsed} /{" "}

                          {exam.maxAttempts}

                        </p>

                      </div>

                    </div>



                    {/* Deadline */}

                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">

                            Examination Deadline

                          </p>



                          <p className="mt-1 text-sm font-semibold text-slate-700">

                            {formatDeadline(

                              exam.deadlineDate

                            )}

                          </p>

                        </div>



                        <div className="rounded-xl bg-white px-3 py-2 shadow-sm">

                          <p className="text-xs font-bold text-orange-500">

                            {getTimeRemaining(

                              exam.deadlineDate

                            )}

                          </p>

                        </div>

                      </div>

                    </div>



                    {/* Attempt Information */}

                    <div className="mt-4 flex items-center justify-between rounded-2xl border border-purple-100 bg-purple-50/40 px-4 py-3">

                      <div>

                        <p className="text-xs font-semibold text-slate-500">

                          Attempts remaining

                        </p>



                        <p className="mt-0.5 text-lg font-bold text-purple-700">

                          {exam.attemptsRemaining}

                        </p>

                      </div>



                      {exam.negativeMarking.enabled && (

                        <div className="text-right">

                          <p className="text-xs font-semibold text-slate-500">

                            Negative marking

                          </p>



                          <p className="mt-0.5 text-sm font-bold text-orange-600">

                            -{exam.negativeMarking.penalty}

                          </p>

                        </div>

                      )}

                    </div>



                    {/* Action */}

                    <button

                      type="button"

                      onClick={() =>

                        handleExamAction(exam)

                      }

                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:from-purple-700 hover:to-purple-800 active:scale-[0.99]"

                    >

                      {isResume

                        ? "Resume Examination"

                        : "Start Examination"}



                      <span className="text-base">

                        →

                      </span>

                    </button>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>

    </div>

  );

};



export default NewExams;
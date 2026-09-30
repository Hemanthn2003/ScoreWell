import { Link } from "react-router-dom";
import { Clock3, Timer } from "lucide-react";

import type { Exam } from "./types";
import { formatCountdown, formatDateTime } from "./helpers";

export interface ExamSectionsProps {
  loading: boolean;
  error: string;
  success: string;
  unpublishedExams: Exam[];
  publishedExams: Exam[];
  expiredExams: Exam[];
  nowTick: number;
  openCreate: () => void;
  openEdit: (exam: Exam) => void;
  deleteExam: (id: string) => void;
  changePublication: (exam: Exam, action: "publish" | "unpublish") => void;
}

const ExamSections = ({
  loading,
  error,
  success,
  unpublishedExams,
  publishedExams,
  expiredExams,
  nowTick,
  openCreate,
  openEdit,
  deleteExam,
  changePublication,
}: ExamSectionsProps) => {
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

                    {exam.startDate && new Date(exam.startDate).getTime() > nowTick && (
                    <div className="mt-4 rounded-2xl border border-purple-100 bg-purple-50 p-4"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-700"><Clock3 size={15} /> Scheduled Start</div><p className="mt-1 text-sm font-bold text-slate-800">{formatDateTime(exam.startDate)}</p></div>
                  )}

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

                  <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-green-700"><Timer size={15} /> Time Remaining</div><span className="text-sm font-black text-green-800">{formatCountdown(exam.deadlineDate, nowTick)}</span></div><p className="mt-2 text-xs font-semibold text-green-700">Deadline: {formatDateTime(exam.deadlineDate)}</p></div>

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

        {/* =================================================
            EXPIRED SECTION
        ================================================= */}
        <section className="mt-12 border-t border-slate-100 pt-10">
          <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-red-500">Section 03</p><h2 className="mt-1 text-xl font-bold text-slate-900">Expired Exams</h2><p className="mt-1 text-sm text-slate-500">Exams whose deadline has passed. Edit the schedule before publishing an expired exam again.</p></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {expiredExams.length === 0 && <div className="md:col-span-2 rounded-2xl border border-dashed border-red-200 bg-red-50/30 p-10 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600"><Timer size={24} /></div><h3 className="mt-4 font-bold text-slate-800">No expired exams</h3><p className="mt-1 text-sm text-slate-500">Expired examinations will appear here automatically.</p></div>}
            {expiredExams.map((exam) => <div key={exam._id} className="rounded-2xl border border-red-100 bg-gradient-to-br from-white to-red-50/40 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-red-700">Expired</span><h3 className="mt-3 text-lg font-bold text-slate-900">{exam.title}</h3><p className="mt-1 text-sm text-slate-500">{exam.department}</p></div><span className="rounded-xl bg-purple-100 px-3 py-2 text-xs font-bold text-purple-700">{exam.mode}</span></div><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-white p-3"><p className="text-slate-400">Started</p><p className="mt-1 font-bold text-slate-800">{formatDateTime(exam.startDate)}</p></div><div className="rounded-xl bg-white p-3"><p className="text-slate-400">Deadline</p><p className="mt-1 font-bold text-slate-800">{formatDateTime(exam.deadlineDate)}</p></div></div><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => openEdit(exam)} className="rounded-xl bg-purple-100 px-4 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-200">Edit</button><button type="button" onClick={() => changePublication(exam, "publish")} className="rounded-xl bg-green-100 px-4 py-2.5 text-xs font-bold text-green-700 hover:bg-green-200">Publish</button><button type="button" onClick={() => deleteExam(exam._id)} className="rounded-xl bg-red-100 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-200">Delete</button></div></div>)}
          </div>
        </section>

      </div>

    </div>
  );
};

export default ExamSections;

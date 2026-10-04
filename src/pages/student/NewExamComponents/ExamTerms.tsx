import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

const ExamTerms = () => {
  const navigate = useNavigate();
  const { examId } = useParams();

  const [agreed, setAgreed] = useState(false);

  const handleStart = () => {
    if (!agreed || !examId) {
      return;
    }

    sessionStorage.setItem(`scorewell-exam-access-${examId}`, "1");

    navigate(`/student/exams/${examId}/attempt`);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-purple-50/60 via-white to-orange-50/40">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-orange-500 text-2xl font-bold text-white shadow-lg shadow-purple-200">
            !
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
            Examination Instructions
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Before You Begin
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Please read the following examination rules carefully before
            starting your examination.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-xl shadow-purple-100/40">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6 text-white sm:px-8">
            <h2 className="text-xl font-bold">
              Examination Terms & Conditions
            </h2>

            <p className="mt-1 text-sm text-purple-100">
              Your examination will begin immediately after you agree and
              continue.
            </p>
          </div>

          <div className="space-y-4 p-6 sm:p-8">
            <div className="flex gap-4 rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 font-bold text-purple-700">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Attempt Limit</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  You must complete the examination within the allowed number of
                  attempts assigned to you.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 font-bold text-orange-600">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Examination Timer</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  The examination timer starts when your attempt begins. The
                  examination may be automatically submitted when the allotted
                  time expires.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 font-bold text-purple-700">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-800">No Cheating</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Any attempt to use unauthorized assistance, communicate with
                  others, or manipulate the examination process is prohibited.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 font-bold text-orange-600">
                4
              </div>
              <div>
                <h3 className="font-bold text-slate-800">
                  Browser & Tab Activity
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Do not switch browser tabs, leave the examination page, or use
                  unauthorized browser activity during the examination. Such
                  activity may result in automatic submission.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 font-bold text-purple-700">
                5
              </div>
              <div>
                <h3 className="font-bold text-slate-800">
                  Stable Internet Connection
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Make sure you have a stable internet connection before
                  starting. Avoid refreshing or closing the examination page
                  unnecessarily.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 font-bold text-orange-600">
                6
              </div>
              <div>
                <h3 className="font-bold text-slate-800">
                  Malicious Behaviour
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Repeated suspicious browser activity or attempts to interfere
                  with the examination may cause the attempt to be submitted
                  automatically.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 p-6 sm:p-8">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="mt-1 h-5 w-5 cursor-pointer rounded border-purple-300 text-purple-600 focus:ring-purple-500"
              />

              <span className="text-sm leading-6 text-slate-600">
                I have read and understood the examination rules and agree to
                follow all the terms and conditions.
              </span>
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/student/new-exams")}
                className="rounded-xl border border-purple-200 bg-white px-6 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
              >
                Go Back
              </button>

              <button
                type="button"
                disabled={!agreed}
                onClick={handleStart}
                className={`rounded-xl px-7 py-3 text-sm font-bold transition ${
                  agreed
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-200 hover:from-purple-700 hover:to-purple-800"
                    : "cursor-not-allowed bg-slate-200 text-slate-400"
                }`}
              >
                I Agree & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamTerms;

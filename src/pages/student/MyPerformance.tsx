import { Link } from "react-router-dom";

const MyPerformance = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

      <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-lg shadow-purple-100/40 sm:p-8">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">
              Student Performance
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              My Attempts
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View your examination attempts, scores and performance.
            </p>

          </div>


          <Link
            to="/student"
            className="inline-flex w-fit rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
          >
            Back to Dashboard
          </Link>

        </div>


        <div className="mt-8 rounded-2xl border border-dashed border-purple-200 bg-gradient-to-br from-purple-50/70 via-white to-orange-50/50 p-8 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-orange-100 text-xl font-bold text-purple-700">
            A
          </div>


          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Attempt History
          </h2>


          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Your completed and submitted examination attempts
            will be loaded from MongoDB and displayed here.
          </p>

        </div>

      </div>

    </div>
  );
};

export default MyPerformance;
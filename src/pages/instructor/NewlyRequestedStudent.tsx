import { Link } from "react-router-dom";

const NewlyRequestedStudent = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

      <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-lg shadow-purple-100/40 sm:p-8">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
              Student Management
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Newly Requested Student
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review and manage newly requested student accounts.
            </p>
          </div>

          <Link
            to="/instructor"
            className="inline-flex w-fit rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
          >
            Back to Dashboard
          </Link>

        </div>


        <div className="mt-8 rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-8 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-xl font-bold text-orange-700">
            R
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Student Requests
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Newly registered students requiring instructor
            permission will be displayed here.
          </p>

        </div>

      </div>

    </div>
  );
};

export default NewlyRequestedStudent;
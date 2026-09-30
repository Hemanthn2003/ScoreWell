import {
  CircleCheck,
  CircleX,
  X,
} from "lucide-react";
import type { LoggedInUser } from "./types";

export interface QuestionSetHeaderProps {
  user: LoggedInUser | null;
  error: string;
  success: string;
  setError: (value: string) => void;
}

const QuestionSetHeader = ({
  user,
  error,
  success,
  setError,
}: QuestionSetHeaderProps) => (
  <>
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
  </>
);

export default QuestionSetHeader;

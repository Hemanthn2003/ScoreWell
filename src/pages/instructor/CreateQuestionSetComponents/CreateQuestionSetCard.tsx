import { Plus } from "lucide-react";

export interface CreateQuestionSetCardProps {
  handleCreateNew: () => void;
}

const CreateQuestionSetCard = ({
  handleCreateNew,
}: CreateQuestionSetCardProps) => (
  <section className="mt-6">
    <button
      type="button"
      onClick={handleCreateNew}
      className="group relative w-full overflow-hidden rounded-3xl border-2 border-dashed border-purple-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-100 sm:p-8"
    >
      <div className="relative z-10 flex flex-col items-center justify-between gap-5 sm:flex-row">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-lg shadow-purple-200 transition group-hover:scale-105">
            <Plus size={30} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-purple-500">
              Question Bank
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-900">
              Create New Question Set
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add questions, options, answer types and correct answers.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-100 transition group-hover:bg-orange-600">
          Create New
        </div>
      </div>
    </button>
  </section>
);

export default CreateQuestionSetCard;

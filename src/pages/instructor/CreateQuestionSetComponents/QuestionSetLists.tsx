import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Edit3,
  Loader2,
  Send,
  RotateCcw,
  Trash2,
} from "lucide-react";
import type { QuestionSet } from "./types";

export interface QuestionSetListsProps {
  isLoadingSets: boolean;
  draftSets: QuestionSet[];
  publishedSets: QuestionSet[];
  expandedSetId: string | null;
  actionId: string | null;
  handleEditSet: (questionSet: QuestionSet) => void;
  handlePublish: (id: string) => void;
  handleUnpublish: (id: string) => void;
  handleDeleteSet: (id: string) => void;
  toggleSet: (id: string) => void;
}

const QuestionSetLists = ({
  isLoadingSets,
  draftSets,
  publishedSets,
  expandedSetId,
  actionId,
  handleEditSet,
  handlePublish,
  handleUnpublish,
  handleDeleteSet,
  toggleSet,
}: QuestionSetListsProps) => (
  <>
        <section className="mt-8">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-500">
                Drafts
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-900">
                Unpublished Question Sets
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Question sets saved by you but not
                currently published.
              </p>
            </div>

            <div className="rounded-xl bg-orange-100 px-3 py-2 text-sm font-black text-orange-700">
              {draftSets.length}
            </div>

          </div>

          {isLoadingSets ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <Loader2
                size={28}
                className="mx-auto animate-spin text-purple-600"
              />

              <p className="mt-3 text-sm font-semibold text-slate-500">
                Loading question sets...
              </p>
            </div>
          ) : draftSets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-8 text-center">

              <p className="text-sm font-bold text-slate-700">
                No unpublished question sets.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Your newly created question sets
                will appear here.
              </p>

            </div>
          ) : (
            <div className="space-y-4">

              {draftSets.map(
                (questionSet) => {
                  const expanded =
                    expandedSetId ===
                    questionSet._id;

                  return (
                    <div
                      key={
                        questionSet._id
                      }
                      className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:shadow-md"
                    >

                      <div className="p-5">

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                          <div className="flex items-start gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                              <BookOpen
                                size={22}
                              />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">

                                <h3 className="text-base font-black text-slate-900">
                                  {
                                    questionSet.questionSetName
                                  }
                                </h3>

                                <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-black uppercase text-orange-700">
                                  Draft
                                </span>

                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  questionSet.department
                                }
                              </p>

                              <p className="mt-1 text-xs font-semibold text-purple-600">
                                {
                                  questionSet.questions
                                    .length
                                }{" "}
                                questions
                              </p>
                            </div>

                          </div>

                          <div className="flex flex-wrap gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleEditSet(
                                  questionSet
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-50"
                            >
                              <Edit3
                                size={14}
                              />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handlePublish(
                                  questionSet._id
                                )
                              }
                              disabled={
                                actionId ===
                                questionSet._id
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-700 disabled:opacity-60"
                            >
                              {actionId ===
                              questionSet._id ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Send
                                  size={14}
                                />
                              )}
                              Publish
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteSet(
                                  questionSet._id
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50"
                            >
                              <Trash2
                                size={14}
                              />
                              Delete
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                toggleSet(
                                  questionSet._id
                                )
                              }
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                            >
                              {expanded ? (
                                <ChevronUp
                                  size={16}
                                />
                              ) : (
                                <ChevronDown
                                  size={16}
                                />
                              )}
                            </button>

                          </div>

                        </div>

                        {expanded && (
                          <div className="mt-5 border-t border-slate-100 pt-4">

                            <div className="space-y-3">

                              {questionSet.questions.map(
                                (
                                  question,
                                  index
                                ) => (
                                  <div
                                    key={
                                      question._id ||
                                      index
                                    }
                                    className="rounded-xl bg-slate-50 p-4"
                                  >
                                    <div className="flex gap-3">

                                      <span className="font-black text-purple-600">
                                        {index +
                                          1}
                                        .
                                      </span>

                                      <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                          {
                                            question.question
                                          }
                                        </p>

                                        <div className="mt-2 flex flex-wrap gap-2">
                                          <span className="rounded-full bg-purple-100 px-2 py-1 text-[10px] font-bold text-purple-700">
                                            {
                                              question.questionType
                                            }
                                          </span>

                                          <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">
                                            Answer:{" "}
                                            {
                                              question
                                                .answer
                                                .join(
                                                  ", "
                                                )
                                            }
                                          </span>
                                        </div>
                                      </div>

                                    </div>
                                  </div>
                                )
                              )}

                            </div>

                          </div>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* =================================================
            PUBLISHED
        ================================================= */}

        <section className="mt-10 pb-10">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-purple-500">
                Published
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-900">
                Published Question Sets
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Question sets currently available for
                examination creation.
              </p>
            </div>

            <div className="rounded-xl bg-purple-100 px-3 py-2 text-sm font-black text-purple-700">
              {publishedSets.length}
            </div>

          </div>

          {publishedSets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 p-8 text-center">

              <CircleCheck
                size={30}
                className="mx-auto text-purple-300"
              />

              <p className="mt-3 text-sm font-bold text-slate-700">
                No published question sets.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Publish a draft to make it appear here.
              </p>

            </div>
          ) : (
            <div className="space-y-4">

              {publishedSets.map(
                (questionSet) => {
                  const expanded =
                    expandedSetId ===
                    questionSet._id;

                  return (
                    <div
                      key={
                        questionSet._id
                      }
                      className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm transition hover:shadow-md"
                    >

                      <div className="p-5">

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                          <div className="flex items-start gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                              <BookOpen
                                size={22}
                              />
                            </div>

                            <div>

                              <div className="flex flex-wrap items-center gap-2">

                                <h3 className="text-base font-black text-slate-900">
                                  {
                                    questionSet.questionSetName
                                  }
                                </h3>

                                <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-black uppercase text-green-700">
                                  Published
                                </span>

                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  questionSet.department
                                }
                              </p>

                              <p className="mt-1 text-xs font-semibold text-purple-600">
                                {
                                  questionSet.questions
                                    .length
                                }{" "}
                                questions
                              </p>

                            </div>

                          </div>

                          <div className="flex flex-wrap gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleEditSet(
                                  questionSet
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-50"
                            >
                              <Edit3
                                size={14}
                              />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleUnpublish(
                                  questionSet._id
                                )
                              }
                              disabled={
                                actionId ===
                                questionSet._id
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
                            >
                              {actionId ===
                              questionSet._id ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <RotateCcw
                                  size={14}
                                />
                              )}
                              Unpublish
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                toggleSet(
                                  questionSet._id
                                )
                              }
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                            >
                              {expanded ? (
                                <ChevronUp
                                  size={16}
                                />
                              ) : (
                                <ChevronDown
                                  size={16}
                                />
                              )}
                            </button>

                          </div>

                        </div>

                        {expanded && (
                          <div className="mt-5 border-t border-slate-100 pt-4">

                            <div className="space-y-3">

                              {questionSet.questions.map(
                                (
                                  question,
                                  index
                                ) => (
                                  <div
                                    key={
                                      question._id ||
                                      index
                                    }
                                    className="rounded-xl bg-slate-50 p-4"
                                  >
                                    <div className="flex gap-3">

                                      <span className="font-black text-purple-600">
                                        {index +
                                          1}
                                        .
                                      </span>

                                      <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                          {
                                            question.question
                                          }
                                        </p>

                                        <div className="mt-2 flex flex-wrap gap-2">
                                          <span className="rounded-full bg-purple-100 px-2 py-1 text-[10px] font-bold text-purple-700">
                                            {
                                              question.questionType
                                            }
                                          </span>

                                          <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">
                                            Answer:{" "}
                                            {
                                              question
                                                .answer
                                                .join(
                                                  ", "
                                                )
                                            }
                                          </span>
                                        </div>
                                      </div>

                                    </div>
                                  </div>
                                )
                              )}

                            </div>

                          </div>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>
  </>
);

export default QuestionSetLists;

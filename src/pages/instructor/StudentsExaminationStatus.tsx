import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  Clock3,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";

import type {
  AttemptDetails,
  ExaminationStatusData,
  StatusTab,
} from "./StudentsExaminationStatusComponents/types";

import ResultCard from "./StudentsExaminationStatusComponents/ResultCard";
import DetailModal from "./StudentsExaminationStatusComponents/DetailModal";
import StatusTabButton from "./StudentsExaminationStatusComponents/StatusTabButton";
import SectionHeader from "./StudentsExaminationStatusComponents/SectionHeader";
import IncompleteCard from "./StudentsExaminationStatusComponents/IncompleteCard";
import EmptyState from "./StudentsExaminationStatusComponents/EmptyState";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const StudentsExaminationStatus = () => {
  const [data, setData] =
    useState<ExaminationStatusData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedAttempt, setSelectedAttempt] =
    useState<AttemptDetails | null>(null);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [detailError, setDetailError] =
    useState("");

  const [activeTab, setActiveTab] =
    useState<StatusTab>("UNATTEMPTED");

  const initialLoadDone = useRef(false);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/examination-status`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to load examination status."
        );
      }

      setData(result.data);
    } catch (err) {
      console.error(
        "Examination status error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load examination status."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialLoadDone.current) {
      return;
    }

    initialLoadDone.current = true;
    void loadStatus();
  }, []);

  const openAttempt = async (
    attemptId?: string
  ) => {
    if (!attemptId) {
      return;
    }

    try {
      setDetailLoading(true);
      setDetailError("");

      const response = await fetch(
        `${API_URL}/api/examination-status/attempt/${attemptId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to load attempt details."
        );
      }

      setSelectedAttempt(result.data);
    } catch (err) {
      console.error(
        "Attempt detail error:",
        err
      );

      setDetailError(
        err instanceof Error
          ? err.message
          : "Unable to load attempt details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto flex max-w-7xl items-center justify-center py-32">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
              <Loader2
                size={28}
                className="animate-spin"
              />
            </div>

            <h2 className="mt-5 text-lg font-extrabold text-slate-900">
              Loading Examination Status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Fetching student examination activity...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={28} />
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-slate-900">
              Unable to Load Status
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadStatus}
              className="mt-6 rounded-xl bg-purple-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const incomplete =
    data?.incomplete ?? [];

  const specialResults =
    data?.privateResults ?? [];

  const commonResults =
    data?.commonResults ?? [];

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* HEADER */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800 via-purple-700 to-orange-500 p-6 text-white shadow-lg sm:p-8">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />

            <div className="absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-orange-300/20 blur-3xl" />

            <div className="relative flex items-start justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 text-purple-100">
                  <ShieldCheck size={17} />

                  <span className="text-xs font-bold uppercase tracking-[0.16em]">
                    Instructor Analytics
                  </span>
                </div>

                <h1 className="mt-3 text-2xl font-black sm:text-3xl">
                  Students Examination Status
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                  Track untouched examinations,
                  in-progress attempts, special
                  examinations and common examination
                  results.
                </p>
              </div>

              <button
                type="button"
                onClick={loadStatus}
                className="hidden rounded-xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/25 sm:block"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* TABS */}
          <div className="sticky top-2 z-20 mt-6 rounded-2xl border border-purple-100 bg-white/95 p-2 shadow-lg shadow-purple-100/40 backdrop-blur">
            <div className="grid grid-cols-3 gap-1">

              <StatusTabButton
                active={
                  activeTab === "UNATTEMPTED"
                }
                onClick={() =>
                  setActiveTab("UNATTEMPTED")
                }
                icon={<Clock3 size={17} />}
                label="Unattempted"
                count={incomplete.length}
              />

              <StatusTabButton
                active={
                  activeTab === "SPECIAL"
                }
                onClick={() =>
                  setActiveTab("SPECIAL")
                }
                icon={
                  <ShieldCheck size={17} />
                }
                label="Special Exams"
                count={specialResults.length}
              />

              <StatusTabButton
                active={
                  activeTab === "COMMON"
                }
                onClick={() =>
                  setActiveTab("COMMON")
                }
                icon={<Users size={17} />}
                label="Common Exams"
                count={commonResults.length}
              />

            </div>
          </div>

          {/* CONTENT */}
          <section className="mt-7">

            {activeTab === "UNATTEMPTED" && (
              <>
                <SectionHeader
                  title="Unattempted & Incomplete"
                  description="Students who have not completed their assigned examination."
                  count={incomplete.length}
                  icon={<Clock3 size={20} />}
                />

                {incomplete.length === 0 ? (
                  <EmptyState
                    title="No incomplete examinations"
                    description="All currently assigned examinations have been completed or there are no pending attempts."
                  />
                ) : (
                  <div className="grid gap-5">
                    {incomplete.map((item) => (
                      <IncompleteCard
                        key={`${item.examId}-${item.studentId}`}
                        item={item}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "SPECIAL" && (
              <>
                <SectionHeader
                  title="Special Examination Results"
                  description="Completed results from individually assigned examinations."
                  count={specialResults.length}
                  icon={
                    <ShieldCheck size={20} />
                  }
                />

                {specialResults.length === 0 ? (
                  <EmptyState
                    title="No special examination results"
                    description="Completed special examination attempts will appear here."
                  />
                ) : (
                  <div className="grid gap-5 xl:grid-cols-2">
                    {specialResults.map((item) => (
                      <ResultCard
                        key={
                          item.attemptId ??
                          `${item.examId}-${item.studentId}`
                        }
                        item={item}
                        onClick={() =>
                          openAttempt(
                            item.attemptId
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "COMMON" && (
              <>
                <SectionHeader
                  title="Common Examination Results"
                  description="Completed results from examinations available to the department."
                  count={commonResults.length}
                  icon={<Users size={20} />}
                />

                {commonResults.length === 0 ? (
                  <EmptyState
                    title="No common examination results"
                    description="Completed common examination attempts will appear here."
                  />
                ) : (
                  <div className="grid gap-5 xl:grid-cols-2">
                    {commonResults.map((item) => (
                      <ResultCard
                        key={
                          item.attemptId ??
                          `${item.examId}-${item.studentId}`
                        }
                        item={item}
                        onClick={() =>
                          openAttempt(
                            item.attemptId
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            )}

          </section>
        </div>
      </div>

      {/* DETAIL LOADING */}
      {detailLoading && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="rounded-2xl bg-white px-7 py-6 text-center shadow-2xl">
            <Loader2
              size={30}
              className="mx-auto animate-spin text-purple-700"
            />

            <p className="mt-3 text-sm font-bold text-slate-700">
              Loading examination details...
            </p>
          </div>
        </div>
      )}

      {/* DETAIL ERROR */}
      {detailError && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={28} />
            </div>

            <h3 className="mt-4 text-lg font-extrabold text-slate-900">
              Unable to Open Result
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {detailError}
            </p>

            <button
              type="button"
              onClick={() =>
                setDetailError("")
              }
              className="mt-5 rounded-xl bg-purple-700 px-6 py-3 text-sm font-bold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedAttempt && (
        <DetailModal
          data={selectedAttempt}
          onClose={() =>
            setSelectedAttempt(null)
          }
        />
      )}
    </>
  );
};

export default StudentsExaminationStatus;
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import PerformanceHero from "./MyPerformanceComponents/PerformanceHero";
import PerformanceStats from "./MyPerformanceComponents/PerformanceStats";
import ResultTabs from "./MyPerformanceComponents/ResultTabs";
import ExamResultCard from "./MyPerformanceComponents/ExamResultCard";
import UpcomingResultCard from "./MyPerformanceComponents/UpcomingResultCard";
import PerformanceDetailModal from "./MyPerformanceComponents/PerformanceDetailModal";
import UpcomingPerformanceDetailModal from "./MyPerformanceComponents/UpcomingPerformanceDetailModal";
import EmptyPerformanceState from "./MyPerformanceComponents/EmptyPerformanceState";

import type {
  PerformanceAttempt,
  PerformanceOverview,
  StudentPerformanceResponse,
} from "./MyPerformanceComponents/types";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

type TabType = "RESULTS" | "UPCOMING";

const MyPerformance = () => {
  const [data, setData] =
    useState<StudentPerformanceResponse | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string>("");

  const [activeTab, setActiveTab] =
    useState<TabType>("RESULTS");

  const [selectedExam, setSelectedExam] =
    useState<PerformanceAttempt | null>(null);

  const [
    selectedUpcomingExam,
    setSelectedUpcomingExam,
  ] = useState<PerformanceAttempt | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/student-performance`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const result =
          (await response.json()) as StudentPerformanceResponse & {
            message?: string;
          };

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to load performance."
          );
        }

        setData(result);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load performance.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchPerformance();
  }, []);

  /*
   * Only EXPIRED and CLOSED examinations
   * are included in the student's completed
   * performance.
   */
  const completedResults = useMemo(() => {
    const results = data?.examResults ?? [];

    return results.filter(
      (item) =>
        item.exam.status === "EXPIRED" ||
        item.exam.status === "CLOSED"
    );
  }, [data]);

  /*
   * Overall performance shown in the Hero
   * and Statistics sections is calculated
   * ONLY from EXPIRED/CLOSED examinations.
   */
  const completedOverview =
    useMemo<PerformanceOverview>(() => {
      if (completedResults.length === 0) {
        return {
          totalExams: 0,
          totalAttempts: 0,
          averagePercentage: 0,
          totalScore: 0,
          totalMarks: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          unanswered: 0,
          completedExams: 0,
          commonExams: 0,
          specialExams: 0,
          strictExams: 0,
        };
      }

      const totalScore =
        completedResults.reduce(
          (sum, item) =>
            sum +
            Number(
              item.attempt.score || 0
            ),
          0
        );

      const totalMarks =
        completedResults.reduce(
          (sum, item) =>
            sum +
            Number(
              item.attempt.totalMarks || 0
            ),
          0
        );

      const correctAnswers =
        completedResults.reduce(
          (sum, item) =>
            sum +
            Number(
              item.attempt.correctAnswers ||
                0
            ),
          0
        );

      const wrongAnswers =
        completedResults.reduce(
          (sum, item) =>
            sum +
            Number(
              item.attempt.wrongAnswers || 0
            ),
          0
        );

      const unanswered =
        completedResults.reduce(
          (sum, item) =>
            sum +
            Number(
              item.attempt.unanswered || 0
            ),
          0
        );

      const averagePercentage =
        completedResults.reduce(
          (sum, item) =>
            sum +
            Number(
              item.attempt.percentage || 0
            ),
          0
        ) / completedResults.length;

      const commonExams =
        completedResults.filter(
          (item) =>
            item.exam.examType === "COMMON"
        ).length;

      const specialExams =
        completedResults.filter(
          (item) =>
            item.exam.examType === "SPECIAL"
        ).length;

      const strictExams =
        completedResults.filter(
          (item) =>
            item.exam.examMode === "STRICT"
        ).length;

      return {
        totalExams:
          completedResults.length,

        totalAttempts:
          completedResults.length,

        averagePercentage: Number(
          averagePercentage.toFixed(2)
        ),

        totalScore,

        totalMarks,

        correctAnswers,

        wrongAnswers,

        unanswered,

        completedExams:
          completedResults.length,

        commonExams,

        specialExams,

        strictExams,
      };
    }, [completedResults]);

  /*
   * Published/upcoming examinations are
   * kept completely separate from completed
   * performance.
   */
  const upcomingResults =
    data?.upcomingResults ?? [];

  const handleResultClick = (
    exam: PerformanceAttempt
  ) => {
    setSelectedExam(exam);
  };

  const handleUpcomingClick = (
    exam: PerformanceAttempt
  ) => {
    setSelectedUpcomingExam(exam);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/40 to-orange-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">
            <Loader2 className="h-7 w-7 animate-spin text-purple-600" />
          </div>

          <p className="text-sm font-semibold text-gray-600">
            Loading your performance...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/40 to-orange-50/30 flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            Unable to load performance
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white">
        <EmptyPerformanceState
          title="No performance data"
          description="There is no performance information available at the moment."
        />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-orange-50/20">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* HERO */}
          <PerformanceHero
            student={data.student}
            overview={completedOverview}
          />

          {/* STATISTICS */}
          <div className="mt-6">
            <PerformanceStats
              overview={completedOverview}
            />
          </div>

          {/* TABS */}
          <div className="mt-8">
            <ResultTabs
              activeTab={activeTab}
              onChange={setActiveTab}
              resultCount={
                completedResults.length
              }
              upcomingCount={
                upcomingResults.length
              }
            />
          </div>

          {/* COMPLETED RESULTS */}
          {activeTab === "RESULTS" && (
            <section className="mt-6">
              {completedResults.length ===
              0 ? (
                <EmptyPerformanceState
                  title="No completed examinations"
                  description="Your expired or closed examination results will appear here."
                />
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {completedResults.map(
                    (item) => (
                      <ExamResultCard
                        key={item._id}
                        item={item}
                        onClick={() =>
                          handleResultClick(
                            item
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}
            </section>
          )}

          {/* UPCOMING RESULTS */}
          {activeTab === "UPCOMING" && (
            <section className="mt-6">
              {upcomingResults.length ===
              0 ? (
                <EmptyPerformanceState
                  title="No upcoming examinations"
                  description="Published examinations will appear here when available."
                />
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {upcomingResults.map(
                    (item) => (
                      <UpcomingResultCard
                        key={item._id}
                        item={item}
                        onClick={() =>
                          handleUpcomingClick(
                            item
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* COMPLETED EXAM RESULT MODAL */}
      {selectedExam && (
        <PerformanceDetailModal
          item={selectedExam}
          onClose={() =>
            setSelectedExam(null)
          }
        />
      )}

      {/* UPCOMING EXAM DETAIL MODAL */}
      {selectedUpcomingExam && (
        <UpcomingPerformanceDetailModal
          item={selectedUpcomingExam}
          onClose={() =>
            setSelectedUpcomingExam(null)
          }
        />
      )}
    </>
  );
};

export default MyPerformance;
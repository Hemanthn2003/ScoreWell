import type { Request, Response } from "express";

import mongoose from "mongoose";

import User from "../models/User";

import Exam from "../models/Exam";

import Attempt from "../models/Attempt";

import SpecialExamStudent from "../models/SpecialExamStudent";

import StrictExam from "../models/StrictExam";

type ExamStatus = "UNPUBLISHED" | "PUBLISHED" | "EXPIRED" | "CLOSED";

type ExamMode = "COMMON" | "SPECIAL";

type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "AUTO_SUBMITTED";

interface DashboardExam {
  id: string;

  title: string;

  description: string;

  department: string;

  durationMinutes: number;

  questionCount: number;

  marksPerQuestion: number;

  negativeMarking: {
    enabled: boolean;

    penalty: number;
  };

  mode: ExamMode;

  status: ExamStatus;

  startDate: string | null;

  deadlineDate: string | null;

  strictMode: boolean;

  strictDeadlineDate: string | null;

  strictAttemptChances: number | null;

  maxAttempts: number;

  attemptsUsed: number;

  attemptsRemaining: number;

  eligibility: "COMMON" | "SPECIAL";

  canAttempt: boolean;
}

interface DashboardAttempt {
  id: string;

  examId: string;

  examName: string;

  department: string;

  mode: ExamMode;

  status: AttemptStatus;

  attemptNo: number;

  startTime: string;

  submittedAt: string | null;

  timeTakenSeconds: number;

  score: number | null;

  totalMarks: number | null;

  percentage: number | null;

  resultAvailable: boolean;

  examStatus: ExamStatus;
}

interface StudentDashboardResponse {
  success: boolean;

  student: {
    id: string;

    name: string;

    email: string;

    department: string;
  };

  statistics: {
    availableExams: number;

    completedExams: number;

    missedExams: number;

    pendingExams: number;
  };

  averageScore: {
    percentage: number;

    score: number;

    totalMarks: number;

    examsCounted: number;
  };

  availableExams: DashboardExam[];

  recentAttempts: DashboardAttempt[];
}

/* =========================================================

   EXAM STATUS SYNC

\========================================================= */

const syncExamStatuses = async (): Promise<void> => {
  const now = new Date();

  await Exam.updateMany(
    {
      status: "UNPUBLISHED",

      startDate: {
        $ne: null,

        $lte: now,
      },
    },

    {
      $set: {
        status: "PUBLISHED",
      },
    },
  );

  await Exam.updateMany(
    {
      status: "PUBLISHED",

      deadlineDate: {
        $ne: null,

        $lte: now,
      },
    },

    {
      $set: {
        status: "EXPIRED",
      },
    },
  );
};

/* =========================================================

   GET STUDENT

\========================================================= */

const getStudent = async (req: Request) => {
  if (!req.user) {
    return null;
  }

  if (req.user.role !== "STUDENT") {
    return null;
  }

  return User.findOne({
    _id: req.user.userId,

    role: "STUDENT",

    isActive: true,
  }).lean();
};

/* =========================================================

   GET STUDENT DASHBOARD

\========================================================= */

export const getStudentDashboard = async (
  req: Request,

  res: Response,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "STUDENT") {
      res.status(403).json({
        success: false,

        message: "Student access required.",
      });

      return;
    }

    const student = await getStudent(req);

    if (!student) {
      res.status(404).json({
        success: false,

        message: "Student account was not found.",
      });

      return;
    }

    if (!student.department) {
      res.status(400).json({
        success: false,

        message: "Student department is not configured.",
      });

      return;
    } /*

     * Synchronize scheduled exam statuses

     * before calculating dashboard data.

     */

    await syncExamStatuses();

    const studentId = new mongoose.Types.ObjectId(student._id);

    const department =
      student.department; /* =====================================================

       GET ALL RELEVANT EXAMS



       We use department exams because common

       exams are department-specific.



       Special exams are also required from

       this department because assignments

       determine individual eligibility.

    ===================================================== */

    const exams = await Exam.find({
      department,

      status: {
        $in: ["PUBLISHED", "EXPIRED", "CLOSED"],
      },
    })

      .sort({
        deadlineDate: 1,

        _id: -1,
      })

      .lean();

    if (exams.length === 0) {
      const emptyResponse: StudentDashboardResponse = {
        success: true,

        student: {
          id: student._id.toString(),

          name: student.name,

          email: student.email,

          department,
        },

        statistics: {
          availableExams: 0,

          completedExams: 0,

          missedExams: 0,

          pendingExams: 0,
        },

        averageScore: {
          percentage: 0,

          score: 0,

          totalMarks: 0,

          examsCounted: 0,
        },

        availableExams: [],

        recentAttempts: [],
      };

      res.status(200).json(emptyResponse);

      return;
    }

    const examIds = exams.map(
      (exam) => exam._id,
    ); /* =====================================================

       SPECIAL ASSIGNMENTS

    ===================================================== */

    const specialAssignments = await SpecialExamStudent.find({
      examId: {
        $in: examIds,
      },

      studentId: studentId,
    }).lean();

    const specialExamIds = new Set(
      specialAssignments.map((assignment) => assignment.examId.toString()),
    ); /* =====================================================

       STRICT EXAMS

    ===================================================== */

    const strictExams = await StrictExam.find({
      examId: {
        $in: examIds,
      },
    }).lean();

    const strictExamMap = new Map<string, (typeof strictExams)[number]>();

    for (const strictExam of strictExams) {
      strictExamMap.set(
        strictExam.examId.toString(),

        strictExam,
      );
    } /* =====================================================

       STUDENT ATTEMPTS

    ===================================================== */

    const attempts = await Attempt.find({
      studentId: studentId,

      examId: {
        $in: examIds,
      },
    })

      .sort({
        startTime: -1,
      })

      .lean(); /*

     * Group attempts by exam.

     */

    const attemptsByExam = new Map<string, typeof attempts>();

    for (const attempt of attempts) {
      const examKey = attempt.examId.toString();

      const existing = attemptsByExam.get(examKey) ?? [];

      existing.push(attempt);

      attemptsByExam.set(
        examKey,

        existing,
      );
    } /* =====================================================

       ELIGIBILITY

    ===================================================== */

    const isEligible = (
      exam: (typeof exams)[number],
    ): "COMMON" | "SPECIAL" | null => {
      if (exam.department !== department) {
        return null;
      }

      if (exam.mode === "SPECIAL") {
        return specialExamIds.has(exam._id.toString()) ? "SPECIAL" : null;
      }

      return "COMMON";
    }; /* =====================================================

       DASHBOARD ARRAYS

    ===================================================== */

    const availableExams: DashboardExam[] = [];

    const completedExamKeys = new Set<string>();

    const missedExamKeys = new Set<string>();

    const pendingExamKeys = new Set<string>(); /*

     * Only completed EXPIRED/CLOSED

     * attempts are used for score analytics.

     */

    const completedAttemptsForAnalytics: typeof attempts =
      []; /* =====================================================

       PROCESS EVERY ELIGIBLE EXAM

    ===================================================== */

    for (const exam of exams) {
      const examKey = exam._id.toString();

      const eligibility = isEligible(exam);

      if (!eligibility) {
        continue;
      }

      const examAttempts = attemptsByExam.get(examKey) ?? [];

      const strictExam = strictExamMap.get(examKey);

      const attemptsUsed = examAttempts.length;

      const attemptsRemaining = Math.max(
        0,

        Number(exam.maxAttempts || 1) - attemptsUsed,
      ); /*

       * A completed attempt means:

       * SUBMITTED or AUTO_SUBMITTED.

       */

      const completedAttempts = examAttempts.filter(
        (attempt) =>
          attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED",
      ); /*

       * Available means:

       *

       * - PUBLISHED

       * - student eligible

       * - attempts remain

       *

       * Strict deadline is also respected.

       */

      let strictDeadlinePassed = false;

      if (strictExam?.deadlineDate) {
        strictDeadlinePassed =
          new Date(strictExam.deadlineDate).getTime() <= Date.now();
      }

      const canAttempt =
        exam.status === "PUBLISHED" &&
        attemptsRemaining > 0 &&
        !strictDeadlinePassed;

      if (canAttempt) {
        availableExams.push({
          id: examKey,

          title: exam.title,

          description: exam.description ?? "",

          department: exam.department,

          durationMinutes: exam.durationMinutes,

          questionCount: exam.questionCount,

          marksPerQuestion: exam.marksPerQuestion,

          negativeMarking: {
            enabled: Boolean(exam.negativeMarking?.enabled),

            penalty: Number(exam.negativeMarking?.penalty ?? 0),
          },

          mode: exam.mode,

          status: exam.status,

          startDate: exam.startDate
            ? new Date(exam.startDate).toISOString()
            : null,

          deadlineDate: exam.deadlineDate
            ? new Date(exam.deadlineDate).toISOString()
            : null,

          strictMode: Boolean(strictExam),

          strictDeadlineDate: strictExam?.deadlineDate
            ? new Date(strictExam.deadlineDate).toISOString()
            : null,

          strictAttemptChances: strictExam
            ? Number(strictExam.attemptChances)
            : null,

          maxAttempts: Number(exam.maxAttempts || 1),

          attemptsUsed,

          attemptsRemaining,

          eligibility,

          canAttempt: true,
        });
      } /* =================================================

         PUBLISHED EXAM

      ================================================= */

      if (exam.status === "PUBLISHED") {
        /*

         * Pending means:

         * eligible + published +

         * absolutely no attempt yet.

         */

        if (examAttempts.length === 0) {
          pendingExamKeys.add(examKey);
        }

        continue;
      } /* =================================================

         EXPIRED / CLOSED

      ================================================= */

      if (exam.status === "EXPIRED" || exam.status === "CLOSED") {
        /*

         * Student completed this exam.

         */

        if (completedAttempts.length > 0) {
          completedExamKeys.add(examKey); /*

           * ONLY expired/closed

           * completed attempts reach

           * score analytics.

           */

          const highestScoringAttempt = [...completedAttempts].sort(
            (a, b) =>
              Number(b.score || 0) - Number(a.score || 0) ||
              Number(b.attemptNo || 1) - Number(a.attemptNo || 1),
          )[0];

          if (highestScoringAttempt) {
            completedAttemptsForAnalytics.push(highestScoringAttempt);
          }
        } else {
          /*

           * No attempt at all means

           * missed exam.

           */

          if (examAttempts.length === 0) {
            missedExamKeys.add(examKey);
          }
        }
      }
    } /* =====================================================

       AVERAGE SCORE

    ===================================================== */

    let totalScore = 0;

    let totalMarks = 0;

    for (const attempt of completedAttemptsForAnalytics) {
      totalScore += Number(attempt.score || 0);

      totalMarks += Number(attempt.totalMarks || 0);
    }

    const averagePercentage =
      totalMarks > 0
        ? Number(((totalScore / totalMarks) * 100).toFixed(2))
        : 0; /* =====================================================

       RECENT ATTEMPTS



       Most recent first.



       Score is exposed ONLY if the

       corresponding exam is EXPIRED/CLOSED.

    ===================================================== */

    const examMap = new Map<string, (typeof exams)[number]>();

    for (const exam of exams) {
      examMap.set(
        exam._id.toString(),

        exam,
      );
    }

    const attemptsForRecent = attempts.filter((attempt) => {
      const exam = examMap.get(attempt.examId.toString());

      if (exam?.status !== "EXPIRED" && exam?.status !== "CLOSED") {
        return true;
      }

      const completedAttemptsForExam = attempts.filter(
        (item) =>
          item.examId.toString() === attempt.examId.toString() &&
          (item.status === "SUBMITTED" || item.status === "AUTO_SUBMITTED"),
      );

      const highestScoringAttempt = [...completedAttemptsForExam].sort(
        (a, b) =>
          Number(b.score || 0) - Number(a.score || 0) ||
          Number(b.attemptNo || 1) - Number(a.attemptNo || 1),
      )[0];

      return highestScoringAttempt?._id.toString() === attempt._id.toString();
    });

    const recentAttempts: DashboardAttempt[] = attemptsForRecent

      .sort((a, b) => {
        const aTime = new Date(a.startTime).getTime();

        const bTime = new Date(b.startTime).getTime();

        return bTime - aTime;
      })

      .slice(0, 12)

      .map((attempt) => {
        const exam = examMap.get(attempt.examId.toString());

        const resultAvailable =
          exam?.status === "EXPIRED" || exam?.status === "CLOSED";

        return {
          id: attempt._id.toString(),

          examId: attempt.examId.toString(),

          examName: attempt.examName || exam?.title || "Examination",

          department:
            exam?.department || attempt.studentDepartment || department,

          mode: exam?.mode || attempt.mode,

          status: attempt.status,

          attemptNo: Number(attempt.attemptNo || 1),

          startTime: new Date(attempt.startTime).toISOString(),

          submittedAt: attempt.submittedAt
            ? new Date(attempt.submittedAt).toISOString()
            : null,

          timeTakenSeconds: Number(attempt.timeTakenSeconds || 0),

          score: resultAvailable ? Number(attempt.score || 0) : null,

          totalMarks: resultAvailable ? Number(attempt.totalMarks || 0) : null,

          percentage:
            resultAvailable && Number(attempt.totalMarks || 0) > 0
              ? Number(
                  (
                    (Number(attempt.score || 0) /
                      Number(attempt.totalMarks || 0)) *
                    100
                  ).toFixed(2),
                )
              : null,

          resultAvailable,

          examStatus: exam?.status || "PUBLISHED",
        };
      }); /* =====================================================

       RESPONSE

    ===================================================== */

    const response: StudentDashboardResponse = {
      success: true,

      student: {
        id: student._id.toString(),

        name: student.name,

        email: student.email,

        department,
      },

      statistics: {
        availableExams: availableExams.length,

        completedExams: completedExamKeys.size,

        missedExams: missedExamKeys.size,

        pendingExams: pendingExamKeys.size,
      },

      averageScore: {
        percentage: averagePercentage,

        score: Number(totalScore.toFixed(2)),

        totalMarks: Number(totalMarks.toFixed(2)),

        examsCounted: completedAttemptsForAnalytics.length,
      },

      availableExams,

      recentAttempts,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(
      "Student dashboard error:",

      error,
    );

    res.status(500).json({
      success: false,

      message: "Failed to load student dashboard.",
    });
  }
};

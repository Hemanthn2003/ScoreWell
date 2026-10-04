import type { Request, Response } from "express";

import mongoose from "mongoose";

import User from "../models/User";

import Exam from "../models/Exam";

import Attempt from "../models/Attempt";

import SpecialExamStudent from "../models/SpecialExamStudent";

import StrictExam from "../models/StrictExam";

interface StudentPerformanceAttempt {
  _id: string;

  examId: string;

  examName: string;

  exam: {
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

    mode: "COMMON" | "SPECIAL";

    status: "UNPUBLISHED" | "PUBLISHED" | "EXPIRED" | "CLOSED";

    startDate: string | null;

    deadlineDate: string | null;

    examType: "COMMON" | "SPECIAL";

    examMode: "NORMAL" | "STRICT";

    strictDeadlineDate: string | null;

    strictAttemptChances: number | null;
  };

  attempt: {
    attemptNo: number;

    startTime: string;

    submittedAt: string | null;

    status: "IN_PROGRESS" | "SUBMITTED" | "AUTO_SUBMITTED";

    score: number;

    totalMarks: number;

    correctAnswers: number;

    wrongAnswers: number;

    unanswered: number;

    timeTakenSeconds: number;

    percentage: number;

    questions: Array<{
      questionId: string;

      question: string;

      options: string[];

      questionType: "SINGLE" | "MULTI";

      selectedAnswers: string[];

      correctAnswers: string[];

      isCorrect: boolean;

      marksAwarded: number;
    }>;
  };

  resultReleaseDate: string | null;
}

const calculatePercentage = (
  score: number,

  totalMarks: number,
): number => {
  if (
    !Number.isFinite(score) ||
    !Number.isFinite(totalMarks) ||
    totalMarks <= 0
  ) {
    return 0;
  }

  return Number(((score / totalMarks) * 100).toFixed(2));
};

/* =========================================================

   SYNC RELEVANT EXAM STATUSES

\========================================================= */

const syncRelevantExamStatuses = async (
  exams: Array<{
    _id: mongoose.Types.ObjectId;

    status: string;

    startDate?: Date | null;

    deadlineDate?: Date | null;
  }>,
): Promise<void> => {
  const now = new Date();

  for (const exam of exams) {
    let nextStatus = exam.status;

    if (exam.deadlineDate && exam.deadlineDate <= now) {
      nextStatus = "EXPIRED";
    } else if (
      exam.startDate &&
      exam.startDate <= now &&
      exam.status === "UNPUBLISHED"
    ) {
      nextStatus = "PUBLISHED";
    }

    if (nextStatus !== exam.status) {
      await Exam.updateOne(
        {
          _id: exam._id,
        },

        {
          $set: {
            status: nextStatus,
          },
        },
      );

      exam.status = nextStatus;
    }
  }
};

/* =========================================================

   GET MY PERFORMANCE

\========================================================= */

export const getMyPerformance = async (
  req: Request,

  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,

        message: "Authentication required.",
      });

      return;
    }

    if (req.user.role !== "STUDENT") {
      res.status(403).json({
        success: false,

        message: "Only students can access performance.",
      });

      return;
    }

    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({
        success: false,

        message: "Invalid student ID.",
      });

      return;
    } /* =====================================================

         CURRENT STUDENT

      ===================================================== */

    const student = await User.findOne({
      _id: userId,

      role: "STUDENT",

      isActive: true,
    }).select("_id name email department isActive isPermitted");

    if (!student) {
      res.status(404).json({
        success: false,

        message: "Student account not found.",
      });

      return;
    } /* =====================================================

         STUDENT ATTEMPTS

      ===================================================== */

    const attempts = await Attempt.find({
      studentId: student._id,
    }).sort({
      startTime: -1,
    });

    const validAttempts = attempts.filter((attempt) => {
      const emailMatches =
        attempt.studentEmail

          .toLowerCase()

          .trim() ===
        student.email

          .toLowerCase()

          .trim();

      const departmentMatches =
        attempt.studentDepartment.trim() === (student.department ?? "").trim();

      return (
        attempt.studentId.toString() === student._id.toString() &&
        emailMatches &&
        departmentMatches
      );
    }); /* =====================================================

         NO ATTEMPTS

      ===================================================== */

    if (validAttempts.length === 0) {
      res.status(200).json({
        success: true,

        student: {
          id: student._id.toString(),

          name: student.name,

          email: student.email,

          department: student.department ?? "",
        },

        overview: {
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
        },

        examResults: [],

        upcomingResults: [],
      });

      return;
    } /* =====================================================

         RELATED EXAMS

      ===================================================== */

    const examIds = validAttempts.map((attempt) => attempt.examId);

    const exams = await Exam.find({
      _id: {
        $in: examIds,
      },
    });

    await syncRelevantExamStatuses(exams);

    const examMap = new Map<string, (typeof exams)[number]>();

    for (const exam of exams) {
      examMap.set(
        exam._id.toString(),

        exam,
      );
    } /* =====================================================

         SPECIAL EXAM ASSIGNMENTS

      ===================================================== */

    const specialAssignments = await SpecialExamStudent.find({
      examId: {
        $in: examIds,
      },

      studentId: student._id,

      studentEmail: student.email,

      studentName: student.name,

      department: student.department,
    });

    const specialExamIds = new Set(
      specialAssignments.map((assignment) => assignment.examId.toString()),
    ); /* =====================================================

         STRICT EXAMS

      ===================================================== */

    const strictExams = await StrictExam.find({
      examId: {
        $in: examIds,
      },
    });

    const strictExamMap = new Map<string, (typeof strictExams)[number]>();

    for (const strictExam of strictExams) {
      strictExamMap.set(
        strictExam.examId.toString(),

        strictExam,
      );
    } /* =====================================================

         SELECT RESULT ATTEMPTS

         For EXPIRED/CLOSED exams, only the highest

         scoring completed attempt for this student

         is counted and displayed.

      ===================================================== */

    const attemptsForResults: typeof validAttempts = [];

    const attemptsByExamForResults = new Map<string, typeof validAttempts>();

    for (const attempt of validAttempts) {
      const examKey = attempt.examId.toString();

      const existing = attemptsByExamForResults.get(examKey) ?? [];

      existing.push(attempt);

      attemptsByExamForResults.set(
        examKey,

        existing,
      );
    }

    for (const [examKey, examAttempts] of attemptsByExamForResults) {
      const exam = examMap.get(examKey);

      if (exam?.status !== "EXPIRED" && exam?.status !== "CLOSED") {
        attemptsForResults.push(...examAttempts);

        continue;
      }

      const completedAttempts = examAttempts.filter(
        (attempt) =>
          attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED",
      );

      const highestScoringAttempt = [...completedAttempts].sort(
        (a, b) =>
          Number(b.score || 0) - Number(a.score || 0) ||
          Number(b.attemptNo || 1) - Number(a.attemptNo || 1),
      )[0];

      if (highestScoringAttempt) {
        attemptsForResults.push(highestScoringAttempt);
      }
    }

    /* =====================================================

         FORMAT ATTEMPTS

      ===================================================== */

    const formattedAttempts: StudentPerformanceAttempt[] = [];

    for (const attempt of attemptsForResults) {
      const exam = examMap.get(attempt.examId.toString());

      if (!exam) {
        continue;
      } /*

         * Department security.

         */

      if (exam.department !== student.department) {
        continue;
      }

      const isSpecial = specialExamIds.has(exam._id.toString());

      const strictExam = strictExamMap.get(exam._id.toString());

      const isStrict = Boolean(strictExam);

      const resultReleaseDate =
        strictExam?.deadlineDate ?? exam.deadlineDate ?? null;

      const totalMarks = Number(attempt.totalMarks) || 0;

      const score = Number(attempt.score) || 0;

      const formatted: StudentPerformanceAttempt = {
        _id: attempt._id.toString(),

        examId: exam._id.toString(),

        examName: attempt.examName || exam.title,

        exam: {
          id: exam._id.toString(),

          title: exam.title,

          description: exam.description,

          department: exam.department,

          durationMinutes: exam.durationMinutes,

          questionCount: exam.questionCount,

          marksPerQuestion: exam.marksPerQuestion,

          negativeMarking: {
            enabled: exam.negativeMarking?.enabled ?? false,

            penalty: exam.negativeMarking?.penalty ?? 0,
          },

          mode: exam.mode,

          status: exam.status,

          startDate: exam.startDate ? exam.startDate.toISOString() : null,

          deadlineDate: exam.deadlineDate
            ? exam.deadlineDate.toISOString()
            : null,

          examType: isSpecial ? "SPECIAL" : "COMMON",

          examMode: isStrict ? "STRICT" : "NORMAL",

          strictDeadlineDate: strictExam?.deadlineDate
            ? strictExam.deadlineDate.toISOString()
            : null,

          strictAttemptChances: strictExam?.attemptChances ?? null,
        },

        attempt: {
          attemptNo: attempt.attemptNo,

          startTime: attempt.startTime.toISOString(),

          submittedAt: attempt.submittedAt
            ? attempt.submittedAt.toISOString()
            : null,

          status: attempt.status,

          score,

          totalMarks,

          correctAnswers: Number(attempt.correctAnswers) || 0,

          wrongAnswers: Number(attempt.wrongAnswers) || 0,

          unanswered: Number(attempt.unanswered) || 0,

          timeTakenSeconds: Number(attempt.timeTakenSeconds) || 0,

          percentage: calculatePercentage(
            score,

            totalMarks,
          ),

          questions: attempt.questions.map((question) => ({
            questionId: question.questionId,

            question: question.question,

            options: question.options,

            questionType: question.questionType,

            selectedAnswers: question.selectedAnswers,

            correctAnswers: question.correctAnswers,

            isCorrect: question.isCorrect,

            marksAwarded: question.marksAwarded,
          })),
        },

        resultReleaseDate: resultReleaseDate
          ? resultReleaseDate.toISOString()
          : null,
      };

      formattedAttempts.push(formatted);
    } /* =====================================================

         SORT

      ===================================================== */

    formattedAttempts.sort(
      (a, b) =>
        new Date(b.attempt.startTime).getTime() -
        new Date(a.attempt.startTime).getTime(),
    ); /* =====================================================

         OVERVIEW

      ===================================================== */

    const totalAttempts = formattedAttempts.length;

    const totalScore = formattedAttempts.reduce(
      (
        sum,

        item,
      ) => sum + item.attempt.score,

      0,
    );

    const totalMarks = formattedAttempts.reduce(
      (
        sum,

        item,
      ) => sum + item.attempt.totalMarks,

      0,
    );

    const correctAnswers = formattedAttempts.reduce(
      (
        sum,

        item,
      ) => sum + item.attempt.correctAnswers,

      0,
    );

    const wrongAnswers = formattedAttempts.reduce(
      (
        sum,

        item,
      ) => sum + item.attempt.wrongAnswers,

      0,
    );

    const unanswered = formattedAttempts.reduce(
      (
        sum,

        item,
      ) => sum + item.attempt.unanswered,

      0,
    );

    const averagePercentage =
      totalMarks > 0 ? Number(((totalScore / totalMarks) * 100).toFixed(2)) : 0;

    const uniqueExamIds = new Set(formattedAttempts.map((item) => item.examId));

    const commonExams = new Set(
      formattedAttempts

        .filter((item) => item.exam.examType === "COMMON")

        .map((item) => item.examId),
    ).size;

    const specialExams = new Set(
      formattedAttempts

        .filter((item) => item.exam.examType === "SPECIAL")

        .map((item) => item.examId),
    ).size;

    const strictExamsCount = new Set(
      formattedAttempts

        .filter((item) => item.exam.examMode === "STRICT")

        .map((item) => item.examId),
    ).size; /* =====================================================

         RESULTS

      ===================================================== */

    const examResults = formattedAttempts.filter(
      (item) => item.exam.status === "EXPIRED",
    );

    const upcomingResults = formattedAttempts.filter(
      (item) => item.exam.status === "PUBLISHED",
    );

    res.status(200).json({
      success: true,

      student: {
        id: student._id.toString(),

        name: student.name,

        email: student.email,

        department: student.department ?? "",
      },

      overview: {
        totalExams: uniqueExamIds.size,

        totalAttempts,

        averagePercentage,

        totalScore,

        totalMarks,

        correctAnswers,

        wrongAnswers,

        unanswered,

        completedExams: uniqueExamIds.size,

        commonExams,

        specialExams,

        strictExams: strictExamsCount,
      },

      examResults,

      upcomingResults,
    });
  } catch (error) {
    console.error(
      "Get student performance error:",

      error,
    );

    res.status(500).json({
      success: false,

      message: "Failed to load student performance.",
    });
  }
};

/* =========================================================

   GET SINGLE ATTEMPT PERFORMANCE

\========================================================= */

export const getMyAttemptPerformance = async (
  req: Request,

  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,

        message: "Authentication required.",
      });

      return;
    }

    if (req.user.role !== "STUDENT") {
      res.status(403).json({
        success: false,

        message: "Only students can access performance.",
      });

      return;
    } /*

       * Express can type route params as

       * string | string[].

       *

       * Normalize it to a single string

       * before validating it with Mongoose.

       */

    const attemptId = Array.isArray(req.params.attemptId)
      ? req.params.attemptId[0]
      : req.params.attemptId;

    if (!attemptId || !mongoose.Types.ObjectId.isValid(attemptId)) {
      res.status(400).json({
        success: false,

        message: "Invalid attempt ID.",
      });

      return;
    } /* =====================================================

         CURRENT STUDENT

      ===================================================== */

    const student = await User.findOne({
      _id: req.user.userId,

      role: "STUDENT",

      isActive: true,
    }).select("_id name email department");

    if (!student) {
      res.status(404).json({
        success: false,

        message: "Student account not found.",
      });

      return;
    } /* =====================================================

         ONLY THIS STUDENT'S ATTEMPT

      ===================================================== */

    let attempt = await Attempt.findOne({
      _id: attemptId,

      studentId: student._id,

      studentEmail: student.email,

      studentDepartment: student.department,
    });

    if (!attempt) {
      res.status(404).json({
        success: false,

        message:
          "This examination result does not belong to the logged-in student.",
      });

      return;
    } /* =====================================================

         LOAD EXAM

      ===================================================== */

    const exam = await Exam.findOne({
      _id: attempt.examId,

      department: student.department,
    });

    if (!exam) {
      res.status(404).json({
        success: false,

        message: "The examination associated with this attempt was not found.",
      });

      return;
    } /* =====================================================

         USE ONLY HIGHEST SCORE AFTER RESULT RELEASE

      ===================================================== */

    if (exam.status === "EXPIRED" || exam.status === "CLOSED") {
      const completedAttempts = await Attempt.find({
        examId: exam._id,

        studentId: student._id,

        status: {
          $in: ["SUBMITTED", "AUTO_SUBMITTED"],
        },
      }).sort({
        score: -1,

        attemptNo: -1,
      });

      const highestScoringAttempt = completedAttempts[0];

      if (highestScoringAttempt) {
        attempt = highestScoringAttempt;
      }
    }

    /* =====================================================

         SPECIAL ASSIGNMENT

      ===================================================== */

    const specialAssignment = await SpecialExamStudent.findOne({
      examId: exam._id,

      studentId: student._id,

      studentEmail: student.email,

      studentName: student.name,

      department: student.department,
    });

    const isSpecial =
      Boolean(
        specialAssignment,
      ); /* =====================================================

         STRICT EXAM

      ===================================================== */

    const strictExam = await StrictExam.findOne({
      examId: exam._id,
    });

    const isStrict = Boolean(strictExam);

    if (exam.mode === "SPECIAL" && !specialAssignment) {
      res.status(403).json({
        success: false,

        message:
          "This special examination is not assigned to the logged-in student.",
      });

      return;
    } /* =====================================================

         RESPONSE

      ===================================================== */

    const totalMarks = Number(attempt.totalMarks) || 0;

    const score = Number(attempt.score) || 0;

    const releaseDate = strictExam?.deadlineDate ?? exam.deadlineDate ?? null;

    res.status(200).json({
      success: true,

      student: {
        id: student._id.toString(),

        name: student.name,

        email: student.email,

        department: student.department ?? "",
      },

      exam: {
        id: exam._id.toString(),

        title: exam.title,

        description: exam.description,

        department: exam.department,

        durationMinutes: exam.durationMinutes,

        questionCount: exam.questionCount,

        marksPerQuestion: exam.marksPerQuestion,

        negativeMarking: {
          enabled: exam.negativeMarking?.enabled ?? false,

          penalty: exam.negativeMarking?.penalty ?? 0,
        },

        mode: exam.mode,

        status: exam.status,

        startDate: exam.startDate ? exam.startDate.toISOString() : null,

        deadlineDate: exam.deadlineDate
          ? exam.deadlineDate.toISOString()
          : null,

        examType: isSpecial ? "SPECIAL" : "COMMON",

        examMode: isStrict ? "STRICT" : "NORMAL",

        strictDeadlineDate: strictExam?.deadlineDate
          ? strictExam.deadlineDate.toISOString()
          : null,

        strictAttemptChances: strictExam?.attemptChances ?? null,

        resultReleaseDate: releaseDate ? releaseDate.toISOString() : null,
      },

      attempt: {
        id: attempt._id.toString(),

        attemptNo: attempt.attemptNo,

        startTime: attempt.startTime.toISOString(),

        submittedAt: attempt.submittedAt
          ? attempt.submittedAt.toISOString()
          : null,

        status: attempt.status,

        score,

        totalMarks,

        correctAnswers: attempt.correctAnswers,

        wrongAnswers: attempt.wrongAnswers,

        unanswered: attempt.unanswered,

        timeTakenSeconds: attempt.timeTakenSeconds,

        percentage: calculatePercentage(
          score,

          totalMarks,
        ),

        questions: attempt.questions.map((question) => ({
          questionId: question.questionId,

          question: question.question,

          options: question.options,

          questionType: question.questionType,

          selectedAnswers: question.selectedAnswers,

          correctAnswers: question.correctAnswers,

          isCorrect: question.isCorrect,

          marksAwarded: question.marksAwarded,
        })),
      },
    });
  } catch (error) {
    console.error(
      "Get single student attempt error:",

      error,
    );

    res.status(500).json({
      success: false,

      message: "Failed to load examination performance.",
    });
  }
};

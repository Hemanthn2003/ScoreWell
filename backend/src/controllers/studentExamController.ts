import type { Request, Response } from "express";

import mongoose from "mongoose";

import User from "../models/User";

import Exam from "../models/Exam";

import Attempt from "../models/Attempt";

import QuestionSet from "../models/Question";

import SpecialExamStudent from "../models/SpecialExamStudent";

import StrictExam from "../models/StrictExam";
import ExamActivity from "../models/ExamActivity";
import { finalizeStudentAttempt } from "./studentExamSubmissionController";

/* =========================================================

   HELPERS

\========================================================= */

const normalizeDepartment = (department?: string | null): string => {
  return (department ?? "")

    .normalize("NFKC")

    .replace(/[\u200B-\u200D\uFEFF]/g, "")

    .replace(/\u00A0/g, " ")

    .trim()

    .replace(/\s+/g, " ")

    .toLowerCase();
};

const cleanupExpiredExamAttempts = async (
  examId: mongoose.Types.ObjectId,
): Promise<void> => {
  const inProgressAttempts = await Attempt.find({
    examId,
    status: "IN_PROGRESS",
  }).select("_id studentId");

  for (const attempt of inProgressAttempts) {
    await finalizeStudentAttempt(
      attempt._id.toString(),
      attempt.studentId.toString(),
      "AUTO_SUBMITTED",
    );
  }

  const attempts = await Attempt.find({
    examId,
  }).sort({
    studentId: 1,
    score: -1,
    attemptNo: -1,
  });

  const attemptsByStudent = new Map<string, typeof attempts>();

  for (const attempt of attempts) {
    const studentKey = attempt.studentId.toString();
    const studentAttempts = attemptsByStudent.get(studentKey) ?? [];

    studentAttempts.push(attempt);
    attemptsByStudent.set(studentKey, studentAttempts);
  }

  const deleteIds: mongoose.Types.ObjectId[] = [];

  for (const studentAttempts of attemptsByStudent.values()) {
    const completedAttempts = studentAttempts.filter(
      (attempt) =>
        attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED",
    );

    if (completedAttempts.length === 0) {
      continue;
    }

    const highestAttemptNo = Math.max(
      ...completedAttempts.map((attempt) => Number(attempt.attemptNo || 1)),
    );

    const winner = [...completedAttempts].sort(
      (a, b) =>
        Number(b.score) - Number(a.score) ||
        Number(b.attemptNo) - Number(a.attemptNo),
    )[0];

    if (!winner) {
      continue;
    }

    if (Number(winner.attemptNo) !== highestAttemptNo) {
      winner.attemptNo = highestAttemptNo;
      await winner.save();
    }

    for (const attempt of studentAttempts) {
      if (attempt._id.toString() !== winner._id.toString()) {
        deleteIds.push(attempt._id);
      }
    }
  }

  if (deleteIds.length > 0) {
    await Attempt.deleteMany({
      _id: { $in: deleteIds },
    });
  }

  await ExamActivity.deleteMany({
    examId,
  });
};

export const syncExamStatuses = async (): Promise<void> => {
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
      $set: { status: "PUBLISHED" },
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
      $set: { status: "EXPIRED" },
    },
  );

  const expiredStrictExams = await StrictExam.find({
    deadlineDate: {
      $lte: now,
    },
  }).select("examId");

  if (expiredStrictExams.length > 0) {
    await Exam.updateMany(
      {
        _id: {
          $in: expiredStrictExams.map((item) => item.examId),
        },
        status: "PUBLISHED",
      },
      {
        $set: { status: "EXPIRED" },
      },
    );
  }

  const expiredExams = await Exam.find({
    status: "EXPIRED",
  }).select("_id");

  for (const exam of expiredExams) {
    await cleanupExpiredExamAttempts(exam._id);
  }
};

/* =========================================================

   GET AVAILABLE STUDENT EXAMS

\========================================================= */

export const getAvailableStudentExams = async (
  req: Request,

  res: Response,
): Promise<void> => {
  try {
    /* =====================================================

         AUTHENTICATION

      ===================================================== */

    if (!req.user || req.user.role !== "STUDENT") {
      res.status(403).json({
        success: false,

        message: "Only students can view available examinations.",
      });

      return;
    }

    const studentId = req.user.userId;

    /* =====================================================

         VALIDATE STUDENT ID

      ===================================================== */

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      res.status(400).json({
        success: false,

        message: "Invalid student ID.",
      });

      return;
    }

    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    /* =====================================================

         GET STUDENT

      ===================================================== */

    const student = await User.findOne({
      _id: studentObjectId,

      role: "STUDENT",
    }).lean();

    if (!student) {
      res.status(404).json({
        success: false,

        message: "Student account was not found.",
      });

      return;
    }

    if (student.isPermitted !== true) {
      res.status(403).json({
        success: false,

        message:
          "Your student account is not permitted to attempt examinations.",
      });

      return;
    }

    if (!student.department) {
      res.status(400).json({
        success: false,

        message: "Student department is not configured.",
      });

      return;
    }

    /* =====================================================

         SYNC EXAM STATUS

      ===================================================== */

    await syncExamStatuses();

    const now = new Date();

    /* =====================================================

         GET EXAMS

      ===================================================== */

    const exams = await Exam.find({
      status: "PUBLISHED",
    })

      .sort({
        startDate: 1,
      })

      .lean();

    /* =====================================================

         GET SPECIAL EXAM ASSIGNMENTS

      ===================================================== */

    const specialAssignments = await SpecialExamStudent.find({
      studentId: studentObjectId,
    }).lean();

    const specialExamIds = new Set(
      specialAssignments.map((assignment) => assignment.examId.toString()),
    );

    /* =====================================================

         GET STRICT EXAMS

      ===================================================== */

    const strictExams = await StrictExam.find({}).lean();

    const strictExamMap = new Map<string, (typeof strictExams)[number]>();

    for (const strictExam of strictExams) {
      strictExamMap.set(
        strictExam.examId.toString(),

        strictExam,
      );
    }

    /* =====================================================

         GET STUDENT ATTEMPTS

      ===================================================== */

    const attempts = await Attempt.find({
      studentId: studentObjectId,
    })

      .sort({
        attemptNo: 1,
      })

      .lean();

    /* =====================================================

         GROUP ATTEMPTS BY EXAM

      ===================================================== */

    const attemptsByExam = new Map<string, typeof attempts>();

    for (const attempt of attempts) {
      const examId = attempt.examId.toString();

      const existing = attemptsByExam.get(examId) ?? [];

      existing.push(attempt);

      attemptsByExam.set(
        examId,

        existing,
      );
    }

    /* =====================================================

         BUILD AVAILABLE EXAMS

      ===================================================== */

    const availableExams: Array<{
      _id: unknown;

      title: string;

      description?: string;

      department: string;

      durationMinutes: number;

      questionCount: number;

      marksPerQuestion: number;

      negativeMarking: {
        enabled: boolean;

        penalty: number;
      };

      mode: string;

      examType: "NORMAL" | "STRICT";

      maxAttempts: number;

      attemptsUsed: number;

      attemptsRemaining: number;

      startDate: string | null;

      deadlineDate: string | null;

      inProgressAttempt: {
        attemptId: string;

        attemptNo: number;

        startTime: string;

        status: string;
      } | null;
    }> = [];

    const studentDepartment = normalizeDepartment(student.department);

    for (const exam of exams) {
      const examId = exam._id.toString();

      /* =================================================

           DEPARTMENT MATCH

        ================================================= */

      const examDepartment = normalizeDepartment(exam.department);

      if (studentDepartment !== examDepartment) {
        continue;
      }

      /* =================================================

           STRICT EXAM

        ================================================= */

      const strictExam = strictExamMap.get(examId);

      const isStrict = Boolean(strictExam);

      /* =================================================

           SPECIAL EXAM

        ================================================= */

      if (exam.mode === "SPECIAL" && !specialExamIds.has(examId)) {
        continue;
      }

      /* =================================================

           START DATE

        ================================================= */

      if (
        exam.startDate &&
        new Date(exam.startDate).getTime() > now.getTime()
      ) {
        continue;
      }

      /* =================================================

           EFFECTIVE DEADLINE

        ================================================= */

      const effectiveDeadline =
        isStrict && strictExam?.deadlineDate
          ? strictExam.deadlineDate
          : exam.deadlineDate;

      if (
        effectiveDeadline &&
        new Date(effectiveDeadline).getTime() <= now.getTime()
      ) {
        continue;
      }

      /* =================================================
           STUDENT ATTEMPTS
        ================================================= */

      const studentAttempts = attemptsByExam.get(examId) ?? [];

      const completedAttempts = studentAttempts.filter(
        (attempt) =>
          attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED",
      );

      const attemptsUsed = completedAttempts.length;

      const allowedAttempts = isStrict
        ? Number(strictExam?.attemptChances ?? 1)
        : Number(exam.maxAttempts ?? 1);

      if (!Number.isFinite(allowedAttempts) || allowedAttempts <= 0) {
        continue;
      }

      if (attemptsUsed >= allowedAttempts) {
        continue;
      }

      /* =================================================
           IN-PROGRESS ATTEMPT
        ================================================= */

      const inProgressAttempt = studentAttempts
        .filter((attempt) => attempt.status === "IN_PROGRESS")
        .sort(
          (a, b) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
        )[0];

      /* =================================================
           CHECK IN-PROGRESS ATTEMPT TIMER
        ================================================= */

      if (inProgressAttempt) {
        const attemptDuration = Number(
          inProgressAttempt.durationMinutes ??
            (isStrict ? strictExam?.durationMinutes : exam.durationMinutes),
        );

        const activity = !isStrict
          ? await ExamActivity.findOne({
              attemptId: inProgressAttempt._id,
              studentId: studentObjectId,
            }).lean()
          : null;

        const attemptEndTime =
          activity?.pausedAt && !isStrict
            ? new Date(activity.pausedAt).getTime() +
              attemptDuration * 60 * 1000
            : new Date(inProgressAttempt.startTime).getTime() +
              attemptDuration * 60 * 1000;

        if (
          Number.isFinite(attemptDuration) &&
          attemptDuration > 0 &&
          attemptEndTime > now.getTime()
        ) {
          availableExams.push({
            _id: exam._id,
            title: exam.title,
            description: exam.description,
            department: exam.department,
            durationMinutes: attemptDuration,
            questionCount: Number(exam.questionCount),
            marksPerQuestion: Number(exam.marksPerQuestion),
            negativeMarking: {
              enabled: Boolean(exam.negativeMarking?.enabled),
              penalty: Number(exam.negativeMarking?.penalty ?? 0),
            },
            mode: exam.mode,
            examType: isStrict ? "STRICT" : "NORMAL",
            maxAttempts: allowedAttempts,
            attemptsUsed,
            attemptsRemaining: Math.max(0, allowedAttempts - attemptsUsed),
            startDate: exam.startDate
              ? new Date(exam.startDate).toISOString()
              : null,
            deadlineDate: effectiveDeadline
              ? new Date(effectiveDeadline).toISOString()
              : null,
            inProgressAttempt: {
              attemptId: inProgressAttempt._id.toString(),
              attemptNo: Number(inProgressAttempt.attemptNo),
              startTime: new Date(inProgressAttempt.startTime).toISOString(),
              status: inProgressAttempt.status,
            },
          });

          continue;
        }
      }

      /* =================================================

           DURATION

        ================================================= */

      const durationMinutes =
        isStrict && strictExam?.durationMinutes
          ? Number(strictExam.durationMinutes)
          : Number(exam.durationMinutes);

      /* =================================================

           ADD EXAM

        ================================================= */

      availableExams.push({
        _id: exam._id,

        title: exam.title,

        description: exam.description,

        department: exam.department,

        durationMinutes,

        questionCount: Number(exam.questionCount),

        marksPerQuestion: Number(exam.marksPerQuestion),

        negativeMarking: {
          enabled: Boolean(exam.negativeMarking?.enabled),

          penalty: Number(exam.negativeMarking?.penalty ?? 0),
        },

        mode: exam.mode,

        examType: isStrict ? "STRICT" : "NORMAL",

        maxAttempts: allowedAttempts,

        attemptsUsed,

        attemptsRemaining: Math.max(
          0,

          allowedAttempts - attemptsUsed,
        ),

        startDate: exam.startDate
          ? new Date(exam.startDate).toISOString()
          : null,

        deadlineDate: effectiveDeadline
          ? new Date(effectiveDeadline).toISOString()
          : null,

        inProgressAttempt: null,
      });
    }

    /* =====================================================

         RESPONSE

      ===================================================== */

    res.status(200).json({
      success: true,

      exams: availableExams,
    });
  } catch (error) {
    console.error(
      "Get available student exams error:",

      error,
    );

    res.status(500).json({
      success: false,

      message: "Failed to load available examinations.",
    });
  }
};

/* =========================================================

   START EXAM

\========================================================= */

export const startStudentExam = async (
  req: Request,

  res: Response,
): Promise<void> => {
  try {
    /* =====================================================

         AUTHENTICATION

      ===================================================== */

    if (!req.user || req.user.role !== "STUDENT") {
      res.status(403).json({
        success: false,

        message: "Only students can start an examination.",
      });

      return;
    }

    const studentId = req.user.userId;

    /* =====================================================

         VALIDATE EXAM ID

      ===================================================== */

    const examIdParam = Array.isArray(req.params.examId)
      ? req.params.examId[0]
      : req.params.examId;

    if (!examIdParam || !mongoose.Types.ObjectId.isValid(examIdParam)) {
      res.status(400).json({
        success: false,

        message: "Invalid examination ID.",
      });

      return;
    }

    const examObjectId = new mongoose.Types.ObjectId(examIdParam);

    /* =====================================================

         GET STUDENT

      ===================================================== */

    const student = await User.findOne({
      _id: studentId,

      role: "STUDENT",
    }).lean();

    if (!student) {
      res.status(404).json({
        success: false,

        message: "Student account was not found.",
      });

      return;
    }

    if (student.isPermitted !== true) {
      res.status(403).json({
        success: false,

        message:
          "Your student account is not permitted to attempt examinations.",
      });

      return;
    }

    if (!student.department) {
      res.status(400).json({
        success: false,

        message: "Student department is not configured.",
      });

      return;
    }

    /* =====================================================

         GET EXAM

      ===================================================== */

    const exam = await Exam.findById(examObjectId).lean();

    if (!exam) {
      res.status(404).json({
        success: false,

        message: "Examination was not found.",
      });

      return;
    }

    /* =====================================================

         DEPARTMENT VALIDATION

      ===================================================== */

    const studentDepartment = normalizeDepartment(student.department);

    const examDepartment = normalizeDepartment(exam.department);

    if (studentDepartment !== examDepartment) {
      res.status(403).json({
        success: false,

        message: "You are not eligible for this examination.",
      });

      return;
    }

    /* =====================================================

         EXAM STATUS

      ===================================================== */

    const now = new Date();

    if (exam.status !== "PUBLISHED") {
      res.status(400).json({
        success: false,

        message: "This examination is not currently available.",
      });

      return;
    }

    /* =====================================================

         NORMAL EXAM DEADLINE

      ===================================================== */

    if (
      exam.deadlineDate &&
      new Date(exam.deadlineDate).getTime() <= now.getTime()
    ) {
      res.status(400).json({
        success: false,

        message: "The examination deadline has passed.",
      });

      return;
    }

    /* =====================================================

         SPECIAL EXAM VALIDATION

      ===================================================== */

    if (exam.mode === "SPECIAL") {
      const assignment = await SpecialExamStudent.findOne({
        examId: examObjectId,

        studentId: new mongoose.Types.ObjectId(studentId),
      }).lean();

      if (!assignment) {
        res.status(403).json({
          success: false,

          message: "You are not assigned to this special examination.",
        });

        return;
      }
    }

    /* =====================================================

         STRICT EXAM

      ===================================================== */

    const strictExam = await StrictExam.findOne({
      examId: examObjectId,
    }).lean();

    const isStrict = Boolean(strictExam);

    if (
      strictExam?.deadlineDate &&
      new Date(strictExam.deadlineDate).getTime() <= now.getTime()
    ) {
      res.status(400).json({
        success: false,

        message: "The strict examination deadline has passed.",
      });

      return;
    }

    /* =====================================================

         DURATION

      ===================================================== */

    const durationMinutes =
      isStrict && strictExam?.durationMinutes
        ? Number(strictExam.durationMinutes)
        : Number(exam.durationMinutes);

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      res.status(400).json({
        success: false,

        message: "Invalid examination duration.",
      });

      return;
    }

    /* =====================================================
         GET STUDENT ATTEMPTS
      ===================================================== */

    const attempts = await Attempt.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      examId: examObjectId,
    })
      .sort({ attemptNo: 1 })
      .lean();

    const completedAttempts = attempts.filter(
      (attempt) =>
        attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED",
    ).length;

    const allowedAttempts =
      isStrict && strictExam
        ? Number(strictExam.attemptChances)
        : Number(exam.maxAttempts || 1);

    if (!Number.isFinite(allowedAttempts) || allowedAttempts <= 0) {
      res.status(400).json({
        success: false,
        message: "This examination has an invalid attempt configuration.",
      });
      return;
    }

    /* =====================================================
         CHECK EXISTING IN-PROGRESS ATTEMPT
      ===================================================== */

    const existingAttempts = await Attempt.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      examId: examObjectId,
      status: "IN_PROGRESS",
    }).sort({ startTime: -1 });

    const existingAttempt = existingAttempts[0];

    if (existingAttempt) {
      if (existingAttempts.length > 1) {
        for (const duplicate of existingAttempts.slice(1)) {
          for (const question of existingAttempt.questions) {
            if (question.selectedAnswers.length > 0) {
              continue;
            }

            const duplicateQuestion = duplicate.questions.find(
              (item) => item.questionId === question.questionId,
            );

            if (duplicateQuestion?.selectedAnswers?.length) {
              question.selectedAnswers = [...duplicateQuestion.selectedAnswers];
            }
          }
        }

        await existingAttempt.save();
        await Attempt.deleteMany({
          _id: {
            $in: existingAttempts.slice(1).map((attempt) => attempt._id),
          },
        });
        await ExamActivity.deleteMany({
          attemptId: {
            $in: existingAttempts.slice(1).map((attempt) => attempt._id),
          },
        });
      }
      const existingDuration = Number(
        existingAttempt.durationMinutes || durationMinutes,
      );

      const existingActivity = !isStrict
        ? await ExamActivity.findOne({
            attemptId: existingAttempt._id,
            studentId: new mongoose.Types.ObjectId(studentId),
          })
        : null;

      const attemptDeadline =
        existingActivity?.pausedAt && !isStrict
          ? new Date(existingActivity.pausedAt).getTime() +
            existingDuration * 60 * 1000
          : new Date(existingAttempt.startTime).getTime() +
            existingDuration * 60 * 1000;

      if (completedAttempts >= allowedAttempts) {
        await finalizeStudentAttempt(
          existingAttempt._id.toString(),
          studentId,
          "AUTO_SUBMITTED",
        );

        res.status(403).json({
          success: false,
          message: "You have used all allowed attempts for this examination.",
        });
        return;
      }

      if (attemptDeadline <= Date.now()) {
        await finalizeStudentAttempt(
          existingAttempt._id.toString(),
          studentId,
          "AUTO_SUBMITTED",
        );

        await ExamActivity.deleteOne({
          attemptId: existingAttempt._id,
        });
      } else {
        if (!isStrict) {
          const activity = existingActivity;

          if (activity?.pausedAt) {
            const pausedSeconds = Math.max(
              0,
              Math.floor(
                (Date.now() - new Date(activity.pausedAt).getTime()) / 1000,
              ),
            );

            if (pausedSeconds > 0) {
              existingAttempt.startTime = new Date(
                new Date(existingAttempt.startTime).getTime() +
                  pausedSeconds * 1000,
              );
            }

            activity.pausedAt = null;
            await activity.save();
            await existingAttempt.save();
          }
        }

        res.status(200).json({
          success: true,
          message: "Existing examination attempt resumed.",
          resumed: true,
          attempt: {
            id: existingAttempt._id.toString(),
            attemptNo: Number(existingAttempt.attemptNo),
            examId: existingAttempt.examId.toString(),
            examName: existingAttempt.examName,
            mode: existingAttempt.mode,
            examType:
              existingAttempt.examType || (isStrict ? "STRICT" : "NORMAL"),
            startTime: new Date(existingAttempt.startTime).toISOString(),
            durationMinutes: existingDuration,
            questionCount: existingAttempt.questions.length,
            totalMarks: existingAttempt.totalMarks,
            questions: existingAttempt.questions.map((question) => ({
              questionId: question.questionId,
              question: question.question,
              options: question.options,
              questionType: question.questionType,
              selectedAnswers: question.selectedAnswers,
            })),
          },
        });

        return;
      }
    }

    const refreshedAttempts = await Attempt.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      examId: examObjectId,
    })
      .sort({ attemptNo: 1 })
      .lean();

    const refreshedCompletedAttempts = refreshedAttempts.filter(
      (attempt) =>
        attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED",
    ).length;

    if (refreshedCompletedAttempts >= allowedAttempts) {
      res.status(403).json({
        success: false,
        message: "You have used all allowed attempts for this examination.",
      });
      return;
    }

    /* =====================================================

         QUESTION SET VALIDATION

      ===================================================== */

    const questionSetIds = Array.isArray(exam.questionSetIds)
      ? exam.questionSetIds
      : [];

    if (questionSetIds.length === 0) {
      res.status(400).json({
        success: false,

        message: "No question sets are configured for this examination.",
      });

      return;
    }

    /* =====================================================

         GET QUESTION SETS

      ===================================================== */

    const questionSets = await QuestionSet.find({
      _id: {
        $in: questionSetIds,
      },

      department: exam.department,

      isActive: true,
    }).lean();

    if (questionSets.length !== questionSetIds.length) {
      res.status(400).json({
        success: false,

        message:
          "One or more question sets configured for this examination are unavailable.",
      });

      return;
    }

    /* =====================================================
         COLLECT SELECTED EXAM QUESTIONS
      ===================================================== */

    type SourceQuestion = {
      questionSetId: string;
      questionId: string;
      question: string;
      options: string[];
      questionType: "SINGLE" | "MULTI";
      answer: string[];
    };

    const questionCount = Number(exam.questionCount);

    if (!Number.isFinite(questionCount) || questionCount <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid examination question count.",
      });
      return;
    }

    const examQuestionIds = Array.isArray(exam.questionIds)
      ? exam.questionIds.map((id) => String(id))
      : [];

    if (examQuestionIds.length !== questionCount) {
      res.status(400).json({
        success: false,
        message: `This examination is configured with ${questionCount} questions, but ${examQuestionIds.length} selected question IDs were found.`,
      });
      return;
    }

    const selectedQuestionIdSet = new Set(examQuestionIds);

    const allQuestions: SourceQuestion[] = [];

    for (const questionSet of questionSets) {
      const questions = Array.isArray(questionSet.questions)
        ? questionSet.questions
        : [];

      for (const question of questions) {
        const questionId = String(question._id);

        if (
          !question._id ||
          !question.question ||
          !Array.isArray(question.options) ||
          !Array.isArray(question.answer) ||
          (question.questionType !== "SINGLE" &&
            question.questionType !== "MULTI") ||
          !selectedQuestionIdSet.has(questionId)
        ) {
          continue;
        }

        allQuestions.push({
          questionSetId: String(questionSet._id),
          questionId,
          question: question.question,
          options: question.options,
          questionType: question.questionType,
          answer: question.answer,
        });
      }
    }

    if (allQuestions.length !== questionCount) {
      res.status(400).json({
        success: false,
        message: `This examination requires ${questionCount} selected questions, but ${allQuestions.length} valid selected questions are available.`,
      });
      return;
    }

    const selectedQuestions = [...allQuestions];

    for (let i = selectedQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedQuestions[i], selectedQuestions[j]] = [
        selectedQuestions[j],
        selectedQuestions[i],
      ];
    }

    /* =====================================================

         ATTEMPT NUMBER

      ===================================================== */

    const nextAttemptNo =
      refreshedAttempts.reduce(
        (
          maximum,

          attempt,
        ) =>
          Math.max(
            maximum,

            Number(attempt.attemptNo || 0),
          ),

        0,
      ) + 1;

    const startTime = new Date();

    /* =====================================================

         CREATE ATTEMPT QUESTIONS

      ===================================================== */

    const attemptQuestions = selectedQuestions.map((question) => ({
      questionId: question.questionId,

      question: question.question,

      options: question.options,

      questionType: question.questionType,

      selectedAnswers: [],

      correctAnswers: question.answer,

      isCorrect: false,

      marksAwarded: 0,
    }));

    /* =====================================================

         CREATE ATTEMPT

      ===================================================== */

    const attempt = await Attempt.create({
      studentId: new mongoose.Types.ObjectId(studentId),

      studentEmail: student.email,

      studentDepartment: student.department,

      examId: examObjectId,

      examName: exam.title,

      questionSetId: String(questionSetIds[0]),

      examDepartment: exam.department,

      instructorId: exam.instructorId,

      mode: exam.mode,

      examType: isStrict ? "STRICT" : "NORMAL",

      attemptNo: nextAttemptNo,

      startTime,

      submittedAt: null,

      status: "IN_PROGRESS",

      durationMinutes,

      questions: attemptQuestions,

      score: 0,

      totalMarks: questionCount * Number(exam.marksPerQuestion),

      correctAnswers: 0,

      wrongAnswers: 0,

      unanswered: questionCount,

      timeTakenSeconds: 0,
    });

    /* =====================================================

         RESPONSE

      ===================================================== */

    res.status(201).json({
      success: true,

      message: "Examination attempt started successfully.",

      resumed: false,

      attempt: {
        id: attempt._id.toString(),

        attemptNo: attempt.attemptNo,

        examId: attempt.examId.toString(),

        examName: attempt.examName,

        mode: attempt.mode,

        examType: attempt.examType,

        startTime: attempt.startTime.toISOString(),

        durationMinutes: attempt.durationMinutes,

        questionCount: attempt.questions.length,

        totalMarks: attempt.totalMarks,

        questions: attempt.questions.map((question) => ({
          questionId: question.questionId,

          question: question.question,

          options: question.options,

          questionType: question.questionType,

          selectedAnswers: [],
        })),
      },
    });
  } catch (error) {
    console.error(
      "Start student exam error:",

      error,
    );

    res.status(500).json({
      success: false,

      message: "Failed to start the examination.",
    });
  }
};

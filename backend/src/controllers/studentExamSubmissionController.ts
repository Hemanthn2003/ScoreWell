import type {
  Request,
  Response,
} from "express";
import mongoose from "mongoose";
import Attempt from "../models/Attempt";
import Exam from "../models/Exam";
const isSameAnswers = (
  selectedAnswers: string[],
  correctAnswers: string[]
): boolean => {
  if (selectedAnswers.length !== correctAnswers.length) {
    return false;
  }
  const selected = [...selectedAnswers].sort();
  const correct = [...correctAnswers].sort();
  return selected.every(
    (answer, index) => answer === correct[index]
  );
};
const getSingleString = (
  value: string | string[]
): string => {
  return Array.isArray(value)
    ? value[0] ?? ""
    : value;
};
export const saveStudentExamAnswer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (
      !req.user ||
      req.user.role !== "STUDENT"
    ) {
      res.status(403).json({
        success: false,
        message:
          "Only students can save examination answers.",
      });
      return;
    }
    const studentId = getSingleString(
      req.user.userId
    );
    const attemptId = getSingleString(
      req.params.attemptId
    );
    const questionId =
      typeof req.body.questionId === "string"
        ? req.body.questionId
        : "";
    const selectedAnswers = Array.isArray(
      req.body.selectedAnswers
    )
      ? req.body.selectedAnswers.filter(
          (answer: unknown): answer is string =>
            typeof answer === "string"
        )
      : [];
    if (
      !attemptId ||
      !mongoose.Types.ObjectId.isValid(attemptId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid attempt ID.",
      });
      return;
    }
    if (
      !studentId ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid student authentication.",
      });
      return;
    }
    if (!questionId) {
      res.status(400).json({
        success: false,
        message: "Question ID is required.",
      });
      return;
    }
    const attempt = await Attempt.findOne({
      _id: new mongoose.Types.ObjectId(attemptId),
      studentId: new mongoose.Types.ObjectId(studentId),
      status: "IN_PROGRESS",
    });
    if (!attempt) {
      res.status(404).json({
        success: false,
        message:
          "Active examination attempt was not found.",
      });
      return;
    }
    const question = attempt.questions.find(
      (item) =>
        item.questionId === questionId
    );
    if (!question) {
      res.status(404).json({
        success: false,
        message:
          "Question was not found in this examination attempt.",
      });
      return;
    }
    question.selectedAnswers = selectedAnswers;
    await attempt.save();
    res.status(200).json({
      success: true,
      message: "Answer saved successfully.",
    });
  } catch (error) {
    console.error(
      "Save student exam answer error:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Failed to save examination answer.",
    });
  }
};
export const finalizeStudentAttempt = async (
  attemptId: string,
  studentId: string,
  status: "SUBMITTED" | "AUTO_SUBMITTED"
) => {
  if (
    !mongoose.Types.ObjectId.isValid(attemptId) ||
    !mongoose.Types.ObjectId.isValid(studentId)
  ) {
    return null;
  }
  const attempt = await Attempt.findOne({
    _id: new mongoose.Types.ObjectId(attemptId),
    studentId: new mongoose.Types.ObjectId(studentId),
    status: "IN_PROGRESS",
  });
  if (!attempt) {
    return null;
  }
  const duplicateAttempts = await Attempt.find({
    _id: { $ne: attempt._id },
    studentId: attempt.studentId,
    examId: attempt.examId,
    attemptNo: attempt.attemptNo,
  });
  for (const duplicate of duplicateAttempts) {
    for (const question of attempt.questions) {
      if (question.selectedAnswers.length > 0) {
        continue;
      }
      const duplicateQuestion = duplicate.questions.find(
        (item) => item.questionId === question.questionId
      );
      if (duplicateQuestion?.selectedAnswers?.length) {
        question.selectedAnswers = [
          ...duplicateQuestion.selectedAnswers,
        ];
      }
    }
  }
  const exam = await Exam.findById(
    attempt.examId
  ).lean();
  if (!exam) {
    return null;
  }
  const submittedAt = new Date();
  const startTime = new Date(
    attempt.startTime
  ).getTime();
  const timeTakenSeconds = Math.max(
    0,
    Math.floor(
      (submittedAt.getTime() - startTime) /
        1000
    )
  );
  let score = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let unanswered = 0;
  const marksPerQuestion = Number(
    exam.marksPerQuestion
  );
  const negativeMarkingEnabled = Boolean(
    exam.negativeMarking?.enabled
  );
  const negativePenalty = Number(
    exam.negativeMarking?.penalty ?? 0
  );
  for (const question of attempt.questions) {
    const selectedAnswers =
      Array.isArray(question.selectedAnswers)
        ? question.selectedAnswers
        : [];
    const correctAnswerList =
      Array.isArray(question.correctAnswers)
        ? question.correctAnswers
        : [];
    if (selectedAnswers.length === 0) {
      question.isCorrect = false;
      question.marksAwarded = 0;
      unanswered += 1;
      continue;
    }
    const correct = isSameAnswers(
      selectedAnswers,
      correctAnswerList
    );
    if (correct) {
      question.isCorrect = true;
      question.marksAwarded =
        marksPerQuestion;
      score += marksPerQuestion;
      correctAnswers += 1;
    } else {
      question.isCorrect = false;
      const penalty =
        negativeMarkingEnabled
          ? negativePenalty
          : 0;
      question.marksAwarded = -penalty;
      score -= penalty;
      wrongAnswers += 1;
    }
  }
  attempt.score = score;
  attempt.correctAnswers = correctAnswers;
  attempt.wrongAnswers = wrongAnswers;
  attempt.unanswered = unanswered;
  attempt.submittedAt = submittedAt;
  attempt.status = status;
  attempt.timeTakenSeconds =
    timeTakenSeconds;
  const bestDuplicate = duplicateAttempts
    .filter(
      (item) =>
        item.status === "SUBMITTED" ||
        item.status === "AUTO_SUBMITTED"
    )
    .sort((a, b) => Number(b.score) - Number(a.score))[0];
  if (bestDuplicate && Number(bestDuplicate.score) > Number(attempt.score)) {
    attempt.score = bestDuplicate.score;
    attempt.correctAnswers = bestDuplicate.correctAnswers;
    attempt.wrongAnswers = bestDuplicate.wrongAnswers;
    attempt.unanswered = bestDuplicate.unanswered;
    attempt.timeTakenSeconds = bestDuplicate.timeTakenSeconds;
    attempt.questions = bestDuplicate.questions;
  }
  await attempt.save();
  if (duplicateAttempts.length > 0) {
    await Attempt.deleteMany({
      _id: {
        $in: duplicateAttempts.map((item) => item._id),
      },
    });
  }
  return attempt;
};
export const submitStudentExam = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (
      !req.user ||
      req.user.role !== "STUDENT"
    ) {
      res.status(403).json({
        success: false,
        message:
          "Only students can submit examinations.",
      });
      return;
    }
    const studentId = getSingleString(
      req.user.userId
    );
    const attemptId = getSingleString(
      req.params.attemptId
    );
    if (
      !attemptId ||
      !mongoose.Types.ObjectId.isValid(attemptId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid attempt ID.",
      });
      return;
    }
    if (
      !studentId ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      res.status(401).json({
        success: false,
        message:
          "Invalid student authentication.",
      });
      return;
    }
    const attempt = await finalizeStudentAttempt(
      attemptId,
      studentId,
      "SUBMITTED"
    );
    if (!attempt) {
      res.status(404).json({
        success: false,
        message:
          "Active examination attempt was not found.",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message:
        "Examination submitted successfully.",
      result: {
        attemptId: attempt._id.toString(),
        examId: attempt.examId.toString(),
        examName: attempt.examName,
        attemptNo: attempt.attemptNo,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        correctAnswers: attempt.correctAnswers,
        wrongAnswers: attempt.wrongAnswers,
        unanswered: attempt.unanswered,
        timeTakenSeconds:
          attempt.timeTakenSeconds,
        submittedAt:
          attempt.submittedAt?.toISOString() ??
          null,
      },
    });
  } catch (error) {
    console.error(
      "Submit student exam error:",
      error
    );
    res.status(500).json({
      success: false,
      message:
        "Failed to submit the examination.",
    });
  }
};

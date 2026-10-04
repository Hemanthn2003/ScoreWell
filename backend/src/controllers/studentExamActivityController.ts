import type { Request, Response } from "express";
import mongoose from "mongoose";

import Attempt from "../models/Attempt";
import ExamActivity from "../models/ExamActivity";
import { finalizeStudentAttempt } from "./studentExamSubmissionController";

export const recordStudentExamActivity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "STUDENT") {
      res.status(403).json({
        success: false,
        message:
          "Only students can report examination activity.",
      });
      return;
    }

    const studentId = req.user.userId;
    const attemptId = Array.isArray(req.params.attemptId)
      ? req.params.attemptId[0]
      : req.params.attemptId;

    if (
      !studentId ||
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !attemptId ||
      !mongoose.Types.ObjectId.isValid(attemptId)
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invalid examination activity request.",
      });
      return;
    }

    const attempt = await Attempt.findOne({
      _id: new mongoose.Types.ObjectId(attemptId),
      studentId: new mongoose.Types.ObjectId(studentId),
      status: "IN_PROGRESS",
    });

    if (!attempt) {
      res.status(200).json({
        success: true,
        autoSubmitted: true,
        alreadyClosed: true,
      });
      return;
    }

    const isStrict =
      attempt.examType === "STRICT";

    let activity = await ExamActivity.findOne({
      attemptId: attempt._id,
      studentId: new mongoose.Types.ObjectId(studentId),
    });

    if (activity && !isStrict && activity.pausedAt) {
      res.status(200).json({
        success: true,
        count: activity.count,
        autoSubmitted: false,
        paused: true,
      });
      return;
    }

    activity = await ExamActivity.findOneAndUpdate(
      {
        attemptId: attempt._id,
        studentId: new mongoose.Types.ObjectId(studentId),
        ...(isStrict ? {} : { pausedAt: null }),
      },
      {
        $set: {
          examId: attempt.examId,
          attemptNo: attempt.attemptNo,
          pausedAt: isStrict ? null : new Date(),
        },
        $inc: { count: 1 },
      },
      {
        new: true,
        upsert: !activity,
        setDefaultsOnInsert: true,
      }
    );

    if (!activity) {
      activity = await ExamActivity.findOne({
        attemptId: attempt._id,
        studentId: new mongoose.Types.ObjectId(studentId),
      });
    }

    if (!activity) {
      res.status(500).json({
        success: false,
        message: "Failed to create examination activity record.",
      });
      return;
    }

    if (
      isStrict ||
      activity.count >= 3
    ) {
      activity.pausedAt = null;
      await activity.save();

      const submittedAttempt =
        await finalizeStudentAttempt(
          attempt._id.toString(),
          studentId,
          "AUTO_SUBMITTED"
        );

      res.status(200).json({
        success: true,
        count: activity.count,
        autoSubmitted:
          Boolean(submittedAttempt),
      });
      return;
    }

    res.status(200).json({
      success: true,
      count: activity.count,
      autoSubmitted: false,
      paused: true,
    });
  } catch (error) {
    console.error(
      "Student exam activity error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to record examination activity.",
    });
  }
};

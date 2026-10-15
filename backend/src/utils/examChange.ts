import mongoose from "mongoose";

import Attempt from "../models/Attempt";
import Exam from "../models/Exam";
import ExamUpdateNotice from "../models/ExamUpdateNotice";
import { emitToUser } from "../socket/socketServer";

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const newChangeId = (): string =>
  new mongoose.Types.ObjectId().toString();

/* =========================================================
   DELETE STALE ATTEMPTS + CREATE STUDENT NOTICES
   + PUSH A LIVE NOTICE OVER SOCKET.IO

   An attempt is stale when its changeId does not match the
   exam's current changeId (missing counts as not matching).

   Legacy exams (no changeId yet, "") keep their legacy
   attempts, so deploying this does not wipe existing data.
========================================================= */

export const purgeStaleAttempts = async (exam: {
  _id: mongoose.Types.ObjectId;
  title: string;
  changeId?: string;
}): Promise<number> => {
  const currentId = exam.changeId ?? "";

  const staleFilter =
    currentId === ""
      ? { changeId: { $nin: ["", null] } }
      : { changeId: { $ne: currentId } };

  const stale = await Attempt.find({
    examId: exam._id,
    ...staleFilter,
  })
    .select("_id studentId")
    .lean();

  if (stale.length === 0) {
    return 0;
  }

  const studentIds = [
    ...new Set(stale.map((attempt) => attempt.studentId.toString())),
  ];

  await ExamUpdateNotice.bulkWrite(
    studentIds.map((studentId) => ({
      updateOne: {
        filter: {
          studentId: new mongoose.Types.ObjectId(studentId),
          examId: exam._id,
        },
        update: {
          $set: {
            examName: exam.title,
            changeId: currentId,
            seen: false,
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    })),
  );

  await Attempt.deleteMany({
    _id: { $in: stale.map((attempt) => attempt._id) },
  });

  /*
   * Notices and deletions are saved first, then each affected
   * student is notified immediately (no page refresh needed).
   */
  for (const studentId of studentIds) {
    emitToUser(studentId, "exam:updated", {
      examId: exam._id.toString(),
      examName: exam.title,
    });
  }

  return stale.length;
};

/* =========================================================
   AUTO-PUBLISH EXAMS WHOSE START DATE HAS ARRIVED

   If the exam was unpublished for more than one day,
   it gets a new changeId before being published.
========================================================= */

export const publishScheduledExams = async (): Promise<void> => {
  const now = new Date();

  const due = await Exam.find({
    status: "UNPUBLISHED",
    startDate: {
      $ne: null,
      $lte: now,
    },
  })
    .select("_id unpublishedAt")
    .lean();

  for (const item of due) {
    const longGap =
      item.unpublishedAt &&
      now.getTime() - new Date(item.unpublishedAt).getTime() > ONE_DAY_MS;

    const set: Record<string, unknown> = {
      status: "PUBLISHED",
      unpublishedAt: null,
    };

    if (longGap) {
      set.changeId = newChangeId();
    }

    const result = await Exam.updateOne(
      { _id: item._id, status: "UNPUBLISHED" },
      { $set: set },
    );

    if (result.modifiedCount > 0) {
      const fresh = await Exam.findById(item._id)
        .select("_id title changeId")
        .lean();

      if (fresh) {
        await purgeStaleAttempts(fresh);
      }
    }
  }
};
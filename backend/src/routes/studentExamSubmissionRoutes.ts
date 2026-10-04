import { Router } from "express";

import {
  authenticate,
} from "../middleware/authMiddleware";

import {
  saveStudentExamAnswer,
  submitStudentExam,
} from "../controllers/studentExamSubmissionController";

import {
  recordStudentExamActivity,
} from "../controllers/studentExamActivityController";

const router = Router();

router.use(authenticate);

router.patch(
  "/:attemptId/answer",
  saveStudentExamAnswer
);

router.post(
  "/:attemptId/submit",
  submitStudentExam
);

router.post(
  "/:attemptId/activity",
  recordStudentExamActivity
);

export default router;

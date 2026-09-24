import { Router } from "express";

import {
  authenticate,
} from "../middleware/authMiddleware";

import {
  getMyExams,
  getAvailableQuestionSets,
  getDepartmentStudents,
  createExam,
  updateExam,
  deleteExam,
  publishExam,
  unpublishExam,
} from "../controllers/examController";

const router =
  Router();

router.use(
  authenticate
);

router.get(
  "/",
  getMyExams
);

router.get(
  "/question-sets",
  getAvailableQuestionSets
);

router.get(
  "/students",
  getDepartmentStudents
);

router.post(
  "/",
  createExam
);

router.put(
  "/:id",
  updateExam
);

router.delete(
  "/:id",
  deleteExam
);

router.patch(
  "/:id/publish",
  publishExam
);

router.patch(
  "/:id/unpublish",
  unpublishExam
);

export default router;
import { Router } from "express";

import {
  authenticate,
} from "../middleware/authMiddleware";

import {
  getAvailableStudentExams,
  startStudentExam,
} from "../controllers/studentExamController";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  getAvailableStudentExams
);

router.post(
  "/:examId/start",
  startStudentExam
);

export default router;

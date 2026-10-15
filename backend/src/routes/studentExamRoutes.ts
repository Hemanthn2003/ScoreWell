import { Router } from "express";

import { authenticate } from "../middleware/authMiddleware";

import {
  getAvailableStudentExams,
  startStudentExam,
  acknowledgeExamUpdate,
} from "../controllers/studentExamController";

const router = Router();

router.use(authenticate);

router.get("/", getAvailableStudentExams);

router.post("/:examId/start", startStudentExam);

router.post("/:examId/ack-update", acknowledgeExamUpdate);

export default router;
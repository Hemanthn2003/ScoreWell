import { Router } from "express";

import {
  getPendingStudents,
  getDepartmentStudents,
  getStudentPerformance,
  acceptStudent,
  denyStudent,
} from "../controllers/studentRequestController";

import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  getPendingStudents
);

router.get(
  "/students",
  getDepartmentStudents
);

router.get(
  "/students/:id/performance",
  getStudentPerformance
);

router.patch(
  "/:id/accept",
  acceptStudent
);

router.patch(
  "/:id/deny",
  denyStudent
);

export default router;

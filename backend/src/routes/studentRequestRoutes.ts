import { Router } from "express";

import {
  getPendingStudents,
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

router.patch(
  "/:id/accept",
  acceptStudent
);

router.patch(
  "/:id/deny",
  denyStudent
);

export default router;

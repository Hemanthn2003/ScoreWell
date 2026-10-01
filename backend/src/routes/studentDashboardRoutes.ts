import { Router } from "express";

import {
  authenticate,
} from "../middleware/authMiddleware";

import {
  getStudentDashboard,
} from "../controllers/studentDashboardController";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  getStudentDashboard
);

export default router;
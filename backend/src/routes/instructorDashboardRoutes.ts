import { Router } from "express";

import {
  authenticate,
} from "../middleware/authMiddleware";

import {
  getInstructorDashboard,
} from "../controllers/instructorDashboardController";

const router = Router();

/* =====================================================
   AUTHENTICATION
===================================================== */

router.use(authenticate);

/* =====================================================
   INSTRUCTOR DASHBOARD
===================================================== */

router.get(
  "/",
  getInstructorDashboard
);

export default router;
import {
  Router,
} from "express";

import {
  authenticate,
} from "../middleware/authMiddleware";

import {
  getMyPerformance,
  getMyAttemptPerformance,
} from "../controllers/studentPerformanceController";

const router =
  Router();

router.use(
  authenticate
);

/*
 * Complete performance of
 * the currently logged-in student.
 */
router.get(
  "/",
  getMyPerformance
);

/*
 * Detailed performance of
 * one attempt belonging ONLY
 * to the currently logged-in student.
 */
router.get(
  "/attempt/:attemptId",
  getMyAttemptPerformance
);

export default router;
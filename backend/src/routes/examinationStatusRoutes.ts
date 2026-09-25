import { Router } from "express";

import {
  getInstructorExaminationStatus,
  getAttemptDetails,
} from "../controllers/examinationStatusController";

import {
  authenticate,
} from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

/*
  GET
  /api/examination-status
*/
router.get(
  "/",
  getInstructorExaminationStatus
);

/*
  GET
  /api/examination-status/attempt/:id
*/
router.get(
  "/attempt/:id",
  getAttemptDetails
);

export default router;
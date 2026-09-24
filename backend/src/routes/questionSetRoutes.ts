import { Router } from "express";

import {
  authenticate,
} from "../middleware/authMiddleware";

import {
  getMyQuestionSets,
  createQuestionSet,
  updateQuestionSet,
  deleteQuestionSet,
  publishQuestionSet,
  unpublishQuestionSet,
} from "../controllers/questionSetController";

const router =
  Router();

/* =========================================================
   AUTHENTICATION
========================================================= */

router.use(
  authenticate
);

/* =========================================================
   GET MY QUESTION SETS
========================================================= */

router.get(
  "/",
  getMyQuestionSets
);

/* =========================================================
   CREATE
========================================================= */

router.post(
  "/",
  createQuestionSet
);

/* =========================================================
   UPDATE
========================================================= */

router.put(
  "/:id",
  updateQuestionSet
);

/* =========================================================
   DELETE
========================================================= */

router.delete(
  "/:id",
  deleteQuestionSet
);

/* =========================================================
   PUBLISH
========================================================= */

router.patch(
  "/:id/publish",
  publishQuestionSet
);

/* =========================================================
   UNPUBLISH
========================================================= */

router.patch(
  "/:id/unpublish",
  unpublishQuestionSet
);

export default router;
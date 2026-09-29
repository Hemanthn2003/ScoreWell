import { Router } from "express";
import multer from "multer";

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
  importQuestionsFromPdf,
} from "../controllers/questionSetController";

const router = Router();

/* =========================================================
   PDF UPLOAD
========================================================= */

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPdf) {
      callback(
        new Error("Only PDF files are supported.")
      );
      return;
    }

    callback(null, true);
  },
});

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
   IMPORT QUESTIONS FROM PDF
========================================================= */

router.post(
  "/import-pdf",
  upload.single("pdf"),
  importQuestionsFromPdf
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

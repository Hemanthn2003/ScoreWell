import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./src/config/db";

import authRoutes from "./src/routes/authRoutes";

import questionSetRoutes from "./src/routes/questionSetRoutes";

import examRoutes from "./src/routes/examRoutes";

import examinationStatusRoutes from "./src/routes/examinationStatusRoutes";

import studentRequestRoutes from "./src/routes/studentRequestRoutes";

import instructorDashboardRoutes from "./src/routes/instructorDashboardRoutes";

const app = express();

const PORT =
  process.env.PORT || 5000;

/* =========================================================
   CORS
========================================================= */

app.use(
  cors({
    origin:
      "http://localhost:5173",

    credentials: true,
  })
);

/* =========================================================
   BODY PARSERS
========================================================= */

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =========================================================
   COOKIE PARSER
========================================================= */

app.use(
  cookieParser()
);

/* =========================================================
   ROOT
========================================================= */

app.get(
  "/",
  (_req, res) => {
    res.status(200).json({
      success: true,
      message:
        "ScoreWell backend is running.",
    });
  }
);

/* =========================================================
   AUTH
========================================================= */

app.use(
  "/api/auth",
  authRoutes
);

/* =========================================================
   QUESTION SETS
========================================================= */

app.use(
  "/api/question-sets",
  questionSetRoutes
);

/* =========================================================
   EXAMS
========================================================= */
app.use(
  "/api/instructor/dashboard",
  instructorDashboardRoutes
);

app.use(
  "/api/exams",
  examRoutes
);

app.use(
  "/api/examination-status",
  examinationStatusRoutes
);

app.use(
  "/api/student-requests",
  studentRequestRoutes
);
/* =========================================================
   START SERVER
========================================================= */

const startServer =
  async (): Promise<void> => {
    try {
      await connectDB();

      app.listen(
        PORT,
        () => {
          console.log(
            `ScoreWell backend running on http://localhost:${PORT}`
          );
        }
      );
    } catch (error) {
      console.error(
        "Failed to start server:",
        error
      );

      process.exit(1);
    }
  };

startServer();
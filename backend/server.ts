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
import studentPerformanceRoutes from "./src/routes/studentPerformanceRoutes";
import studentDashboardRoutes from "./src/routes/studentDashboardRoutes";
import studentExamRoutes from "./src/routes/studentExamRoutes";
import studentExamSubmissionRoutes from "./src/routes/studentExamSubmissionRoutes";

const app = express();

const PORT = process.env.PORT || 5000;

/* =========================================================
   CORS
========================================================= */

app.use(
  cors({
    origin: "http://localhost:5173",

    credentials: true,
  }),
);

/* =========================================================
   BODY PARSERS
========================================================= */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/* =========================================================
   COOKIES
========================================================= */

app.use(cookieParser());

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,

    message: "ScoreWell backend is running.",
  });
});

/* =========================================================
   AUTH
========================================================= */

app.use("/api/auth", authRoutes);

/* =========================================================
   QUESTION SETS
========================================================= */

app.use("/api/question-sets", questionSetRoutes);

/* =========================================================
   INSTRUCTOR DASHBOARD
========================================================= */

app.use("/api/instructor/dashboard", instructorDashboardRoutes);

/* =========================================================
   EXAMS
========================================================= */

app.use("/api/exams", examRoutes);

/* =========================================================
   INSTRUCTOR EXAMINATION STATUS
========================================================= */

app.use("/api/examination-status", examinationStatusRoutes);

/* =========================================================
   STUDENT REQUESTS
========================================================= */

app.use("/api/student-requests", studentRequestRoutes);

/* =========================================================
   STUDENT PERFORMANCE
========================================================= */

app.use("/api/student-performance", studentPerformanceRoutes);

/* =========================================================
   STUDENT DASHBOARD
========================================================= */

app.use("/api/student-dashboard", studentDashboardRoutes);

/* =========================================================
   STUDENT EXAMS
========================================================= */

app.use("/api/student-exams", studentExamRoutes);

app.use("/api/student-exam-submissions", studentExamSubmissionRoutes);

/* =========================================================
   START SERVER
========================================================= */

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`ScoreWell backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    process.exit(1);
  }
};

startServer();

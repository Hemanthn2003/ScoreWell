import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db";
import authRoutes from "./src/routes/authRoutes";
import adminRoutes from "./src/routes/adminRoutes";
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
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (_req, res) => res.status(200).json({ success: true, message: "ScoreWell backend is running." }));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/question-sets", questionSetRoutes);
app.use("/api/instructor/dashboard", instructorDashboardRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/examination-status", examinationStatusRoutes);
app.use("/api/student-requests", studentRequestRoutes);
app.use("/api/student-performance", studentPerformanceRoutes);
app.use("/api/student-dashboard", studentDashboardRoutes);
app.use("/api/student-exams", studentExamRoutes);
app.use("/api/student-exam-submissions", studentExamSubmissionRoutes);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`ScoreWell backend running on http://localhost:${PORT}`));
  } catch (error) {
    console.error("Failed to start ScoreWell backend:", error);
    process.exit(1);
  }
};
startServer();

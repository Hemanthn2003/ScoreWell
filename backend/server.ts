import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./src/config/db";
import authRoutes from "./src/routes/authRoutes";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ScoreWell backend is running.",
  });
});

app.use("/api/auth", authRoutes);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `ScoreWell backend running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    process.exit(1);
  }
};

startServer();
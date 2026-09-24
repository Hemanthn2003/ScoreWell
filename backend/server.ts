import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./src/config/db";
import authRoutes from "./src/routes/authRoutes";
import questionSetRoutes from "./src/routes/questionSetRoutes";

const app = express();

const PORT =
  process.env.PORT || 5000;

/* =========================================================
   CORS
========================================================= */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/* =========================================================
   BODY PARSERS
========================================================= */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =========================================================
   COOKIE PARSER
========================================================= */

app.use(cookieParser());

/* =========================================================
   ROOT ROUTE
========================================================= */

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message:
      "ScoreWell backend is running.",
  });
});

/* =========================================================
   AUTH ROUTES
========================================================= */

app.use(
  "/api/auth",
  authRoutes
);

/* =========================================================
   QUESTION SET ROUTES
========================================================= */

app.use(
  "/api/question-sets",
  questionSetRoutes
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
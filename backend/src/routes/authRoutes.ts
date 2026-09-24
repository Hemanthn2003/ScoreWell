import { Router } from "express";

import {
  login,
  register,
  refreshAccessToken,
  getCurrentUser,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../auth/authController";

import {
  getDepartments,
} from "../auth/departmentController";

import {
  authenticate,
} from "../middleware/authMiddleware";

const router = Router();

/* =========================
   DEPARTMENTS
========================= */

router.get(
  "/departments",
  getDepartments
);

/* =========================
   REGISTER
========================= */

router.post(
  "/register",
  register
);

/* =========================
   LOGIN
========================= */

router.post(
  "/login",
  login
);

/* =========================
   FORGOT PASSWORD
========================= */

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/verify-otp",
  verifyOtp
);

router.post(
  "/reset-password",
  resetPassword
);

/* =========================
   TOKEN
========================= */

router.post(
  "/refresh",
  refreshAccessToken
);

/* =========================
   CURRENT USER
========================= */

router.get(
  "/me",
  authenticate,
  getCurrentUser
);

/* =========================
   LOGOUT
========================= */

router.post(
  "/logout",
  authenticate,
  logout
);

export default router;
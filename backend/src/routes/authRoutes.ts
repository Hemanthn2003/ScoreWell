import { Router } from "express";
import {
  login, register, refreshAccessToken, getCurrentUser, logout,
  forgotPassword, verifyOtp, resetPassword,
} from "../auth/authController";
import { getDepartments } from "../auth/departmentController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();
router.get("/departments", getDepartments);
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/refresh", refreshAccessToken);
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", authenticate, logout);
export default router;

import type { NextFunction, Request, Response } from "express";
import { clearAuthCookies, verifyAccessToken } from "../auth/authUtils";
import type { UserRole } from "../models/User";
import User from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email: string; role: UserRole };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accessToken = req.cookies?.scorewell_access_token;
    if (!accessToken) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded.email || !decoded.userId || !decoded.role) {
      res.status(401).json({ success: false, message: "Access token is invalid." });
      return;
    }

    const user = await User.findById(decoded.userId).select("email role isActive isPermitted");
    if (!user || user.email !== decoded.email || user.role !== decoded.role) {
      res.status(401).json({ success: false, message: "User account is no longer available." });
      return;
    }
    if (!user.isActive) {
      clearAuthCookies(res);
      res.status(401).json({ success: false, message: "Your session is no longer active. Please login again." });
      return;
    }
    if ((user.role === "STUDENT" || user.role === "INSTRUCTOR") && user.isPermitted !== true) {
      clearAuthCookies(res);
      res.status(403).json({ success: false, message: "Your account permission has been revoked." });
      return;
    }

    req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Access token is invalid or expired." });
  }
};

export const authorizeRoles = (...allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: "You do not have permission to access this resource." });
      return;
    }
    next();
  };

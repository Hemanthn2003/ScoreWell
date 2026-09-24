import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  verifyAccessToken,
} from "../auth/authUtils";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role:
          | "STUDENT"
          | "INSTRUCTOR";
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const accessToken =
      req.cookies?.scorewell_access_token;

    if (!accessToken) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });

      return;
    }

    const decoded =
      verifyAccessToken(accessToken);

    if (!decoded.email) {
      res.status(401).json({
        success: false,
        message: "Access token does not contain a valid email.",
      });

      return;
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message:
        "Access token is invalid or expired.",
    });
  }
};
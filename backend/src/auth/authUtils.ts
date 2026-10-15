import type { Response } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "../models/User";

export interface JwtPayload {
  userId: string;
  email?: string;
  role: UserRole;
}

const accessSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

const requireSecret = (secret: string | undefined, name: string): string => {
  if (!secret) throw new Error(`${name} is not configured.`);
  return secret;
};

export const generateAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, requireSecret(accessSecret, "ACCESS_TOKEN_SECRET"), { expiresIn: "1d" });

export const generateRefreshToken = (payload: JwtPayload, rememberMe = false): string =>
  jwt.sign(payload, requireSecret(refreshSecret, "REFRESH_TOKEN_SECRET"), {
    expiresIn: rememberMe ? "30d" : "3d",
  });

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, requireSecret(accessSecret, "ACCESS_TOKEN_SECRET")) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, requireSecret(refreshSecret, "REFRESH_TOKEN_SECRET")) as JwtPayload;

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  path: "/",
});

export const setAccessCookie = (res: Response, accessToken: string): void => {
  res.cookie("scorewell_access_token", accessToken, {
    ...cookieOptions(),
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
  rememberMe = false,
): void => {
  setAccessCookie(res, accessToken);
  res.cookie("scorewell_refresh_token", refreshToken, {
    ...cookieOptions(),
    maxAge: (rememberMe ? 30 : 3) * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res: Response): void => {
  const options = cookieOptions();
  res.clearCookie("scorewell_access_token", options);
  res.clearCookie("scorewell_refresh_token", options);
};
